'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSimulationStore } from '@/lib/store/simulation-state';
import { formatPercentage, formatTime } from '@/lib/utils';

export function StatisticsPanel() {
  const { simulation } = useSimulationStore();
  const { statistics, currentTime, algorithm, queues } = simulation;
  
  const totalProcesses = simulation.processes.length;
  const completedProcesses = queues.completedProcesses?.length || 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Simulation Statistics</CardTitle>
        <CardDescription>
          Performance metrics for the {algorithm} scheduling algorithm
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">CPU Utilization</p>
            <p className="text-2xl font-bold">
              {formatPercentage(statistics.cpuUtilization || 0)}
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium">Avg. Waiting Time</p>
            <p className="text-2xl font-bold">
              {formatTime(statistics.avgWaitingTime || 0)}
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium">Avg. Turnaround Time</p>
            <p className="text-2xl font-bold">
              {formatTime(statistics.avgTurnaroundTime || 0)}
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium">Avg. Response Time</p>
            <p className="text-2xl font-bold">
              {formatTime(statistics.avgResponseTime || 0)}
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium">Current Time</p>
            <p className="text-2xl font-bold">{currentTime}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium">Progress</p>
            <p className="text-2xl font-bold">
              {completedProcesses} / {totalProcesses} processes
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium">Ready Queue</p>
            <p className="text-2xl font-bold">
              {queues.readyQueue?.length || 0} processes
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium">Waiting Queue</p>
            <p className="text-2xl font-bold">
              {queues.waitingQueue?.length || 0} processes
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium">Status</p>
            <p className="text-2xl font-bold capitalize">
              {simulation.status}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 