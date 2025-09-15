const express = require('express');
const supabase = require('../lib/supabaseClient');

const router = express.Router();

// GET /api/trends/:deviceId?range=24h|7d|30d
router.get('/:deviceId', async (req, res) => {
  const { deviceId } = req.params;
  const range = req.query.range || '24h';
  
  console.log(`[Trends API] Request for device: ${deviceId}, range: ${range}`);

  // Validate range parameter
  if (!['24h', '7d', '30d'].includes(range)) {
    return res.status(400).json({ 
      error: 'Invalid range parameter. Use: 24h, 7d, or 30d',
      received: range 
    });
  }

  try {
    // Calculate time range
    const timeMap = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };
    
    const timeSpan = timeMap[range];
    const startTime = new Date(Date.now() - timeSpan).toISOString();
    
    if (supabase) {
      console.log(`[Trends API] Querying Supabase from ${startTime}`);
      
      // Query real database
      const { data, error } = await supabase
        .from('sensor_data')
        .select('timestamp, ph, turbidity, tds, temperature, dissolved_oxygen')
        .eq('device_id', deviceId)
        .gte('timestamp', startTime)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('[Trends API] Supabase error:', error);
        throw error;
      }

      console.log(`[Trends API] Supabase returned ${data.length} records`);

      // Check if we have sufficient data
      const minDataPoints = getMinDataPoints(range);
      
      if (data.length >= minDataPoints) {
        // We have enough real data
        console.log(`[Trends API] Using real data (${data.length} points)`);
        return sendRealDataResponse(res, data, deviceId, range);
      } else {
        // Not enough real data - use hybrid approach
        console.log(`[Trends API] Insufficient real data (${data.length}/${minDataPoints}), using hybrid approach`);
        return sendHybridDataResponse(res, data, deviceId, range);
      }
      
    } else {
      console.log('[Trends API] Supabase not configured, using mock data');
      return sendMockDataResponse(res, deviceId, range);
    }
    
  } catch (error) {
    console.error('[Trends API] Error:', error);
    console.log('[Trends API] Falling back to mock data due to error');
    return sendMockDataResponse(res, deviceId, range);
  }
});

// Helper function to determine minimum data points needed
function getMinDataPoints(range) {
  const minimums = {
    '24h': 12,   // At least 12 hours of data
    '7d': 14,    // At least 2 days of data  
    '30d': 15    // At least half a month
  };
  return minimums[range] || 12;
}

// Send response with real database data
function sendRealDataResponse(res, data, deviceId, range) {
  const formatted = data.map(d => ({
    t: d.timestamp,
    ph: round2(d.ph || 0),
    ntu: round2(d.turbidity || 0),
    tds: Math.round(d.tds || 0),
    temp: round2(d.temperature || 0),
    do: round2(d.dissolved_oxygen || 0)
  }));

  const summary = calculateSummaryStats(formatted, range);
  
  res.json({
    deviceId,
    range,
    data: formatted,
    summary,
    dataSource: 'database',
    note: `Real data from Supabase (${data.length} readings)`
  });
}

// Send response with hybrid data (real + mock to fill gaps)
function sendHybridDataResponse(res, realData, deviceId, range) {
  // Use real data where available, fill gaps with realistic mock data
  const mockData = generateMockTrendData(range);
  
  // If we have some real data, use the latest values as baseline for mock generation
  let baseValues = {
    ph: 7.2,
    ntu: 1.5,
    tds: 250,
    temp: 22,
    do: 8.5
  };
  
  if (realData.length > 0) {
    const latest = realData[realData.length - 1];
    baseValues = {
      ph: latest.ph || baseValues.ph,
      ntu: latest.turbidity || baseValues.ntu,
      tds: latest.tds || baseValues.tds,
      temp: latest.temperature || baseValues.temp,
      do: latest.dissolved_oxygen || baseValues.do
    };
  }

  // Format real data
  const formattedReal = realData.map(d => ({
    t: d.timestamp,
    ph: round2(d.ph || 0),
    ntu: round2(d.turbidity || 0),
    tds: Math.round(d.tds || 0),
    temp: round2(d.temperature || 0),
    do: round2(d.dissolved_oxygen || 0)
  }));

  // Combine real and mock data to get full time range
  const neededPoints = getTargetDataPoints(range);
  const mockToAdd = Math.max(0, neededPoints - formattedReal.length);
  const additionalMock = mockData.slice(0, mockToAdd);
  
  // Adjust mock data timestamps to not overlap with real data
  if (formattedReal.length > 0) {
    const lastRealTime = new Date(formattedReal[formattedReal.length - 1].t).getTime();
    const interval = getTimeInterval(range);
    
    additionalMock.forEach((point, index) => {
      const newTime = new Date(lastRealTime + (index + 1) * interval);
      point.t = newTime.toISOString();
      // Blend mock values with real baseline
      point.ph = blendValue(point.ph, baseValues.ph, 0.7);
      point.ntu = blendValue(point.ntu, baseValues.ntu, 0.7);
      point.tds = Math.round(blendValue(point.tds, baseValues.tds, 0.7));
      point.temp = blendValue(point.temp, baseValues.temp, 0.7);
      point.do = blendValue(point.do, baseValues.do, 0.7);
    });
  }

  const combinedData = [...formattedReal, ...additionalMock];
  const summary = calculateSummaryStats(combinedData, range);
  
  res.json({
    deviceId,
    range,
    data: combinedData,
    summary,
    dataSource: 'hybrid',
    note: `Hybrid data: ${realData.length} real readings + ${additionalMock.length} simulated`
  });
}

