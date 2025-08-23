import React, { useMemo, useCallback } from "react";
import { AlertTriangle, CheckCircle, Lightbulb, TrendingUp, DollarSign, Clock } from "lucide-react";
import { useActions } from "../../contexts/ActionContext";

// Types from your existing component
interface DataPoint {
  t: string;
  ph: number;
  ntu: number;
  tds: number;
}

interface WaterStatusProps {
  deviceId?: string;
  data?: DataPoint[];
}

interface Issue {
  type: 'ph' | 'ntu' | 'tds';
  severity: 'warning' | 'high' | 'low';
  current: number;
  optimal: string;
  title: string;
  description: string;
}

interface Recommendation {
  priority: number;
  title: string;
  description: string;
  cost: string;
  timeline: string;
  type: 'immediate' | 'short-term' | 'maintenance';
}

// Reusing your data generation hook
function useWaterData() {
  return useMemo(() => {
    const now = Date.now();
    const points: DataPoint[] = [];
    const stepMs = 30 * 60 * 1000; // 30 minutes
    const total = (24 * 60 * 60 * 1000) / stepMs;

    for (let i = total; i >= 0; i--) {
      const ts = new Date(now - i * stepMs);
      const base = Math.sin((i / total) * Math.PI * 2) * 0.3;
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

export default function WaterStatus({ 
  deviceId = "well-01",
  data: externalData
}: WaterStatusProps) {
  const { handleGetQuote } = useActions();
  const generatedData = useWaterData();
  const data = externalData || generatedData;
  
  const latest = data[data.length - 1];

  // Enhanced metric validation matching your logic
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

  // Analyze current issues
  const issues = useMemo((): Issue[] => {
    if (!latest) return [];
    
    const problems: Issue[] = [];
    
    const phStatus = getMetricStatus('ph', latest.ph);
    if (phStatus !== 'ok') {
      problems.push({
        type: 'ph',
        severity: phStatus as 'warning',
        current: latest.ph,
        optimal: '6.5-8.5',
        title: latest.ph < 6.5 ? 'Low pH Level' : 'High pH Level',
        description: latest.ph < 6.5 ? 'Water is too acidic' : 'Water is too alkaline'
      });
    }
    
    const ntuStatus = getMetricStatus('ntu', latest.ntu);
    if (ntuStatus !== 'ok') {
      problems.push({
        type: 'ntu',
        severity: ntuStatus as 'warning',
        current: latest.ntu,
        optimal: '< 5 NTU',
        title: 'Elevated Turbidity',
        description: 'Water cloudiness above optimal levels'
      });
    }
    
    const tdsStatus = getMetricStatus('tds', latest.tds);
    if (tdsStatus !== 'ok') {
      problems.push({
        type: 'tds',
        severity: tdsStatus as 'high' | 'low',
        current: latest.tds,
        optimal: '200-500 ppm',
        title: tdsStatus === 'high' ? 'High TDS Levels' : 'Low TDS Levels',
        description: tdsStatus === 'high' ? 'Too many dissolved solids' : 'Low mineral content'
      });
    }
    
    return problems;
  }, [latest, getMetricStatus]);

  // Generate recommendations based on issues
  const recommendations = useMemo((): Recommendation[] => {
    const recs: Recommendation[] = [];
    
    issues.forEach((issue, index) => {
      switch (issue.type) {
        case 'ph':
          if (issue.current < 6.5) {
            recs.push({
              priority: index + 1,
              title: 'Install pH Adjustment System',
              description: 'Consider a calcite neutralizer or soda ash injection system to raise pH levels.',
              cost: '$800-1,500',
              timeline: '1-2 days',
              type: 'immediate'
            });
          } else {
            recs.push({
              priority: index + 1,
              title: 'Install Acid Neutralization',
              description: 'Use an acid neutralizer or reverse osmosis system to lower pH.',
              cost: '$600-1,200',
              timeline: '1-2 days',
              type: 'immediate'
            });
          }
          break;
        case 'ntu':
          recs.push({
            priority: index + 1,
            title: 'Upgrade Sediment Filtration',
            description: 'Install or replace with 5-micron sediment filters to reduce turbidity.',
            cost: '$150-300',
            timeline: '2-4 hours',
            type: 'immediate'
          });
          break;
        case 'tds':
          if (issue.severity === 'high') {
            recs.push({
              priority: index + 1,
              title: 'Consider Reverse Osmosis',
              description: 'RO system can effectively reduce high dissolved solid content.',
              cost: '$400-800',
              timeline: '4-6 hours',
              type: 'short-term'
            });
          } else {
            recs.push({
              priority: index + 1,
              title: 'Mineral Addition System',
              description: 'Add beneficial minerals to improve water quality.',
              cost: '$200-400',
              timeline: '2-3 hours',
              type: 'short-term'
            });
          }
          break;
      }
    });
    
    // Always add testing recommendation
    recs.push({
      priority: recs.length + 1,
      title: 'Schedule Comprehensive Testing',
      description: 'Get detailed lab analysis to identify root causes and additional contaminants.',
      cost: '$150-250',
      timeline: '5-7 business days',
      type: 'maintenance'
    });
    
    return recs;
  }, [issues]);

  // Calculate overall score
  const overallScore = useMemo(() => {
    if (!latest) return 10;
    
    let score = 10;
    const phStatus = getMetricStatus('ph', latest.ph);
    const ntuStatus = getMetricStatus('ntu', latest.ntu);
    const tdsStatus = getMetricStatus('tds', latest.tds);
    
    if (phStatus !== 'ok') score -= 2;
    if (ntuStatus !== 'ok') score -= 2;
    if (tdsStatus !== 'ok') score -= 1.5;
    
    return Math.max(1, Math.round(score * 10) / 10);
  }, [latest, getMetricStatus]);

  const overallStatus = useMemo(() => {
    if (overallScore >= 8.5) return { label: 'Excellent', color: 'green' };
    if (overallScore >= 7) return { label: 'Good', color: 'blue' };
    if (overallScore >= 5.5) return { label: 'Needs Attention', color: 'amber' };
    return { label: 'Poor', color: 'red' };
  }, [overallScore]);

  // AI summary generation
  const aiSummary = useMemo(() => {
    if (!latest) return "Unable to analyze water quality - no recent data available.";
    
    const problemCount = issues.length;
    if (problemCount === 0) {
      return `Your water quality is excellent with all parameters within optimal ranges. pH at ${latest.ph}, turbidity at ${latest.ntu} NTU, and TDS at ${latest.tds} ppm are all healthy levels.`;
    }
    
    const primaryIssues = issues.slice(0, 2).map(i => i.title.toLowerCase()).join(' and ');
    const trend = "Based on current trends";
    
    return `Your water shows ${problemCount === 1 ? 'an issue' : 'issues'} with ${primaryIssues}. ${trend}, immediate attention is recommended to ensure safe, quality water.`;
  }, [latest, issues]);

  if (!latest) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="text-center py-8">
          <p className="text-gray-500">No water quality data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overall Status Card */}
      <div className="bg-white rounded-lg shadow p-4">
        {/* Status Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${
                overallStatus.color === 'green' ? 'bg-green-500' :
                overallStatus.color === 'blue' ? 'bg-blue-500' :
                overallStatus.color === 'amber' ? 'bg-amber-500 animate-pulse' :
                'bg-red-500 animate-pulse'
              }`}></div>
              <h3 className="text-lg font-semibold text-gray-900">Water Status</h3>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              overallStatus.color === 'green' ? 'bg-green-100 text-green-700' :
              overallStatus.color === 'blue' ? 'bg-blue-100 text-blue-700' :
              overallStatus.color === 'amber' ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-700'
            }`}>
              {overallStatus.label}
            </span>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Overall Score</div>
            <div className={`text-xl font-bold ${
              overallStatus.color === 'green' ? 'text-green-600' :
              overallStatus.color === 'blue' ? 'text-blue-600' :
              overallStatus.color === 'amber' ? 'text-amber-600' :
              'text-red-600'
            }`}>
              {overallScore}/10
            </div>
          </div>
        </div>

        {/* AI Summary */}
        <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Lightbulb className="h-3 w-3 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">AI Analysis</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {aiSummary}
              </p>
            </div>
          </div>
        </div>

        {/* Issues Breakdown */}
        {issues.length > 0 && (
          <div className="space-y-3 mb-4">
            <h3 className="font-medium text-gray-900 mb-2">Current Issues</h3>
            
            {issues.map((issue, index) => (
              <div key={index} className={`flex items-start gap-3 p-3 rounded-lg border ${
                issue.severity === 'warning' && issue.type === 'ph' && issue.current < 6.5 ? 'border-red-100 bg-red-50' :
                issue.severity === 'warning' ? 'border-amber-100 bg-amber-50' :
                issue.severity === 'high' ? 'border-red-100 bg-red-50' :
                'border-blue-100 bg-blue-50'
              }`}>
                <div className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                  issue.severity === 'warning' && issue.type === 'ph' && issue.current < 6.5 ? 'bg-red-100' :
                  issue.severity === 'warning' ? 'bg-amber-100' :
                  issue.severity === 'high' ? 'bg-red-100' :
                  'bg-blue-100'
                }`}>
                  <AlertTriangle className={`h-2.5 w-2.5 ${
                    issue.severity === 'warning' && issue.type === 'ph' && issue.current < 6.5 ? 'text-red-600' :
                    issue.severity === 'warning' ? 'text-amber-600' :
                    issue.severity === 'high' ? 'text-red-600' :
                    'text-blue-600'
                  }`} />
                </div>
                <div>
                  <h4 className={`font-medium text-sm ${
                    issue.severity === 'warning' && issue.type === 'ph' && issue.current < 6.5 ? 'text-red-900' :
                    issue.severity === 'warning' ? 'text-amber-900' :
                    issue.severity === 'high' ? 'text-red-900' :
                    'text-blue-900'
                  }`}>
                    {issue.title} ({issue.current}{issue.type === 'ph' ? '' : issue.type === 'ntu' ? ' NTU' : ' ppm'})
                  </h4>
                  <p className={`text-xs mt-0.5 ${
                    issue.severity === 'warning' && issue.type === 'ph' && issue.current < 6.5 ? 'text-red-700' :
                    issue.severity === 'warning' ? 'text-amber-700' :
                    issue.severity === 'high' ? 'text-red-700' :
                    'text-blue-700'
                  }`}>
                    {issue.description}. Optimal range: {issue.optimal}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Good Status */}
        {issues.length === 0 && (
          <div className="flex items-start gap-3 p-3 rounded-lg border border-green-100 bg-green-50 mb-4">
            <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-2.5 w-2.5 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-sm text-green-900">All Parameters Normal</h4>
              <p className="text-xs text-green-700 mt-0.5">
                pH, turbidity, and TDS levels are within optimal ranges.
              </p>
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900 mb-2">Recommended Actions</h3>
          
          <div className="space-y-2">
            {recommendations.slice(0, 3).map((rec, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs text-white ${
                  rec.type === 'immediate' ? 'bg-red-600' :
                  rec.type === 'short-term' ? 'bg-amber-600' :
                  'bg-blue-600'
                }`}>
                  {rec.priority}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-gray-900">{rec.title}</h4>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {rec.description}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{rec.cost}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{rec.timeline}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-[10px] text-gray-500">
            Last updated: {timeShort(latest.t)}
          </div>
          <div className="flex items-center gap-2">
            <button className="text-[10px] text-blue-600 hover:text-blue-700 font-medium">
              Export Report
            </button>
            <button 
              onClick={handleGetQuote}
              className="bg-blue-600 text-white px-2 py-1 rounded-md text-[10px] font-medium hover:bg-blue-700 transition-colors"
            >
              Get Quote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Utility functions from your component
function timeShort(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
