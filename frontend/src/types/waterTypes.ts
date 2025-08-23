export interface DataPoint {
  t: string;
  ph: number;
  ntu: number;
  tds: number;
}

export interface WaterContext {
  deviceId: string;
  currentReadings: DataPoint;
  issues: string[];
  hasIssues: boolean;
}

export interface Alert {
  id: string;
  type: 'error' | 'warning';
  message: string;
  parameter: 'pH' | 'Turbidity' | 'TDS';
}

export interface WaterQualityThresholds {
  ph: {
    min: number;
    max: number;
    critical: number;
  };
  turbidity: {
    max: number;
    critical: number;
  };
  tds: {
    max: number;
    critical: number;
  };
}