// Send response with mock data only
function sendMockDataResponse(res, deviceId, range) {
  const mockData = generateMockTrendData(range);
  const summary = calculateSummaryStats(mockData, range);
  
  res.json({
    deviceId,
    range,
    data: mockData,
    summary,
    dataSource: 'mock',
    note: 'Using mock data - Supabase not configured'
  });
}

// Helper functions
function getTargetDataPoints(range) {
  const targets = {
    '24h': 24,   // Hourly data
    '7d': 28,    // 6-hour intervals  
    '30d': 30    // Daily data
  };
  return targets[range] || 24;
}

function getTimeInterval(range) {
  const intervals = {
    '24h': 60 * 60 * 1000,      // 1 hour
    '7d': 6 * 60 * 60 * 1000,   // 6 hours
    '30d': 24 * 60 * 60 * 1000  // 1 day
  };
  return intervals[range] || 60 * 60 * 1000;
}

function blendValue(mockValue, realValue, mockWeight) {
  return mockValue * mockWeight + realValue * (1 - mockWeight);
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

// Helper function to calculate summary statistics
function calculateSummaryStats(data, range) {
  if (!data || data.length === 0) return null;

  const stats = {
    totalReadings: data.length,
    timeRange: {
      start: data[0].t,
      end: data[data.length - 1].t
    },
    parameters: {}
  };

  // Calculate stats for each parameter
  const parameters = ['ph', 'ntu', 'tds', 'temp', 'do'];
  
  parameters.forEach(param => {
    const values = data.map(d => d[param]).filter(v => v !== null && !isNaN(v));
    
    if (values.length > 0) {
      const sorted = values.sort((a, b) => a - b);
      const min = sorted[0];
      const max = sorted[sorted.length - 1];
      const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
      const current = data[data.length - 1][param];
      
      // Simple trend calculation (comparing first vs last third of data)
      const firstThird = values.slice(0, Math.floor(values.length / 3));
      const lastThird = values.slice(-Math.floor(values.length / 3));
      const firstAvg = firstThird.reduce((sum, v) => sum + v, 0) / firstThird.length;
      const lastAvg = lastThird.reduce((sum, v) => sum + v, 0) / lastThird.length;
      
      let trend = 'stable';
      const change = ((lastAvg - firstAvg) / firstAvg) * 100;
      if (Math.abs(change) > 5) {
        trend = change > 0 ? 'increasing' : 'decreasing';
      }

      stats.parameters[param] = {
        current: round2(current),
        min: round2(min),
        max: round2(max),
        avg: round2(avg),
        trend
      };
    }
  });

  return stats;
}

// Generate mock data for development
function generateMockTrendData(range) {
  const hours = range === '24h' ? 24 : range === '7d' ? 168 : 720;
  const interval = range === '24h' ? 1 : range === '7d' ? 6 : 24; // Hours between readings
  
  const mockData = [];
  
  for (let i = 0; i < hours; i += interval) {
    const timestamp = new Date(Date.now() - (hours - i) * 60 * 60 * 1000);
    mockData.push({
      t: timestamp.toISOString(),
      ph: round2(7.0 + Math.sin(i / 12) * 0.3 + (Math.random() - 0.5) * 0.1),
      ntu: round2(1.5 + Math.cos(i / 8) * 0.5 + (Math.random() - 0.5) * 0.2),
      tds: Math.round(250 + Math.sin(i / 6) * 20 + (Math.random() - 0.5) * 5),
      temp: round2(22 + Math.sin(i / 24) * 3 + (Math.random() - 0.5) * 1),
      do: round2(8.0 + Math.cos(i / 16) * 1.0 + (Math.random() - 0.5) * 0.3)
    });
  }
  
  return mockData;
}

module.exports = router;