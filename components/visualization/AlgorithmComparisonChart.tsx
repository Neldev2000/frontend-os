'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAlgorithmResultsStore } from '@/lib/store/algorithm-results';
import { prepareComparisonData, generateRandomColor, getAlgorithmFullName } from '@/lib/utils';

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
  const { results, compareResults } = useAlgorithmResultsStore();
  
  // Prepare comparison data for chart
  const chartData = useMemo(() => prepareComparisonData(results), [results]);
  
  // Generate colors for each algorithm
  const lineColors = useMemo(
    () => results.map(() => generateRandomColor()),
    [results.length]
  );
  
  if (chartData.length === 0) {
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
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="algorithm" tickFormatter={getAlgorithmFullName} />
              <YAxis />
              <Tooltip
                formatter={(value, name) => {
                  const metric = metrics.find(m => m.key === name);
                  return [`${value}${metric?.unit || ''}`, metric?.name || name];
                }}
              />
              <Legend />
              {metrics.map((metric, index) => (
                <Line
                  key={metric.key}
                  type="monotone"
                  dataKey={metric.key}
                  name={metric.name}
                  stroke={lineColors[index % lineColors.length]}
                  activeDot={{ r: 8 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 