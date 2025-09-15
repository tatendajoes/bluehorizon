-- Blue Horizon Water Quality Database Schema
-- Run this in Supabase SQL Editor

-- Create sensor_data table
CREATE TABLE sensor_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ph DECIMAL(4,2),
    turbidity DECIMAL(6,2),
    tds INTEGER,
    temperature DECIMAL(5,2),
    dissolved_oxygen DECIMAL(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_sensor_data_device_timestamp ON sensor_data(device_id, timestamp DESC);
CREATE INDEX idx_sensor_data_timestamp ON sensor_data(timestamp DESC);

-- Create devices table for device management
CREATE TABLE devices (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(200),
    installation_date DATE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert sample devices
INSERT INTO devices (id, name, location, installation_date) VALUES
('well-01', 'Main Well Sensor', 'Primary Water Well - North Sector', '2025-01-15'),
('well-02', 'Backup Well Sensor', 'Secondary Water Well - South Sector', '2025-02-01'),
('tank-01', 'Storage Tank Monitor', 'Main Storage Tank', '2025-01-20');

-- Create function to automatically update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto-updating timestamps
CREATE TRIGGER update_sensor_data_updated_at BEFORE UPDATE ON sensor_data FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Optional: Insert some sample data for testing
INSERT INTO sensor_data (device_id, timestamp, ph, turbidity, tds, temperature, dissolved_oxygen) VALUES
('well-01', NOW() - INTERVAL '1 hour', 7.2, 1.5, 245, 22.5, 8.2),
('well-01', NOW() - INTERVAL '2 hours', 7.1, 1.6, 248, 22.3, 8.1),
('well-01', NOW() - INTERVAL '3 hours', 7.3, 1.4, 242, 22.7, 8.3);