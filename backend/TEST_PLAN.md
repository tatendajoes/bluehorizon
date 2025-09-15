# Water Trends API Test Plan

## Prerequisites
1. Backend server running on `http://localhost:3001`
2. Supabase database with `sensor_data` table
3. Sample data in the database

## Expected Database Schema
```sql
CREATE TABLE sensor_data (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT NOT NULL,
  ph FLOAT,
  turbidity FLOAT,
  tds FLOAT,
  temperature FLOAT,
  dissolved_oxygen FLOAT
);

-- Create index for performance
CREATE INDEX idx_sensor_data_device_time ON sensor_data(device_id, created_at);
```

## Test Cases

### 1. Basic Functionality Tests

#### Test 1.1: Valid 24h request
```bash
curl "http://localhost:3001/api/trends/WQ-001?range=24h"
```
**Expected Response:**
```json
{
  "deviceId": "WQ-001",
  "range": "24h",
  "data": [
    {
      "t": "2025-09-13T10:00:00.000Z",
      "ph": 7.2,
      "ntu": 1.5,
      "tds": 250,
      "temp": 22.5,
      "do": 8.2
    }
  ],
  "summary": {
    "totalReadings": 24,
    "timeRange": {
      "start": "2025-09-13T10:00:00.000Z",
      "end": "2025-09-14T10:00:00.000Z"
    },
    "parameters": {
      "ph": {
        "current": 7.2,
        "min": 6.8,
        "max": 7.6,
        "avg": 7.15,
        "median": 7.2,
        "trend": "stable"
      }
    }
  }
}
```

#### Test 1.2: Valid 7d request
```bash
curl "http://localhost:3001/api/trends/WQ-001?range=7d"
```

#### Test 1.3: Valid 30d request
```bash
curl "http://localhost:3001/api/trends/WQ-001?range=30d"
```

#### Test 1.4: Default range (should default to 24h)
```bash
curl "http://localhost:3001/api/trends/WQ-001"
```

### 2. Error Handling Tests

#### Test 2.1: Invalid range parameter
```bash
curl "http://localhost:3001/api/trends/WQ-001?range=invalid"
```
**Expected:** 400 error with message about valid ranges

#### Test 2.2: Non-existent device
```bash
curl "http://localhost:3001/api/trends/INVALID-DEVICE"
```
**Expected:** Empty data array with proper structure

#### Test 2.3: Device with no data
```bash
curl "http://localhost:3001/api/trends/EMPTY-DEVICE"
```
**Expected:** Empty data array with totalReadings: 0

### 3. Data Quality Tests

#### Test 3.1: Verify time filtering
- Insert test data outside the 24h window
- Confirm it's not returned in 24h requests

#### Test 3.2: Verify data ordering
- Check that data is returned in chronological order (oldest first)

#### Test 3.3: Verify null handling
- Test with records that have null values for some parameters
- Ensure they're handled gracefully in calculations

### 4. Performance Tests

#### Test 4.1: Large dataset performance
```bash
# Time the response for large datasets
time curl "http://localhost:3001/api/trends/WQ-001?range=30d"
```

#### Test 4.2: Concurrent requests
```bash
# Run multiple requests simultaneously
for i in {1..5}; do
  curl "http://localhost:3001/api/trends/WQ-001?range=24h" &
done
wait
```

## Sample Data Generator

### Insert test data into Supabase:
```sql
-- Insert sample data for the last 7 days
INSERT INTO sensor_data (device_id, ph, turbidity, tds, temperature, dissolved_oxygen, created_at)
SELECT 
  'WQ-001',
  6.5 + (RANDOM() * 2), -- pH between 6.5-8.5
  0.5 + (RANDOM() * 3), -- Turbidity 0.5-3.5 NTU
  200 + (RANDOM() * 100), -- TDS 200-300
  20 + (RANDOM() * 10), -- Temperature 20-30°C
  7 + (RANDOM() * 3), -- DO 7-10 mg/L
  NOW() - (interval '1 hour' * generate_series(0, 167)) -- Last 7 days, hourly
FROM generate_series(0, 167);
```

## Quick Test Script

Create `test-trends.sh`:
```bash
#!/bin/bash

echo "Testing Water Trends API..."
echo "=========================="

BASE_URL="http://localhost:3001/api/trends"

echo "1. Testing 24h range:"
curl -s "$BASE_URL/WQ-001?range=24h" | jq '.summary.totalReadings'

echo "2. Testing 7d range:"
curl -s "$BASE_URL/WQ-001?range=7d" | jq '.summary.totalReadings'

echo "3. Testing invalid range:"
curl -s "$BASE_URL/WQ-001?range=invalid" | jq '.error'

echo "4. Testing non-existent device:"
curl -s "$BASE_URL/FAKE-DEVICE" | jq '.summary.totalReadings'

echo "All tests completed!"
```

## Success Criteria

✅ **API responds within 500ms for 24h data**  
✅ **Proper error handling for invalid inputs**  
✅ **Correct time filtering for all ranges**  
✅ **Summary statistics are accurate**  
✅ **Trend calculations work correctly**  
✅ **No data loss or corruption**  
✅ **CORS headers allow frontend access**