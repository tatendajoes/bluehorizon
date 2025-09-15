-- Insert sample water quality data into Supabase
-- Run this in your Supabase SQL Editor after setting up the schema

-- Insert sample data for the last 24 hours (hourly readings)
INSERT INTO sensor_data (device_id, timestamp, ph, turbidity, tds, temperature, dissolved_oxygen) VALUES
-- Recent data (last 24 hours)
('well-01', NOW() - INTERVAL '1 hour', 7.2, 1.5, 245, 22.5, 8.2),
('well-01', NOW() - INTERVAL '2 hours', 7.1, 1.6, 248, 22.3, 8.1),
('well-01', NOW() - INTERVAL '3 hours', 7.3, 1.4, 242, 22.7, 8.3),
('well-01', NOW() - INTERVAL '4 hours', 7.0, 1.7, 250, 22.1, 8.0),
('well-01', NOW() - INTERVAL '5 hours', 7.2, 1.5, 246, 22.4, 8.2),
('well-01', NOW() - INTERVAL '6 hours', 7.1, 1.8, 252, 22.0, 7.9),
('well-01', NOW() - INTERVAL '7 hours', 7.3, 1.3, 241, 22.8, 8.4),
('well-01', NOW() - INTERVAL '8 hours', 7.2, 1.6, 247, 22.5, 8.1),
('well-01', NOW() - INTERVAL '9 hours', 7.0, 1.9, 254, 21.9, 7.8),
('well-01', NOW() - INTERVAL '10 hours', 7.4, 1.2, 238, 23.1, 8.5),
('well-01', NOW() - INTERVAL '11 hours', 7.1, 1.7, 249, 22.2, 8.0),
('well-01', NOW() - INTERVAL '12 hours', 7.2, 1.5, 245, 22.6, 8.2),
('well-01', NOW() - INTERVAL '13 hours', 7.3, 1.4, 243, 22.9, 8.3),
('well-01', NOW() - INTERVAL '14 hours', 7.1, 1.8, 251, 21.8, 7.9),
('well-01', NOW() - INTERVAL '15 hours', 7.0, 2.0, 256, 21.5, 7.7),
('well-01', NOW() - INTERVAL '16 hours', 7.2, 1.6, 248, 22.3, 8.1),
('well-01', NOW() - INTERVAL '17 hours', 7.4, 1.3, 240, 23.0, 8.4),
('well-01', NOW() - INTERVAL '18 hours', 7.1, 1.7, 250, 22.1, 8.0),
('well-01', NOW() - INTERVAL '19 hours', 7.3, 1.4, 244, 22.7, 8.3),
('well-01', NOW() - INTERVAL '20 hours', 7.2, 1.5, 246, 22.4, 8.2),
('well-01', NOW() - INTERVAL '21 hours', 7.0, 1.9, 253, 21.7, 7.8),
('well-01', NOW() - INTERVAL '22 hours', 7.1, 1.8, 249, 22.0, 7.9),
('well-01', NOW() - INTERVAL '23 hours', 7.3, 1.5, 247, 22.8, 8.1),
('well-01', NOW() - INTERVAL '24 hours', 7.2, 1.6, 245, 22.5, 8.2);

-- Insert some historical data for 7-day and 30-day views
INSERT INTO sensor_data (device_id, timestamp, ph, turbidity, tds, temperature, dissolved_oxygen) VALUES
-- Previous days (daily readings for longer history)
('well-01', NOW() - INTERVAL '2 days', 7.1, 1.7, 249, 21.8, 8.0),
('well-01', NOW() - INTERVAL '3 days', 7.3, 1.4, 243, 22.9, 8.3),
('well-01', NOW() - INTERVAL '4 days', 7.0, 1.8, 251, 21.5, 7.8),
('well-01', NOW() - INTERVAL '5 days', 7.2, 1.5, 246, 22.3, 8.1),
('well-01', NOW() - INTERVAL '6 days', 7.4, 1.3, 240, 23.1, 8.4),
('well-01', NOW() - INTERVAL '7 days', 7.1, 1.6, 248, 22.0, 7.9),
('well-01', NOW() - INTERVAL '8 days', 7.2, 1.7, 250, 22.5, 8.2),
('well-01', NOW() - INTERVAL '9 days', 7.3, 1.4, 244, 22.8, 8.3),
('well-01', NOW() - INTERVAL '10 days', 7.0, 1.9, 253, 21.6, 7.7),
('well-01', NOW() - INTERVAL '11 days', 7.1, 1.8, 249, 22.1, 8.0),
('well-01', NOW() - INTERVAL '12 days', 7.2, 1.5, 245, 22.4, 8.1),
('well-01', NOW() - INTERVAL '13 days', 7.4, 1.3, 241, 23.0, 8.4),
('well-01', NOW() - INTERVAL '14 days', 7.1, 1.6, 247, 22.2, 7.9),
('well-01', NOW() - INTERVAL '15 days', 7.3, 1.4, 243, 22.7, 8.3),
('well-01', NOW() - INTERVAL '20 days', 7.2, 1.7, 250, 22.0, 8.0),
('well-01', NOW() - INTERVAL '25 days', 7.1, 1.8, 248, 21.8, 7.9),
('well-01', NOW() - INTERVAL '30 days', 7.3, 1.5, 245, 22.5, 8.2);

-- Insert data for other devices too
INSERT INTO sensor_data (device_id, timestamp, ph, turbidity, tds, temperature, dissolved_oxygen) VALUES
('well-02', NOW() - INTERVAL '1 hour', 6.9, 2.1, 260, 21.8, 7.8),
('well-02', NOW() - INTERVAL '6 hours', 7.0, 2.0, 258, 22.0, 7.9),
('well-02', NOW() - INTERVAL '12 hours', 6.8, 2.3, 265, 21.5, 7.6),
('well-02', NOW() - INTERVAL '1 day', 7.1, 1.9, 255, 22.2, 8.0),
('tank-01', NOW() - INTERVAL '2 hours', 7.5, 0.8, 220, 23.5, 8.8),
('tank-01', NOW() - INTERVAL '8 hours', 7.4, 0.9, 225, 23.2, 8.7),
('tank-01', NOW() - INTERVAL '1 day', 7.6, 0.7, 218, 23.8, 8.9);