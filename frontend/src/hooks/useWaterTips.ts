import { useState, useEffect, useCallback, useMemo } from 'react';
import { DataPoint, WaterTip } from '../types/waterTypes';

// LangChain integration types
interface WaterContext {
  currentData: DataPoint;
  location?: {
    city: string;
    state: string;
    country: string;
    climate: string;
  };
  season: string;
  userPreferences?: {
    budget: 'low' | 'medium' | 'high';
    diyLevel: 'beginner' | 'intermediate' | 'advanced';
    priorities: string[];
  };
  historicalData?: DataPoint[];
  localWaterIssues?: string[];
}

interface LangChainConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

// Default configuration - you'll want to move this to environment variables
const DEFAULT_LANGCHAIN_CONFIG: LangChainConfig = {
  apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 1000
};

export function useWaterTips(
  waterData: DataPoint[],
  deviceId: string = 'well-01',
  config: Partial<LangChainConfig> = {}
) {
  const [tips, setTips] = useState<WaterTip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useLangChain, setUseLangChain] = useState(true);

  const langChainConfig = useMemo(() => ({
    ...DEFAULT_LANGCHAIN_CONFIG,
    ...config
  }), [config]);

  // Get current season
  const getCurrentSeason = useCallback(() => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }, []);

  // Get user location (you can enhance this with actual geolocation)
  const getUserLocation = useCallback(async () => {
    try {
      // You can implement actual geolocation here
      // For now, return a default location
      return {
        city: 'San Francisco',
        state: 'California',
        country: 'USA',
        climate: 'Mediterranean'
      };
    } catch (error) {
      console.warn('Could not get location:', error);
      return undefined;
    }
  }, []);

  // Generate comprehensive prompt for LangChain
  const generatePrompt = useCallback((context: WaterContext): string => {
    const { currentData, location, season, userPreferences, historicalData, localWaterIssues } = context;
    
    return `You are a water quality expert providing personalized recommendations. Generate 5-7 actionable water tips based on the following context:

CURRENT WATER QUALITY DATA:
- pH: ${currentData.ph} (optimal: 6.5-8.5)
- Turbidity: ${currentData.ntu} NTU (optimal: <5 NTU)
- TDS: ${currentData.tds} ppm (optimal: 200-500 ppm)
- Timestamp: ${currentData.t}

LOCATION & ENVIRONMENT:
- Location: ${location ? `${location.city}, ${location.state}, ${location.country}` : 'Unknown'}
- Climate: ${location?.climate || 'Unknown'}
- Season: ${season}

${historicalData ? `HISTORICAL TRENDS:
- Data points: ${historicalData.length}
- pH trend: ${getTrend(historicalData, 'ph')}
- Turbidity trend: ${getTrend(historicalData, 'ntu')}
- TDS trend: ${getTrend(historicalData, 'tds')}` : ''}

${localWaterIssues ? `LOCAL WATER ISSUES: ${localWaterIssues.join(', ')}` : ''}

${userPreferences ? `USER PREFERENCES:
- Budget: ${userPreferences.budget}
- DIY Level: ${userPreferences.diyLevel}
- Priorities: ${userPreferences.priorities.join(', ')}` : ''}

Generate tips that are:
1. SPECIFIC to the current water quality issues
2. ACTIONABLE with clear steps
3. COST-CONSCIOUS for the user's budget level
4. APPROPRIATE for their DIY skill level
5. SEASONALLY RELEVANT
6. LOCATION-AWARE (consider local water quality issues)

Return ONLY a JSON array with this exact structure:
[
  {
    "id": "unique-id",
    "title": "Clear, actionable title",
    "description": "Detailed explanation with specific steps",
    "category": "immediate|maintenance|educational|seasonal",
    "priority": 1-10,
    "actionable": true/false,
    "cost": "$X-Y range",
    "timeToComplete": "X hours/days",
    "relatedParameter": "ph|ntu|tds",
    "reasoning": "Why this tip is relevant now"
  }
]`;
  }, []);

  // Helper function to calculate trends
  const getTrend = (data: DataPoint[], parameter: keyof DataPoint): string => {
    if (data.length < 2) return 'insufficient data';
    const recent = data.slice(-5);
    const older = data.slice(-10, -5);
    
    const recentAvg = recent.reduce((sum, d) => sum + (d[parameter] as number), 0) / recent.length;
    const olderAvg = older.reduce((sum, d) => sum + (d[parameter] as number), 0) / older.length;
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    if (change > 5) return 'increasing';
    if (change < -5) return 'decreasing';
    return 'stable';
  };

  // Call LangChain API
  const generateTipsWithLangChain = useCallback(async (context: WaterContext): Promise<WaterTip[]> => {
    if (!langChainConfig.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = generatePrompt(context);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${langChainConfig.apiKey}`
      },
      body: JSON.stringify({
        model: langChainConfig.model,
        messages: [
          {
            role: 'system',
            content: 'You are a water quality expert. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: langChainConfig.temperature,
        max_tokens: langChainConfig.maxTokens
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    try {
      const tips = JSON.parse(content);
      return tips.map((tip: any) => ({
        ...tip,
        isCompleted: false,
        isFavorited: false
      }));
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      throw new Error('Invalid response format from OpenAI');
    }
  }, [langChainConfig, generatePrompt]);

  // Fallback to static tips
  const getStaticTips = useCallback((): WaterTip[] => {
    // Import your existing static tips logic here
    return [
      {
        id: 'static-1',
        title: 'Regular Filter Replacement',
        description: 'Replace sediment filters every 3-6 months for optimal performance.',
        category: 'maintenance',
        priority: 4,
        actionable: true,
        cost: '$20-50',
        timeToComplete: '30 minutes',
        isCompleted: false,
        isFavorited: false
      }
    ];
  }, []);

  // Main function to generate tips
  const generateTips = useCallback(async () => {
    if (!waterData.length) return;

    setIsLoading(true);
    setError(null);

    try {
      const latest = waterData[waterData.length - 1];
      const location = await getUserLocation();
      const season = getCurrentSeason();

      const context: WaterContext = {
        currentData: latest,
        location,
        season,
        historicalData: waterData.slice(-20), // Last 20 data points
        userPreferences: {
          budget: 'medium',
          diyLevel: 'intermediate',
          priorities: ['water quality', 'cost effectiveness']
        }
      };

      let generatedTips: WaterTip[];

      if (useLangChain && langChainConfig.apiKey) {
        generatedTips = await generateTipsWithLangChain(context);
      } else {
        generatedTips = getStaticTips();
      }

      setTips(generatedTips);
    } catch (err) {
      console.error('Error generating tips:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate tips');
      
      // Fallback to static tips on error
      setTips(getStaticTips());
    } finally {
      setIsLoading(false);
    }
  }, [waterData, useLangChain, langChainConfig.apiKey, generateTipsWithLangChain, getStaticTips, getUserLocation, getCurrentSeason]);

  // Auto-generate tips when water data changes
  useEffect(() => {
    if (waterData.length > 0) {
      generateTips();
    }
  }, [waterData, generateTips]);

  // Manual refresh function
  const refreshTips = useCallback(() => {
    generateTips();
  }, [generateTips]);

  // Toggle between LangChain and static tips
  const toggleLangChain = useCallback(() => {
    setUseLangChain(prev => !prev);
  }, []);

  return {
    tips,
    isLoading,
    error,
    useLangChain,
    refreshTips,
    toggleLangChain,
    config: langChainConfig
  };
}
