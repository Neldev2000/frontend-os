'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { useSimulationStore } from '@/lib/store/simulation-state';
import { Process } from '@/lib/store/algorithm-results';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Clock, PlayCircle, PauseCircle, CheckCircle } from 'lucide-react';

export function ProcessVisualization() {
  const { simulation } = useSimulationStore();
  const { processes, currentTime, status } = simulation;
  
  // Group processes by state
  const processesByState = processes.reduce((acc, process) => {
    const state = process.state || 'new';
    if (!acc[state]) {
      acc[state] = [];
    }
    acc[state].push(process);
    return acc;
  }, {} as Record<string, Process[]>);
  
  const getProgressValue = (process: Process) => {
    if (!process.burstTime) return 0;
    if (process.remainingTime === undefined) return 0;
    
    return ((process.burstTime - process.remainingTime) / process.burstTime) * 100;
  };
  
  const getStateColor = (state: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-500',
      ready: 'bg-yellow-500',
      running: 'bg-green-500',
      blocked: 'bg-red-500',
      terminated: 'bg-gray-500',
      waiting: 'bg-orange-500'
    };
    
    return colors[state] || 'bg-gray-300';
  };

  const getStatusIcon = () => {
    switch(status) {
      case 'running':
        return <PlayCircle className="h-5 w-5 text-green-500" />;
      case 'paused':
        return <PauseCircle className="h-5 w-5 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Process States</CardTitle>
            <CardDescription>
              Current simulation time: {currentTime}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted">
            {getStatusIcon()}
            <span className="text-sm font-medium capitalize">{status}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {processes.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No simulation data</AlertTitle>
            <AlertDescription>
              Start a simulation to see the process states and transitions.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            {['new', 'ready', 'running', 'blocked', 'waiting', 'terminated'].map((state) => (
              <div key={state} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStateColor(state)}`} />
                  <h3 className="text-sm font-medium capitalize">{state}</h3>
                  <span className="text-xs text-muted-foreground">
                    ({(processesByState[state] || []).length} processes)
                  </span>
                </div>
                
                {(processesByState[state] || []).length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Arrival</TableHead>
                        <TableHead>Burst</TableHead>
                        <TableHead>Remaining</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Progress</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(processesByState[state] || []).map((process) => (
                        <TableRow key={process.id}>
                          <TableCell>{process.name}</TableCell>
                          <TableCell>{process.arrivalTime}</TableCell>
                          <TableCell>{process.burstTime}</TableCell>
                          <TableCell>{process.remainingTime ?? '—'}</TableCell>
                          <TableCell>{process.priority ?? '—'}</TableCell>
                          <TableCell className="w-[100px]">
                            <Progress value={getProgressValue(process)} className="h-2" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">No processes in this state</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 