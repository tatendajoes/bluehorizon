import React, { useMemo, useState, useCallback, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useTheme } from "../../contexts/ThemeContext";

// Types for better type safety
interface DataPoint {
  t: string;
  ph: number;
  ntu: number;
  tds: number;
}

interface WaterTrendsProps {
  deviceId?: string;
  refreshInterval?: number;
}

// Configuration from environment variables
const USE_BACKEND = process.env.REACT_APP_USE_BACKEND === 'true';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Custom hook for mock data generation (fallback)
function useWaterData() {
  return useMemo(() => {
    const now = Date.now();
    const points: DataPoint[] = [];
    
    // Generate 30 days of data with 2-hour intervals
    const stepMs = 2 * 60 * 60 * 1000; // 2 hours
    const total = (30 * 24 * 60 * 60 * 1000) / stepMs; // 30 days worth

    for (let i = total; i >= 0; i--) {
      const ts = new Date(now - i * stepMs);
      const base = Math.sin((i / total) * Math.PI * 4) * 0.3; // gentle waves over time
      const ph = clamp(7.1 + base * 0.5 + noise(0.05), 6.6, 8.4);
      const ntu = clamp(1.2 + (base + 0.2) * 1.4 + noise(0.25), 0.2, 8.5);
      const tds = clamp(240 + (base + 0.1) * 40 + noise(6), 160, 680);
      points.push({ 
        t: ts.toISOString(), 
        ph: round2(ph), 
        ntu: round2(ntu), 
        tds: Math.round(tds) 
      });
    }
    return points;
  }, []);
}

