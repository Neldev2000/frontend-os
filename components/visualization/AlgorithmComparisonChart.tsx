'use client';

import { useMemo, useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAlgorithmResultsStore } from '@/lib/store/algorithm-results';
import { prepareComparisonData, generateRandomColor, getAlgorithmFullName } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AlgorithmComparisonChartProps {
  metrics?: Array<{
    key: string;
    name: string;
    unit?: string;
  }>;
}

export function AlgorithmComparisonChart({
  metrics = [
    { key: 'cpuUtilization', name: 'CPU Utilization', unit: '%' },
    { key: 'avgWaitingTime', name: 'Avg Waiting Time', unit: 'ms' },
    { key: 'avgTurnaroundTime', name: 'Avg Turnaround Time', unit: 'ms' },
    { key: 'avgResponseTime', name: 'Avg Response Time', unit: 'ms' },
    { key: 'throughput', name: 'Throughput', unit: 'proc/ms' },
  ],
}: AlgorithmComparisonChartProps) {
  const results = useAlgorithmResultsStore(state => state.results);
  const clearResults = useAlgorithmResultsStore(state => state.clearResults);
  const [chartType, setChartType] = useState<'bar' | 'radar' | 'line'>('bar');
  
  // Enhanced debugging for results data
  useEffect(() => {
    console.log('AlgorithmComparisonChart results updated:', results);
    console.log('Results length:', results.length);
    if (results.length > 0) {
      console.log('First result sample:', results[0]);
      
      // Force a re-render when results change
      setChartType(prev => prev === 'bar' ? 'bar' : 'bar');
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
      
      // Force a re-render
      setChartType(prev => prev === 'bar' ? 'bar' : 'bar');
    }
  }, []);
  
  // Process data in a way that works better for our chart types
  const chartData = useMemo(() => {
    if (!results || results.length === 0) {
      console.log('No results available for chart');
      return [];
    }
    
    console.log('Processing chart data from', results.length, 'results');
    
    // For bar chart - each algorithm is an entry with all metrics
    const processedData = results.map(result => {
      if (!result || !result.statistics) {
        console.warn('Invalid result found:', result);
        return null;
      }
      
      // Parse numerical values from strings
      return {
        algorithm: result.algorithm,
        algorithmName: getAlgorithmFullName(result.algorithm),
        cpuUtilization: parseFloat(result.statistics.cpuUtilization || '0'),
        avgWaitingTime: parseFloat(result.statistics.avgWaitingTime || '0'),
        avgTurnaroundTime: parseFloat(result.statistics.avgTurnaroundTime || '0'),
        avgResponseTime: parseFloat(result.statistics.avgResponseTime || '0'),
        throughput: parseFloat(result.statistics.throughput || '0') * 100, // Scale throughput for visibility
        timestamp: result.timestamp,
      };
    }).filter(Boolean);
    
    console.log('Processed chart data:', processedData);
    return processedData;
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
  
  // Calculate normalized values for the radar chart (all values between 0-100)
  const normalizedData = useMemo(() => {
    if (chartData.length === 0) return [];
    
    // Find the maximum value for each metric to normalize
    const maxValues: Record<string, number> = {};
    
    metrics.forEach(metric => {
      maxValues[metric.key] = Math.max(
        ...chartData.map(item => (item as any)[metric.key] || 0),
        0.001 // Prevent division by zero
      );
    });
    
    // Normalize each value to 0-100 scale
    return chartData.map(item => {
      if (!item) return null;
      
      const normalized: Record<string, any> = {
        algorithm: item.algorithm,
        algorithmName: item.algorithmName
      };
      
      metrics.forEach(metric => {
        const value = (item as any)[metric.key] || 0;
        normalized[metric.key] = (value / maxValues[metric.key]) * 100;
      });
      
      return normalized;
    }).filter(Boolean);
  }, [chartData, metrics]);
  
  // Formatter function for handling different value types
  const formatValue = (value: any, unit: string = '') => {
    if (typeof value === 'number') {
      return `${value.toFixed(2)}${unit}`;
    }
    return `${value}${unit}`;
  };
  
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
              Once you run simulations with different algorithms, you'll see performance metrics compared here.
            </p>
            <ul className="text-sm list-disc pl-5 space-y-1 mt-2">
              <li>CPU Utilization - How efficiently the CPU is used</li>
              <li>Average Waiting Time - Mean time processes spend waiting</li>
              <li>Average Turnaround Time - Mean time from arrival to completion</li>
              <li>Average Response Time - Mean time from arrival to first execution</li>
              <li>Throughput - Number of processes completed per unit time</li>
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
              if (confirm('Are you sure you want to clear all comparison data?')) {
                clearResults();
              }
            }}
          >
            Clear Data
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="bar" onValueChange={(value) => setChartType(value as any)}>
          <TabsList className="mb-4">
            <TabsTrigger value="bar">Bar Chart</TabsTrigger>
            <TabsTrigger value="radar">Radar Chart</TabsTrigger>
            <TabsTrigger value="line">Line Chart</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bar" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 70,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="algorithmName" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip
                  formatter={(value: any, name) => {
                    const metric = metrics.find(m => m.key === name);
                    return [formatValue(value, metric?.unit || ''), metric?.name || name];
                  }}
                  labelFormatter={(label) => `Algorithm: ${label}`}
                />
                <Legend />
                {metrics.map((metric, index) => (
                  <Bar
                    key={metric.key}
                    dataKey={metric.key}
                    name={metric.name}
                    fill={colors[index % colors.length]}
                    animationDuration={500}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="radar" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart 
                cx="50%" 
                cy="50%" 
                outerRadius="70%" 
                data={normalizedData}
              >
                <PolarGrid />
                <PolarAngleAxis 
                  dataKey="algorithmName"
                  tick={{ fontSize: 12 }}
                />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tickCount={5} />
                <Tooltip
                  formatter={(value: any, name) => {
                    const metric = metrics.find(m => m.key === name);
                    return [formatValue(value, '%'), metric?.name || name];
                  }}
                  labelFormatter={(label) => `Algorithm: ${label}`}
                />
                <Legend />
                {metrics.map((metric, index) => (
                  <Radar
                    key={metric.key}
                    name={metric.name}
                    dataKey={metric.key}
                    stroke={colors[index % colors.length]}
                    fill={colors[index % colors.length]}
                    fillOpacity={0.3}
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="line" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 70,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="algorithmName" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70}
                />
                <YAxis />
                <Tooltip
                  formatter={(value: any, name) => {
                    const metric = metrics.find(m => m.key === name);
                    return [formatValue(value, metric?.unit || ''), metric?.name || name];
                  }}
                />
                <Legend />
                {metrics.map((metric, index) => (
                  <Line
                    key={metric.key}
                    type="monotone"
                    dataKey={metric.key}
                    name={metric.name}
                    stroke={colors[index % colors.length]}
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4">
          <h4 className="font-medium text-sm mb-2">Results Summary</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {chartData.filter(result => result !== null).map((result) => (
              <div 
                key={result.algorithm} 
                className="p-3 rounded-md border border-gray-200 dark:border-gray-800"
              >
                <h5 className="font-medium">{result.algorithmName}</h5>
                <ul className="text-sm">
                  {metrics.map((metric) => (
                    <li key={`${result.algorithm}-${metric.key}`} className="flex justify-between mt-1">
                      <span className="text-muted-foreground">{metric.name}:</span>
                      <span className="font-mono">
                        {formatValue((result as any)[metric.key], metric.unit)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 