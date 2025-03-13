'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { fetchRandomProcesses, fetchProcessParameters, Process, ParameterInfo } from '@/lib/api';
import { useSimulationStore } from '@/lib/store/simulation-state';
import { generateId } from '@/lib/utils';

export function ProcessGenerator() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [parameterInfo, setParameterInfo] = useState<Record<string, ParameterInfo>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Process generation settings
  const [processCount, setProcessCount] = useState<number>(5);
  const [maxBurstTime, setMaxBurstTime] = useState<number>(10);
  const [maxIoBurstTime, setMaxIoBurstTime] = useState<number>(5);
  const [maxPriority, setMaxPriority] = useState<number>(10);
  const [maxArrivalTime, setMaxArrivalTime] = useState<number>(10);
  
  const { setProcesses: setSimulationProcesses } = useSimulationStore();
  
  // Fetch parameter information on mount
  useEffect(() => {
    const fetchParameters = async () => {
      try {
        const params = await fetchProcessParameters();
        setParameterInfo(params);
      } catch (err) {
        console.error('Error fetching process parameters:', err);
      }
    };
    
    fetchParameters();
  }, []);
  
  // Update simulation processes when our processes change
  useEffect(() => {
    // Add IDs to processes
    const processesWithIds = processes.map(process => ({
      ...process,
      id: process.id || generateId(),
    }));
    
    setSimulationProcesses(processesWithIds);
  }, [processes, setSimulationProcesses]);
  
  const handleGenerateRandomProcesses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const randomProcesses = await fetchRandomProcesses(
        processCount,
        maxBurstTime,
        maxIoBurstTime,
        maxPriority,
        maxArrivalTime
      );
      
      setProcesses(randomProcesses);
    } catch (err) {
      console.error('Error generating random processes:', err);
      setError('Failed to generate random processes. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSettingChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<number>>
  ) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setter(value);
    }
  };
  
  const handleAddProcess = () => {
    setProcesses([
      ...processes,
      {
        id: generateId(),
        name: `Process-${processes.length + 1}`,
        arrivalTime: 0,
        burstTime: 5,
        priority: 1,
        ioBurstTime: 0,
      },
    ]);
  };
  
  const handleRemoveProcess = (index: number) => {
    setProcesses(processes.filter((_, i) => i !== index));
  };
  
  const handleProcessChange = (
    index: number,
    field: keyof Process,
    value: number | string
  ) => {
    const updatedProcesses = [...processes];
    
    // If the field is numeric, convert the string value to a number
    const numericFields: (keyof Process)[] = [
      'arrivalTime',
      'burstTime',
      'priority',
      'ioBurstTime',
    ];
    
    if (typeof value === 'string' && numericFields.includes(field)) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        // @ts-expect-error (we know this is safe due to the numericFields check)
        updatedProcesses[index][field] = numValue;
      }
    } else {
      // @ts-expect-error (we know this is safe due to the runtime check)
      updatedProcesses[index][field] = value;
    }
    
    setProcesses(updatedProcesses);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Process Generator</CardTitle>
        <CardDescription>
          Configure and generate processes for simulation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Random Generation Settings</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-xs" title={parameterInfo.count?.description}>
                  Process Count
                </label>
                <input
                  type="number"
                  value={processCount}
                  onChange={(e) => handleSettingChange(e, setProcessCount)}
                  min={1}
                  max={20}
                  className="w-full px-2 py-1 text-sm border rounded-md"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs" title={parameterInfo.burstTime?.description}>
                  Max Burst Time
                </label>
                <input
                  type="number"
                  value={maxBurstTime}
                  onChange={(e) => handleSettingChange(e, setMaxBurstTime)}
                  min={1}
                  className="w-full px-2 py-1 text-sm border rounded-md"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs" title={parameterInfo.ioBurstTime?.description}>
                  Max I/O Burst
                </label>
                <input
                  type="number"
                  value={maxIoBurstTime}
                  onChange={(e) => handleSettingChange(e, setMaxIoBurstTime)}
                  min={0}
                  className="w-full px-2 py-1 text-sm border rounded-md"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs" title={parameterInfo.priority?.description}>
                  Max Priority
                </label>
                <input
                  type="number"
                  value={maxPriority}
                  onChange={(e) => handleSettingChange(e, setMaxPriority)}
                  min={1}
                  className="w-full px-2 py-1 text-sm border rounded-md"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs" title={parameterInfo.arrivalTime?.description}>
                  Max Arrival Time
                </label>
                <input
                  type="number"
                  value={maxArrivalTime}
                  onChange={(e) => handleSettingChange(e, setMaxArrivalTime)}
                  min={0}
                  className="w-full px-2 py-1 text-sm border rounded-md"
                />
              </div>
            </div>
            
            <Button 
              onClick={handleGenerateRandomProcesses}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Random Processes'}
            </Button>
          </div>
          
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Processes</h3>
              <Button variant="outline" size="sm" onClick={handleAddProcess}>
                Add Process
              </Button>
            </div>
            
            {processes.length > 0 ? (
              <div className="border rounded-md overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Arrival Time</TableHead>
                      <TableHead>Burst Time</TableHead>
                      <TableHead>I/O Burst</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead className="w-[70px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processes.map((process, index) => (
                      <TableRow key={process.id || index}>
                        <TableCell>
                          <input
                            type="text"
                            value={process.name}
                            onChange={(e) => handleProcessChange(index, 'name', e.target.value)}
                            className="w-full px-2 py-1 text-sm border rounded-md"
                          />
                        </TableCell>
                        <TableCell>
                          <input
                            type="number"
                            value={process.arrivalTime}
                            onChange={(e) => handleProcessChange(index, 'arrivalTime', e.target.value)}
                            min={0}
                            className="w-16 px-2 py-1 text-sm border rounded-md"
                          />
                        </TableCell>
                        <TableCell>
                          <input
                            type="number"
                            value={process.burstTime}
                            onChange={(e) => handleProcessChange(index, 'burstTime', e.target.value)}
                            min={1}
                            className="w-16 px-2 py-1 text-sm border rounded-md"
                          />
                        </TableCell>
                        <TableCell>
                          <input
                            type="number"
                            value={process.ioBurstTime ?? 0}
                            onChange={(e) => handleProcessChange(index, 'ioBurstTime', e.target.value)}
                            min={0}
                            className="w-16 px-2 py-1 text-sm border rounded-md"
                          />
                        </TableCell>
                        <TableCell>
                          <input
                            type="number"
                            value={process.priority ?? 1}
                            onChange={(e) => handleProcessChange(index, 'priority', e.target.value)}
                            min={1}
                            className="w-16 px-2 py-1 text-sm border rounded-md"
                          />
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleRemoveProcess(index)}
                            className="h-8 w-8 p-0"
                          >
                            ×
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No processes yet. Generate random processes or add them manually.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 