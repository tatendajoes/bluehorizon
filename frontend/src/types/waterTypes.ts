import React from 'react';

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

export interface WaterTip {
  id: string;
  title: string;
  description: string;
  category: 'immediate' | 'maintenance' | 'educational' | 'seasonal';
  priority: number;
  actionable: boolean;
  cost?: string;
  timeToComplete?: string;
  relatedParameter?: 'ph' | 'ntu' | 'tds';
  isCompleted?: boolean;
  isFavorited?: boolean;
  reasoning?: string; // AI explanation for why this tip is relevant
  icon?: React.ReactNode; // Icon component for the tip
}