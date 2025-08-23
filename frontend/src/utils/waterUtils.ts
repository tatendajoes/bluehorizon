import { DataPoint } from '../types/waterTypes';
import { WATER_QUALITY_CONSTANTS } from './constants';

export const formatTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getStatusColor = (value: number, parameter: 'ph' | 'turbidity' | 'tds'): string => {
  switch (parameter) {
    case 'ph':
      if (value < WATER_QUALITY_CONSTANTS.PH_CRITICAL || value > 9.0) return 'critical';
      if (value < WATER_QUALITY_CONSTANTS.PH_MIN || value > WATER_QUALITY_CONSTANTS.PH_MAX) return 'warning';
      return 'good';
    
    case 'turbidity':
      if (value > WATER_QUALITY_CONSTANTS.TURBIDITY_CRITICAL) return 'critical';
      if (value > WATER_QUALITY_CONSTANTS.TURBIDITY_MAX) return 'warning';
      return 'good';
    
    case 'tds':
      if (value > WATER_QUALITY_CONSTANTS.TDS_CRITICAL) return 'critical';
      if (value > WATER_QUALITY_CONSTANTS.TDS_MAX) return 'warning';
      return 'good';
    
    default:
      return 'good';
  }
};

export const calculateAverage = (data: DataPoint[], parameter: keyof Omit<DataPoint, 't'>): number => {
  if (data.length === 0) return 0;
  const sum = data.reduce((acc, point) => acc + point[parameter], 0);
  return sum / data.length;
};

export const calculateTrend = (data: DataPoint[], parameter: keyof Omit<DataPoint, 't'>): 'increasing' | 'decreasing' | 'stable' => {
  if (data.length < 2) return 'stable';
  
  const recent = data.slice(-5); // Last 5 data points
  const first = recent[0][parameter];
  const last = recent[recent.length - 1][parameter];
  const change = last - first;
  
  if (Math.abs(change) < 0.1) return 'stable';
  return change > 0 ? 'increasing' : 'decreasing';
};

export const getParameterUnit = (parameter: keyof Omit<DataPoint, 't'>): string => {
  switch (parameter) {
    case 'ph': return '';
    case 'ntu': return ' NTU';
    case 'tds': return ' ppm';
    default: return '';
  }
};

export const getParameterName = (parameter: keyof Omit<DataPoint, 't'>): string => {
  switch (parameter) {
    case 'ph': return 'pH Level';
    case 'ntu': return 'Turbidity';
    case 'tds': return 'Total Dissolved Solids';
    default: return parameter;
  }
};

export const exportDataToCSV = (data: DataPoint[]): void => {
  const headers = ['Timestamp', 'pH', 'Turbidity (NTU)', 'TDS (ppm)'];
  const csvContent = [
    headers.join(','),
    ...data.map(point => [
      formatDate(point.t),
      point.ph.toFixed(2),
      point.ntu.toFixed(2),
      point.tds.toFixed(0)
    ].join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `water-quality-data-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};
