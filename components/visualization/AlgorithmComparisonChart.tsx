'use client';

import { useMemo, useEffect } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAlgorithmResultsStore } from '@/lib/store/algorithm-results';
import { getAlgorithmFullName } from '@/lib/utils';


interface AlgorithmComparisonChartProps {
  metrics?: Array<{
    key: string;
    name: string;
    unit?: string;
    description?: string;
  }>;
}

// Add a type definition for chart data items
type ChartDataItem = Record<string, string | number>;

// Type definition for metric values
type MetricValue = {
  algorithm: string;
  value: number;
};

export function AlgorithmComparisonChart({
  metrics = [
    { key: 'cpuUtilization', name: 'CPU Utilization', unit: '%', description: 'Percentage of time the CPU is actively processing' },
    { key: 'avgWaitingTime', name: 'Avg Waiting Time', unit: 'ms', description: 'Average time processes spend in the ready queue' },
    { key: 'avgTurnaroundTime', name: 'Avg Turnaround Time', unit: 'ms', description: 'Average time from process arrival to completion' },
    { key: 'avgResponseTime', name: 'Avg Response Time', unit: 'ms', description: 'Average time from arrival to first CPU execution' },
    { key: 'throughput', name: 'Throughput', unit: 'proc/ms', description: 'Number of processes completed per unit time' },
  ],
}: AlgorithmComparisonChartProps) {
  const results = useAlgorithmResultsStore(state => state.results);
  const clearResults = useAlgorithmResultsStore(state => state.clearResults);
  
  // Enhanced debugging for results data
  useEffect(() => {
    console.log('AlgorithmComparisonChart results updated:', results);
    console.log('Results length:', results.length);
    if (results.length > 0) {
      console.log('First result sample:', results[0]);
      
    
    }
  }, [results]);
  
  // Add a check on mount to ensure we have the latest data
  useEffect(() => {
    // Get the current results from the store directly
    const storeResults = useAlgorithmResultsStore.getState().results;
    console.log('Initial store check - results:', storeResults);
    console.log('Results count in store:', storeResults.length);
    
    // If our component has zero results but the store has some,
    // this might indicate a subscription issue
    if (results.length === 0 && storeResults.length > 0) {
      console.warn('Component shows no results but the store has results. Forcing update.');
    }
  }, [results.length]);
  
  // Process data in a way that works better for our chart types
  const chartData = useMemo(() => {
    if (!results || results.length === 0) {
      console.log('No results available for chart');
      return [];
    }
    
    console.log('Processing chart data from', results.length, 'results');
    
    return results.map(result => {
      if (!result || !result.statistics) {
        console.warn('Invalid result found:', result);
        return null;
      }
      
      // Convert values to numbers for charting
      return {
        id: result.id,
        algorithm: result.algorithm,
        algorithmName: getAlgorithmFullName(result.algorithm),
        cpuUtilization: parseFloat(result.statistics.cpuUtilization || '0'),
        avgWaitingTime: parseFloat(result.statistics.avgWaitingTime || '0'),
        avgTurnaroundTime: parseFloat(result.statistics.avgTurnaroundTime || '0'),
        avgResponseTime: parseFloat(result.statistics.avgResponseTime || '0'),
        throughput: parseFloat(result.statistics.throughput || '0') * 100, // Scale throughput for visibility
      } as ChartDataItem;
    }).filter((item): item is ChartDataItem => item !== null);
  }, [results]);
  
  // Generate colors for each metric or algorithm
  const colors = useMemo(() => {
    // Create deterministic colors for consistent visualization
    return [
      '#4f46e5', // indigo
      '#06b6d4', // cyan
      '#10b981', // emerald
      '#f59e0b', // amber
      '#ef4444', // red
      '#8b5cf6', // violet
      '#ec4899', // pink
    ];
  }, []);
  
  // Prepare data with standardized/z-score normalized values for better comparisons
  // This is not currently used but will be needed for future enhancements
  /* 
  const normalizedData = useMemo(() => {
    if (chartData.length === 0) return [];
    
    // First calculate means and standard deviations for each metric
    const means: Record<string, number> = {};
    const stdDevs: Record<string, number> = {};
    
    metrics.forEach(metric => {
      const values = chartData.map(item => (item as Record<string, number>)[metric.key] || 0);
      const sum = values.reduce((acc, val) => acc + val, 0);
      const mean = sum / values.length;
      means[metric.key] = mean;
      
      const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
      const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / values.length;
      stdDevs[metric.key] = Math.sqrt(variance);
    });
    
    // Handle zero standard deviation (all values are the same)
    metrics.forEach(metric => {
      if (stdDevs[metric.key] === 0) {
        stdDevs[metric.key] = 1; // prevent division by zero
      }
    });
    
    // Normalize using z-score: (value - mean) / stdDev
    return chartData.map(item => {
      if (!item) return null;
      
      const normalized: Record<string, string | number> = {
        algorithm: item.algorithm,
        algorithmName: item.algorithmName
      };
      
      metrics.forEach(metric => {
        const value = (item as Record<string, number>)[metric.key] || 0;
        normalized[metric.key] = (value - means[metric.key]) / stdDevs[metric.key];
        // Also keep the original value
        normalized[`${metric.key}Original`] = value;
      });
      
      return normalized;
    }).filter(Boolean);
  }, [chartData, metrics]);
  */
  
  // For radar chart, we need values between 0-100
  // Commenting out unused radarData for now - will implement later
  /*const radarData = useMemo(() => {
    if (normalizedData.length === 0) return [];
    
    // Map normalized values to 0-100 scale
    return normalizedData.map(item => {
      if (!item) return null;
      
      const scaled: Record<string, any> = {
      // implementation goes here
      };
      return scaled;
    });
  }, [normalizedData, metrics]);*/
  
  // Calculate insights based on the data
  const insights = useMemo(() => {
    if (chartData.length < 2) return null;
    
    // Find the best algorithm for each metric
    const bestAlgorithms: Record<string, MetricValue> = {};
    
    metrics.forEach(metric => {
      let bestAlgo = chartData[0];
      let bestValue = (chartData[0] as Record<string, number>)[metric.key];
      
      // For waiting time, turnaround time, and response time, lower is better
      // For CPU utilization and throughput, higher is better
      const isLowerBetter = ['avgWaitingTime', 'avgTurnaroundTime', 'avgResponseTime'].includes(metric.key);
      
      chartData.forEach(algo => {
        if (!algo) return;
        
        const value = (algo as Record<string, number>)[metric.key];
        if (isLowerBetter) {
          if (value < bestValue) {
            bestValue = value;
            bestAlgo = algo;
          }
        } else {
          if (value > bestValue) {
            bestValue = value;
            bestAlgo = algo;
          }
        }
      });
      
      if (!bestAlgo) return;
      
      bestAlgorithms[metric.key] = {
        algorithm: String(bestAlgo.algorithmName),
        value: bestValue
      };
    });
    
    // Calculate the overall best algorithm based on a weighted score
    const weightedScores = chartData.map(algo => {
      if (!algo) return null;
      
      let score = 0;
      
      metrics.forEach(metric => {
        const value = (algo as Record<string, number>)[metric.key];
        const isLowerBetter = ['avgWaitingTime', 'avgTurnaroundTime', 'avgResponseTime'].includes(metric.key);
        
        // Normalize the value (0 to 1 scale)
        const allValues = chartData.map(a => (a as Record<string, number>)[metric.key]);
        const numericValues = allValues.map(v => typeof v === 'string' ? parseFloat(v) || 0 : Number(v));
        const minValue = Math.min(...numericValues);
        const maxValue = Math.max(...numericValues);
        const range = maxValue - minValue;
        
        // Avoid division by zero
        if (range === 0) return;
        
        const normalizedValue = isLowerBetter 
          ? 1 - ((value - minValue) / range) // Invert for metrics where lower is better
          : (value - minValue) / range;
        
        // Add to weighted score (all metrics weighted equally for now)
        score += normalizedValue;
      });
      
      return {
        algorithm: algo.algorithm,
        algorithmName: algo.algorithmName,
        score
      };
    }).filter(Boolean);
    
    // Sort to find overall best
    weightedScores.sort((a, b) => {
      if (!a || !b) return 0;
      return b.score - a.score;
    });
    const overallBest = weightedScores.length > 0 ? weightedScores[0] : null;
    
    return {
      bestAlgorithms,
      overallBest,
      weightedScores
    };
  }, [chartData, metrics]);
  
  // Formatter function for handling different value types
  const formatValue = (value: string | number, unit: string = '') => {
    if (typeof value === 'number') {
      return `${value.toFixed(2)}${unit}`;
    }
    return `${value}${unit}`;
  };
  
  // Function to get record by metric key with proper type handling
  // This is not currently used but will be needed for future enhancements
  /*
  const getMetricValue = (item: Record<string, string | number>, key: string): number => {
    const value = item[key];
    if (typeof value === 'string') {
      return parseFloat(value) || 0;
    }
    return typeof value === 'number' ? value : 0;
  };
  */

  // Find highest/lowest value for a metric across all algorithms
  // This is not currently used but will be needed for future enhancements
  /*
  const findExtremeByMetric = (chartData: Record<string, string | number>[], metric: string, findMax: boolean): MetricValue => {
    if (!chartData || chartData.length === 0) {
      return { algorithm: 'None', value: 0 };
    }

    let extremeValue = findMax ? -Infinity : Infinity;
    let extremeAlgorithm = '';

    chartData.forEach(item => {
      const value = getMetricValue(item, metric);
      
      if ((findMax && value > extremeValue) || (!findMax && value < extremeValue)) {
        extremeValue = value;
        extremeAlgorithm = item.algorithm?.toString() || '';
      }
    });

    return {
      algorithm: extremeAlgorithm,
      value: extremeValue
    };
  };
  */
  
  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Algorithm Comparison</CardTitle>
          <CardDescription>
            Run simulations with different algorithms to compare their performance.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[400px]">
          <p className="text-muted-foreground text-center mb-4">
            No data available. Run at least one simulation to see comparison.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-center">
              Once you run simulations with different algorithms, you&apos;ll see performance metrics compared here.
            </p>
            <ul className="text-sm list-disc pl-5 space-y-1 mt-2">
              {metrics.map(metric => (
                <li key={metric.key}>{metric.name} - {metric.description}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Algorithm Comparison</CardTitle>
          <CardDescription>
            Compare performance metrics across different scheduling algorithms
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              console.log('Current algorithm results:', results);
              console.log('Processed chart data:', chartData);
              alert('Debug info logged to console. Press F12 to view.');
            }}
          >
            Debug Data
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              if (confirm("Are you sure you want to clear all comparison data?")) {
                clearResults();
              }
            }}
          >
            Clear Data
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Chart Controls */}
       
       
        
       
        
        {/* Results Summary with Enhanced Visualization */}
        <div className="mt-8">
          <h4 className="font-medium text-lg mb-4">Results Summary</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {chartData.filter(result => result !== null).map((result) => (
              <div 
                key={result.algorithm} 
                className="p-4 rounded-md border border-gray-200 dark:border-gray-800 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-transparent opacity-10" 
                     style={{ background: `linear-gradient(to right, ${colors[chartData.indexOf(result) % colors.length]}22, transparent)` }} />
                
                <h5 className="font-medium text-lg mb-2 flex items-center">
                  <span 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: colors[chartData.indexOf(result) % colors.length] }}
                  />
                  {result.algorithmName}
                </h5>
                
                <ul className="space-y-2">
                  {metrics.map((metric) => {
                    const value = (result as Record<string, number | string>)[metric.key];
                    const allValues = chartData.map(r => (r as Record<string, number | string>)[metric.key]);
                    const numericValues = allValues.map(v => typeof v === 'string' ? parseFloat(v) || 0 : Number(v));
                    const maxValue = Math.max(...numericValues);
                    const minValue = Math.min(...numericValues);
                    const range = maxValue - minValue;
                    
                    // For metrics where lower is better, we invert the percentage
                    const isLowerBetter = ['avgWaitingTime', 'avgTurnaroundTime', 'avgResponseTime'].includes(metric.key);
                    const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : Number(value);
                    const percentage = range === 0 
                      ? 50 // If all algorithms have the same value
                      : isLowerBetter
                        ? 100 - ((numericValue - minValue) / range * 100)
                        : ((numericValue - minValue) / range * 100);
                    
                    // Determine color based on percentage (green for good, red for bad)
                    const barColor = isLowerBetter
                      ? `hsl(${percentage * 1.2}, 70%, 50%)`
                      : `hsl(${percentage * 1.2}, 70%, 50%)`;
                    
                    return (
                      <li key={`${result.algorithm}-${metric.key}`} className="flex flex-col">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">{metric.name}:</span>
                          <span className="font-mono">
                            {formatValue(value, metric.unit)}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full" 
                            style={{ 
                              width: `${percentage}%`, 
                              backgroundColor: barColor
                            }}
                          />
                        </div>
                      </li>
                    );
                  })}
                  
                  {/* Overall score bar (only if we have multiple algorithms) */}
                  {insights && insights.weightedScores && (
                    <li className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Overall Score:</span>
                        <span className="font-mono">
                          {(() => {
                            const score = insights.weightedScores.find(s => s && s.algorithm === result.algorithm);
                            return formatValue(score ? (score.score / metrics.length * 100) : 0, '%');
                          })()}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-blue-500" 
                          style={{ 
                            width: (() => {
                              const score = insights.weightedScores.find(s => s && s.algorithm === result.algorithm);
                              return `${score ? (score.score / metrics.length * 100) : 0}%`;
                            })()
                          }}
                        />
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 