// Custom hook for backend data fetching
function useBackendData(deviceId: string, rangeOption: string) {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Map frontend range options to backend range format
  const getBackendRange = (range: string) => {
    switch (range) {
      case '7d':
        return '7d';
      case '30d':
        return '30d'; 
      case '90d':
        return '30d'; // Backend doesn't support 90d yet, use 30d
      case '24h':
        return '24h';
      case 'live':
        return '24h'; // Use 24h data for live view
      default:
        return '24h';
    }
  };

  const fetchData = useCallback(async () => {
    if (!USE_BACKEND) {
      console.log('[WaterTrends] Backend disabled, using mock data');
      return;
    }
    
    console.log(`[WaterTrends] Fetching data for device: ${deviceId}, range: ${rangeOption}`);
    setLoading(true);
    setError(null);
    
    try {
      const backendRange = getBackendRange(rangeOption);
      const url = `${API_URL}/api/trends/${deviceId}?range=${backendRange}`;
      console.log(`[WaterTrends] API Request: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log(`[WaterTrends] API Response:`, {
        dataPoints: result.data?.length || 0,
        deviceId: result.deviceId,
        range: result.range,
        timeSpan: rangeOption === '7d' ? '7 days' : rangeOption === '30d' ? '30 days' : rangeOption === '90d' ? '90 days' : rangeOption === '24h' ? '24 hours' : 'live',
        hasError: !!result.error
      });

      if (result.data) {
        // Transform backend data to frontend format
        // Backend returns: {t, ph, ntu, tds, temp, do}
        // Frontend expects: {t, ph, ntu, tds}
        const transformedData: DataPoint[] = result.data.map((item: any) => ({
          t: item.t,
          ph: round2(item.ph),
          ntu: round2(item.ntu),
          tds: Math.round(item.tds)
        }));
        
        console.log(`[WaterTrends] Successfully transformed ${transformedData.length} data points`);
        setData(transformedData);
      } else {
        throw new Error(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      console.error('[WaterTrends] Backend fetch failed:', {
        error: err instanceof Error ? err.message : 'Unknown error',
        deviceId,
        rangeOption,
        apiUrl: API_URL,
        fallback: 'Using mock data'
      });
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Don't set data here - let component fall back to mock data
    } finally {
      setLoading(false);
    }
  }, [deviceId, rangeOption]);

  useEffect(() => {
    if (USE_BACKEND) {
      fetchData();
    }
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export default function WaterTrends({ 
  deviceId = "well-01", 
  refreshInterval 
}: WaterTrendsProps) {
  const { theme } = useTheme();
  const [rangeOption, setRangeOption] = useState<'7d' | '30d' | '90d' | '24h' | 'live'>('24h');
  
  // Get mock data as fallback
  const mockData = useWaterData();
  
  // Get backend data when enabled
  const { data: backendData, loading, error, refetch } = useBackendData(deviceId, rangeOption);
  
  // Use backend data if available and not in error state, otherwise use mock data
  const data = USE_BACKEND && backendData.length > 0 && !error ? backendData : mockData;
  
  // Log data source for debugging
  useEffect(() => {
    const dataSource = USE_BACKEND 
      ? (backendData.length > 0 && !error ? 'backend' : 'mock (backend failed)')
      : 'mock (backend disabled)';
    console.log(`[WaterTrends] Data source: ${dataSource}, points: ${data.length}`);
  }, [data, backendData, error]);

  const sliced = useMemo(() => {
    let cutoffMs;
    switch (rangeOption) {
      case '7d':
        cutoffMs = 7 * 24 * 60 * 60 * 1000; // 7 days
        break;
      case '30d':
        cutoffMs = 30 * 24 * 60 * 60 * 1000; // 30 days
        break;
      case '90d':
        cutoffMs = 90 * 24 * 60 * 60 * 1000; // 90 days
        break;
      case '24h':
        cutoffMs = 24 * 60 * 60 * 1000; // 24 hours
        break;
      case 'live':
        cutoffMs = 3 * 60 * 60 * 1000; // Show last 3 hours for live view
        break;
      default:
        cutoffMs = 24 * 60 * 60 * 1000;
    }
    
    const cutoff = Date.now() - cutoffMs;
    return data.filter((d) => new Date(d.t).getTime() >= cutoff);
  }, [data, rangeOption]);

  const latest = sliced.at(-1) ?? data.at(-1);

  // Auto-refresh for live mode
  useEffect(() => {
    if (rangeOption === 'live') {
      const interval = setInterval(() => {
        if (USE_BACKEND && refetch) {
          refetch(); // Refresh backend data
        } else {
          // For mock data, just force a re-render by updating the key
          window.location.hash = Date.now().toString();
        }
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [rangeOption, refetch]);

  // Refresh handler for range changes
  useEffect(() => {
    if (USE_BACKEND && refetch) {
      refetch();
    }
  }, [rangeOption, refetch]);

  // Memoized handlers for each range option
  const handleRange7d = useCallback(() => setRangeOption('7d'), []);
  const handleRange30d = useCallback(() => setRangeOption('30d'), []);
  const handleRange90d = useCallback(() => setRangeOption('90d'), []);
  const handleRange24h = useCallback(() => setRangeOption('24h'), []);
  const handleRangeLive = useCallback(() => setRangeOption('live'), []);

  // Enhanced metric validation
  const getMetricStatus = useCallback((type: 'ph' | 'ntu' | 'tds', value: number) => {
    switch (type) {
      case 'ph':
        return value >= 6.5 && value <= 8.5 ? 'ok' : 'warning';
      case 'ntu':
        return value < 5 ? 'ok' : 'warning';
      case 'tds':
        return value > 500 ? 'high' : value < 200 ? 'low' : 'ok';
      default:
        return 'ok';
    }
  }, []);

  // Prefer a subtle grid color that works for both themes
  const gridStroke = theme === 'dark' ? "rgba(100,116,139,0.2)" : "rgba(0,0,0,0.1)";

  return (
    <div className="bg-white dark:bg-white/5 rounded-lg shadow-md dark:shadow-lg dark:backdrop-blur-md border border-gray-200 dark:border-white/10 p-6 text-gray-800 dark:text-gray-300">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Blue Horizon Trends</h3>
          <span className="rounded-full bg-gray-100 dark:bg-white/10 px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
            {deviceId}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <RangeChip 
            active={rangeOption === 'live'} 
            onClick={handleRangeLive}
            isLive={true}
          >
            Live
          </RangeChip>
          <RangeChip active={rangeOption === '24h'} onClick={handleRange24h}>
            24h
          </RangeChip>
          <RangeChip active={rangeOption === '7d'} onClick={handleRange7d}>
            7d
          </RangeChip>
          <RangeChip active={rangeOption === '30d'} onClick={handleRange30d}>
            30d
          </RangeChip>
          <RangeChip active={rangeOption === '90d'} onClick={handleRange90d}>
            90d
          </RangeChip>
        </div>
      </div>

      {/* Enhanced Stat row with status indicators */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <MetricCard 
          label="pH Level" 
          value={latest?.ph ?? "–"} 
          sublabel="6.5–8.5 optimal" 
          badgeClass="bg-indigo-500 dark:bg-indigo-400"
          status={latest ? getMetricStatus('ph', latest.ph) : 'ok'}
        />
        <MetricCard 
          label="Turbidity" 
          value={latest ? `${latest.ntu} NTU` : "–"} 
          sublabel="< 5 NTU optimal" 
          badgeClass="bg-sky-500 dark:bg-sky-400"
          status={latest ? getMetricStatus('ntu', latest.ntu) : 'ok'}
        />
        <MetricCard 
          label="Total Dissolved Solids" 
          value={latest ? `${latest.tds} ppm` : "–"} 
          sublabel="200-500 optimal" 
          badgeClass="bg-violet-500 dark:bg-violet-400"
          status={latest ? getMetricStatus('tds', latest.tds) : 'ok'}
        />
      </div>

      {/* Combined Area Chart */}
      <div className="h-80 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sliced} margin={{ left: 12, right: 12, top: 12, bottom: 12 }}>
            <defs>
              <linearGradient id="phFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme === 'dark' ? '#818cf8' : '#4f46e5'} stopOpacity={0.3} />
                <stop offset="95%" stopColor={theme === 'dark' ? '#818cf8' : '#4f46e5'} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="ntuFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme === 'dark' ? '#7dd3fc' : '#0ea5e9'} stopOpacity={0.25} />
                <stop offset="95%" stopColor={theme === 'dark' ? '#7dd3fc' : '#0ea5e9'} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="tdsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme === 'dark' ? '#a78bfa' : '#7c3aed'} stopOpacity={0.25} />
                <stop offset="95%" stopColor={theme === 'dark' ? '#a78bfa' : '#7c3aed'} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" />
            <XAxis
              dataKey="t"
              tickFormatter={timeShort}
              minTickGap={24}
              stroke={theme === 'dark' ? "#94a3b8" : "#6b7280"}
              tick={{ fontSize: 12, fill: theme === 'dark' ? "#94a3b8" : "#6b7280" }}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              stroke={theme === 'dark' ? "#94a3b8" : "#6b7280"}
              tick={{ fontSize: 12, fill: theme === 'dark' ? "#94a3b8" : "#6b7280" }}
              tickFormatter={(v) => `${v}`}
              width={40}
            />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 13, color: theme === 'dark' ? "#94a3b8" : "#4b5563" }} />

            <Area
              yAxisId="left"
              type="monotone"
              name="pH"
              dataKey="ph"
              stroke={theme === 'dark' ? '#818cf8' : '#4f46e5'} // indigo-400 / indigo-600
              strokeWidth={2}
              fill="url(#phFill)"
              dot={false}
              isAnimationActive={false}
            />
            <Area
              yAxisId="left"
              type="monotone"
              name="Turbidity (NTU)"
              dataKey="ntu"
              stroke={theme === 'dark' ? '#7dd3fc' : '#0ea5e9'} // sky-300 / sky-500
              strokeWidth={2}
              fill="url(#ntuFill)"
              dot={false}
              isAnimationActive={false}
            />
            <Area
              yAxisId="left"
              type="monotone"
              name="TDS (ppm)"
              dataKey="tds"
              stroke={theme === 'dark' ? '#a78bfa' : '#7c3aed'} // violet-400 / violet-600
              strokeWidth={2}
              fill="url(#tdsFill)"
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Enhanced footer with data info */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{sliced.length} data points</span>
        <span>Updated {timeShort(latest?.t || new Date().toISOString())}</span>
      </div>
    </div>
  );
}

interface RangeChipProps {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  isLive?: boolean;
}

function RangeChip({ active, onClick, children, isLive = false }: RangeChipProps) {
  return (
    <button
      onClick={onClick}
      className={
        "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors relative " +
        (active
          ? "border-gray-400 dark:border-white/20 bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-white/20"
          : "border-gray-300 dark:border-white/10 bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5")
      }
    >
      {children}
      {isLive && active && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      )}
    </button>
  );
}

interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  sublabel?: string;
  badgeClass?: string;
  status?: 'ok' | 'warning' | 'high' | 'low';
}

function MetricCard({ 
  label, 
  value, 
  sublabel, 
  badgeClass = "bg-gray-400",
  status = 'ok'
}: MetricCardProps) {
  const statusColors = {
    ok: 'text-gray-800 dark:text-green-400',
    warning: 'text-amber-600 dark:text-amber-400',
    high: 'text-red-600 dark:text-red-400',
    low: 'text-blue-600 dark:text-blue-400'
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
        <span className={`h-2 w-2 rounded-full ${badgeClass}`}></span>
      </div>
      <div className={`text-2xl font-bold ${status === 'ok' ? 'text-gray-900 dark:text-gray-100' : statusColors[status]}`}>
        {value}
      </div>
      {sublabel && <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{sublabel}</div>}
    </div>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  const { theme } = useTheme();
  if (!active || !payload || !payload.length) return null;
  const date = new Date(label);
  return (
    <div className="rounded-lg border border-gray-300 dark:border-white/10 bg-white/80 dark:bg-gray-800/80 p-3 text-sm shadow-lg backdrop-blur">
      <div className="mb-2 font-semibold text-gray-800 dark:text-gray-200">{timeMed(date)}</div>
      <div className="space-y-1">
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-6 text-gray-700 dark:text-gray-300">
            <span className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full" style={{ background: p.stroke }} />
              <span className="text-sm">{p.name}</span>
            </span>
            <span className="font-semibold tabular-nums">{p.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- utils ---
function timeShort(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function timeMed(d: Date) {
  return d.toLocaleString([], { 
    hour: "2-digit", 
    minute: "2-digit",
    month: "short",
    day: "numeric"
  });
}

function noise(n: number) { 
  return (Math.random() - 0.5) * 2 * n; 
}

function round2(n: number) { 
  return Math.round(n * 100) / 100; 
}

function clamp(n: number, lo: number, hi: number) { 
  return Math.max(lo, Math.min(hi, n)); 
}
