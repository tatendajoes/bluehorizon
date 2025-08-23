import { useState, useEffect } from 'react';
import { DataPoint, WaterContext, WaterQualityThresholds } from '../types/waterTypes';

const WATER_THRESHOLDS: WaterQualityThresholds = {
  ph: {
    min: 6.5,
    max: 8.5,
    critical: 6.0
  },
  turbidity: {
    max: 5.0,
    critical: 10.0
  },
  tds: {
    max: 500,
    critical: 1000
  }
};

export function useWaterData() {
  const [waterData, setWaterData] = useState<DataPoint[]>([]);
  const [currentContext, setCurrentContext] = useState<WaterContext>({
    deviceId: 'WQ-001',
    currentReadings: { t: '', ph: 0, ntu: 0, tds: 0 },
    issues: [],
    hasIssues: false
  });

  const generateMockData = (): DataPoint[] => {
    const data: DataPoint[] = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        t: time.toISOString(),
        ph: 7.0 + (Math.random() - 0.5) * 2, // 6.0 - 8.0
        ntu: Math.random() * 8, // 0 - 8
        tds: 200 + Math.random() * 400 // 200 - 600
      });
    }
    
    return data;
  };

  const checkIssues = (readings: DataPoint): string[] => {
    const issues: string[] = [];
    
    if (readings.ph < WATER_THRESHOLDS.ph.min || readings.ph > WATER_THRESHOLDS.ph.max) {
      issues.push(`pH level ${readings.ph.toFixed(1)} is outside safe range (${WATER_THRESHOLDS.ph.min}-${WATER_THRESHOLDS.ph.max})`);
    }
    
    if (readings.ntu > WATER_THRESHOLDS.turbidity.max) {
      issues.push(`Turbidity ${readings.ntu.toFixed(1)} NTU exceeds limit (${WATER_THRESHOLDS.turbidity.max} NTU)`);
    }
    
    if (readings.tds > WATER_THRESHOLDS.tds.max) {
      issues.push(`TDS ${readings.tds.toFixed(0)} ppm exceeds limit (${WATER_THRESHOLDS.tds.max} ppm)`);
    }
    
    return issues;
  };

  const refreshData = () => {
    const newData = generateMockData();
    const latestReading = newData[newData.length - 1];
    const issues = checkIssues(latestReading);
    
    setWaterData(newData);
    setCurrentContext({
      deviceId: 'WQ-001',
      currentReadings: latestReading,
      issues,
      hasIssues: issues.length > 0
    });
  };

  useEffect(() => {
    refreshData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(refreshData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    waterData,
    currentContext,
    refreshData,
    thresholds: WATER_THRESHOLDS
  };
}
