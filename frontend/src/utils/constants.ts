export const WATER_QUALITY_CONSTANTS = {
  // pH thresholds
  PH_MIN: 6.5,
  PH_MAX: 8.5,
  PH_CRITICAL: 6.0,
  
  // Turbidity thresholds (NTU)
  TURBIDITY_MAX: 5.0,
  TURBIDITY_CRITICAL: 10.0,
  
  // TDS thresholds (ppm)
  TDS_MAX: 500,
  TDS_CRITICAL: 1000,
  
  // Refresh intervals
  AUTO_REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutes
  CHART_UPDATE_INTERVAL: 60 * 1000, // 1 minute
  
  // Device information
  DEFAULT_DEVICE_ID: 'WQ-001',
  DEVICE_NAME: 'Blue Horizon Pro',
  
  // Alert settings
  ALERT_AUTO_DISMISS_DELAY: 10000, // 10 seconds
  MAX_ALERTS_DISPLAY: 5
};

export const CHART_COLORS = {
  ph: '#3B82F6',      // Blue
  turbidity: '#10B981', // Green
  tds: '#F59E0B',     // Amber
  background: '#F8FAFC',
  grid: '#E2E8F0'
};

export const STATUS_COLORS = {
  good: '#10B981',    // Green
  warning: '#F59E0B', // Amber
  critical: '#EF4444', // Red
  offline: '#6B7280'  // Gray
};
