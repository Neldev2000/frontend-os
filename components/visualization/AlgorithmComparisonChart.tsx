'use client';

import { useMemo, useEffect } from 'react';
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
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  const compareResults = useAlgorithmResultsStore(state => state.compareResults);
  
  useEffect(() => {
    console.log('AlgorithmComparisonChart rendering with results:', results);
    console.log('CompareResults output:', compareResults());
  }, [results, compareResults]);
  
  // Prepare comparison data for chart using compareResults instead of raw results
  const chartData = useMemo(() => {
    const resultsToCompare = compareResults();
    console.log('Recalculating chart data with', resultsToCompare.length, 'results');
    return prepareComparisonData(resultsToCompare);
  }, [compareResults]);
  
  // Generate colors for each algorithm
  const barColors = useMemo(
    () => metrics.map(() => generateRandomColor()),
    [metrics.length]
  );
  
  // Add more debugging to see why charts might not be showing
  useEffect(() => {
    console.log('Chart data prepared:', chartData);
    console.log('Is chart data empty?', chartData.length === 0);
    console.log('Current metrics:', metrics);
  }, [chartData, metrics]);
  
  // More robust check - make sure chartData is properly populated
  if (!chartData || chartData.length === 0 || !Array.isArray(chartData)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Algorithm Comparison</CardTitle>
          <CardDescription>
            Run simulations with different algorithms to compare their performance.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <p className="text-muted-foreground text-center">
            No data available. Run at least one simulation to see comparison.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Algorithm Comparison</CardTitle>
        <CardDescription>
          Compare performance metrics across different scheduling algorithms
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="bar">
          <TabsList className="mb-4">
            <TabsTrigger value="bar">Bar Chart</TabsTrigger>
            <TabsTrigger value="radar">Radar Chart</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bar" className="h-[400px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 30,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="algorithm" 
                    tickFormatter={getAlgorithmFullName} 
                    angle={-45} 
                    textAnchor="end" 
                    height={70}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => {
                      const metric = metrics.find(m => m.key === name);
                      return [`${value}${metric?.unit || ''}`, metric?.name || name];
                    }}
                  />
                  <Legend />
                  {metrics.map((metric, index) => (
                    <Bar
                      key={metric.key}
                      dataKey={metric.key}
                      name={metric.name}
                      fill={barColors[index % barColors.length]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No data to display</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="radar" className="h-[400px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="algorithm" />
                  <PolarRadiusAxis />
                  <Tooltip
                    formatter={(value, name) => {
                      const metric = metrics.find(m => m.key === name);
                      return [`${value}${metric?.unit || ''}`, metric?.name || name];
                    }}
                  />
                  {metrics.map((metric, index) => (
                    <Radar
                      key={metric.key}
                      name={metric.name}
                      dataKey={metric.key}
                      stroke={barColors[index % barColors.length]}
                      fill={barColors[index % barColors.length]}
                      fillOpacity={0.6}
                    />
                  ))}
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No data to display</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 