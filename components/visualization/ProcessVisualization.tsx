'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useSimulationStore } from '@/lib/store/simulation-state';

interface ProcessVisualizationProps {
  showDetailedMetrics?: boolean;
}

export function ProcessVisualization({ showDetailedMetrics = true }: ProcessVisualizationProps) {
  const { simulation } = useSimulationStore();
  const [cpuUtilization, setCpuUtilization] = useState(0);
  
  useEffect(() => {
    // Calculate CPU utilization for the progress bar
    const utilization = parseFloat(simulation.statistics.cpuUtilization || '0');
    setCpuUtilization(isNaN(utilization) ? 0 : utilization);
  }, [simulation.statistics.cpuUtilization]);
  
  // Get the CPU state (running a process or idle)
  const cpuState = simulation.queues.runningProcess ? 'running' : 'idle';
  
  // Get extra metrics from detailed data if available
  const detailedMetrics = simulation.detailedMetrics || {};
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Process Visualization</CardTitle>
        <CardDescription>
          Real-time view of process states and simulation metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* CPU Utilization */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-sm">CPU Utilization</h3>
            <Badge variant={cpuUtilization > 70 ? 'default' : 'secondary'}>
              {cpuUtilization.toFixed(2)}%
            </Badge>
          </div>
          <Progress value={cpuUtilization} className="h-2" />
        </div>
        
        {/* Current Running Process */}
        <div className="space-y-2">
          <h3 className="font-medium text-sm">CPU State</h3>
          <div className="bg-muted p-4 rounded-md">
            {simulation.queues.runningProcess ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{simulation.queues.runningProcess.name}</span>
                  <Badge variant="default">Running</Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Priority: {simulation.queues.runningProcess.priority}</span>
                    <span>Remaining: {simulation.queues.runningProcess.remainingTime} units</span>
                  </div>
                  {simulation.queues.runningProcess.progress !== undefined && (
                    <div className="w-full">
                      <Progress 
                        value={simulation.queues.runningProcess.progress} 
                        className="h-1.5" 
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-2 text-muted-foreground">
                CPU Idle
              </div>
            )}
          </div>
        </div>
        
        {/* Ready Queue */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-sm">Ready Queue</h3>
            <Badge variant="outline">{simulation.queues.readyQueue.length} processes</Badge>
          </div>
          <div className="bg-muted p-3 rounded-md max-h-40 overflow-y-auto">
            {simulation.queues.readyQueue.length > 0 ? (
              <div className="space-y-2">
                {simulation.queues.readyQueue.map((process, index) => (
                  <div key={`${process.id}-${index}`} className="flex justify-between items-center bg-background p-2 rounded-sm text-xs">
                    <span>{process.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Burst: {process.remainingTime}</span>
                      <span className="text-muted-foreground">Priority: {process.priority}</span>
                      <span className="text-muted-foreground">Wait: {process.waitingTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-2 text-muted-foreground text-xs">
                No processes in ready queue
              </div>
            )}
          </div>
        </div>
        
        {/* Completed Processes */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-sm">Completed Processes</h3>
            <Badge variant="outline">{simulation.queues.completedProcesses.length} processes</Badge>
          </div>
          <div className="bg-muted p-3 rounded-md max-h-40 overflow-y-auto">
            {simulation.queues.completedProcesses.length > 0 ? (
              <div className="space-y-2">
                {simulation.queues.completedProcesses.map((process, index) => (
                  <div key={`${process.id}-${index}`} className="flex justify-between items-center bg-background p-2 rounded-sm text-xs">
                    <span>{process.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Turnaround: {process.turnaroundTime}</span>
                      <span className="text-muted-foreground">Wait: {process.waitingTime}</span>
                      <span className="text-muted-foreground">Response: {process.responseTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-2 text-muted-foreground text-xs">
                No completed processes yet
              </div>
            )}
          </div>
        </div>
        
        {/* Detailed Metrics */}
        {showDetailedMetrics && (
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Detailed Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <div className="bg-muted p-3 rounded-md">
                <div className="text-xs text-muted-foreground">Avg. Waiting Time</div>
                <div className="text-lg font-mono">{simulation.statistics.avgWaitingTime || "0.00"}</div>
              </div>
              <div className="bg-muted p-3 rounded-md">
                <div className="text-xs text-muted-foreground">Avg. Turnaround Time</div>
                <div className="text-lg font-mono">{simulation.statistics.avgTurnaroundTime || "0.00"}</div>
              </div>
              <div className="bg-muted p-3 rounded-md">
                <div className="text-xs text-muted-foreground">Avg. Response Time</div>
                <div className="text-lg font-mono">{simulation.statistics.avgResponseTime || "0.00"}</div>
              </div>
              <div className="bg-muted p-3 rounded-md">
                <div className="text-xs text-muted-foreground">Throughput</div>
                <div className="text-lg font-mono">
                  {simulation.statistics.throughput || "0.00"} proc/time
                </div>
              </div>
              {detailedMetrics.contextSwitches !== undefined && (
                <div className="bg-muted p-3 rounded-md">
                  <div className="text-xs text-muted-foreground">Context Switches</div>
                  <div className="text-lg font-mono">{detailedMetrics.contextSwitches}</div>
                </div>
              )}
              {detailedMetrics.cpuIdlePercentage !== undefined && (
                <div className="bg-muted p-3 rounded-md">
                  <div className="text-xs text-muted-foreground">CPU Idle Time</div>
                  <div className="text-lg font-mono">{detailedMetrics.cpuIdlePercentage}%</div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 