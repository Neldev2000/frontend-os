'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useSimulationStore } from '@/lib/store/simulation-state';
import { useAlgorithmResultsStore } from '@/lib/store/algorithm-results';
import { 
  initializeSocket, 
  startSimulation, 
  pauseSimulation, 
  resumeSimulation, 
  stepSimulation, 
  resetSimulation,
  changeTickSpeed,
  cleanupSocket
} from '@/lib/socket';
import { runSimulation } from '@/lib/api';
import { generateId } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  SkipForward, 
  RefreshCw, 
  FastForward, 
  Rewind, 
  RotateCcw,
  Clock
} from 'lucide-react';

export function SimulationControls() {
  const [simSpeed, setSimSpeed] = useState<number>(1000); // ms per step
  const [socketInitialized, setSocketInitialized] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    simulation, 
    updateSimulationStep, 
    setStatus, 
    resetSimulation: resetSimulationState 
  } = useSimulationStore();
  
  const { addResult } = useAlgorithmResultsStore();
  
  // Initialize socket connection
  useEffect(() => {
    // Ensure the socket is initialized 
    console.log('Initializing socket connection');
    
    const socket = initializeSocket(
      // On simulation step
      (data) => {
        updateSimulationStep(data);
      },
      // On simulation completed
      (data) => {
        setStatus('completed');
        
        // Save result to the results store
        console.log('Saving result to the results store');
        console.log('Data:', data);
        addResult({
          id: generateId(),
          algorithm: simulation.algorithm,
          processes: data.results || [],
          statistics: data.statistics || {},
          timestamp: Date.now()
        });
      },
      // On simulation error
      (err) => {
        console.error('Simulation error:', err);
        setError(err.message || 'An error occurred during simulation');
        setStatus('idle');
      },
      // On simulation state change
      (stateData) => {
        if (typeof stateData === 'object' && 'state' in stateData) {
          setStatus(stateData.state as any);
          // If state includes tickSpeed, update the local simSpeed
          if ('tickSpeed' in stateData && typeof stateData.tickSpeed === 'number') {
            setSimSpeed(stateData.tickSpeed);
          }
        } else if (typeof stateData === 'string') {
          setStatus(stateData as any);
        }
      }
    );
    
    setSocketInitialized(true);
    
    return () => {
      console.log('Cleaning up socket connection');
      cleanupSocket();
    };
  }, []);  // Empty dependency array to run only once
  
  // Run one-time simulation
  const handleRunSimulation = async () => {
    try {
      console.log('Running one-time simulation');
      setLoading(true);
      setError(null);
      
      const result = await runSimulation(
        simulation.algorithm,
        simulation.processes,
        simulation.algorithmConfig
      );
      
      // Update simulation with results
      updateSimulationStep({
        processes: result.results || [],
        statistics: result.statistics || {},
        currentTime: result.statistics?.totalTime || 0,
      });
      
      // Add to results store
      console.log('Adding result to the results store');
      console.log('Result:', result);
      addResult({
        id: generateId(),
        algorithm: simulation.algorithm,
        processes: result.results || [],
        statistics: result.statistics || {},
        timestamp: Date.now()
      });
      
      setStatus('completed');
    } catch (err) {
      console.error('Error running simulation:', err);
      setError('Failed to run simulation. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Start real-time simulation
  const handleStartRealTimeSimulation = () => {
    try {
      setError(null);
      
      if (!socketInitialized) {
        console.error('Socket not initialized yet');
        setError('Socket connection not established. Please refresh the page and try again.');
        return;
      }
      
      console.log('Starting real-time simulation with:', {
        algorithm: simulation.algorithm,
        processes: simulation.processes.length,
        simSpeed,
        config: simulation.algorithmConfig
      });
      
      startSimulation(
        simulation.algorithm,
        simulation.processes,
        simSpeed,
        {
          ...simulation.algorithmConfig,
          showDetailedMetrics: true // Enable detailed metrics
        }
      );
    } catch (err: any) {
      console.error('Error starting real-time simulation:', err);
      setError(err?.message || 'Failed to start real-time simulation. Please try again.');
    }
  };
  
  // Handle tick speed change from slider
  const handleSimSpeedChange = (value: number[]) => {
    const newSpeed = value[0];
    setSimSpeed(newSpeed);
    
    // If simulation is running, update the tick speed in real-time
    if (simulation.status === 'running' || simulation.status === 'paused') {
      console.log('Changing tick speed to:', newSpeed);
      changeTickSpeed(newSpeed);
    }
  };
  
  // Convenience functions to quickly adjust tick speed
  const increaseSpeed = () => {
    const newSpeed = Math.max(100, simSpeed - 200);
    setSimSpeed(newSpeed);
    if (simulation.status === 'running' || simulation.status === 'paused') {
      changeTickSpeed(newSpeed);
    }
  };
  
  const decreaseSpeed = () => {
    const newSpeed = Math.min(2000, simSpeed + 200);
    setSimSpeed(newSpeed);
    if (simulation.status === 'running' || simulation.status === 'paused') {
      changeTickSpeed(newSpeed);
    }
  };
  
  const handleReset = () => {
    try {
      resetSimulation();
      resetSimulationState();
    } catch (error) {
      console.error('Error resetting simulation:', error);
      // Still reset the UI state even if socket reset fails
      resetSimulationState();
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Simulation Controls
        </CardTitle>
        <CardDescription>
          Control the simulation execution and speed
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Simulation Speed:
              </label>
              <Badge variant="outline" className="font-mono">
                {simSpeed}ms per step
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={decreaseSpeed}
                disabled={simSpeed >= 2000}
                title="Slower"
              >
                <Rewind className="h-4 w-4" />
              </Button>
              
              <Slider
                value={[simSpeed]}
                min={100}
                max={2000}
                step={50}
                onValueChange={handleSimSpeedChange}
                className="flex-1"
              />
              
              <Button 
                variant="outline" 
                size="icon"
                onClick={increaseSpeed}
                disabled={simSpeed <= 100}
                title="Faster"
              >
                <FastForward className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {error && (
            <p className="text-red-500 text-sm p-2 bg-red-50 rounded-md">{error}</p>
          )}
          
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleRunSimulation}
              disabled={loading || simulation.processes.length === 0}
              className="flex items-center gap-1"
            >
              {loading ? 'Running...' : (
                <>
                  <Play className="h-4 w-4" /> Run Simulation
                </>
              )}
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleStartRealTimeSimulation}
              disabled={
                simulation.status === 'running' || 
                simulation.processes.length === 0
              }
              className="flex items-center gap-1"
            >
              <Play className="h-4 w-4" /> Start Real-time
            </Button>
            
            <Button 
              variant="outline"
              onClick={pauseSimulation}
              disabled={simulation.status !== 'running'}
              className="flex items-center gap-1"
            >
              <Pause className="h-4 w-4" /> Pause
            </Button>
            
            <Button 
              variant="outline"
              onClick={resumeSimulation}
              disabled={simulation.status !== 'paused'}
              className="flex items-center gap-1"
            >
              <Play className="h-4 w-4" /> Resume
            </Button>
            
            <Button 
              variant="outline"
              onClick={stepSimulation}
              disabled={simulation.status !== 'paused'}
              className="flex items-center gap-1"
            >
              <SkipForward className="h-4 w-4" /> Step
            </Button>
            
            <Button 
              variant="destructive"
              onClick={handleReset}
              disabled={simulation.status === 'running'}
              className="flex items-center gap-1"
            >
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          </div>
          
          <div className="bg-muted p-3 rounded-md">
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge variant={simulation.status === 'running' ? 'default' : 'secondary'} className="mt-1 capitalize">
                  {simulation.status}
                </Badge>
              </div>
              
              <div>
                <p className="text-sm font-medium">Algorithm</p>
                <p className="text-sm font-mono">{simulation.algorithm}</p>
              </div>
              
              {simulation.algorithmConfig?.timeQuantum && (
                <div>
                  <p className="text-sm font-medium">Time Quantum</p>
                  <p className="text-sm font-mono">{simulation.algorithmConfig.timeQuantum}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium">Processes</p>
                <p className="text-sm font-mono">{simulation.processes.length} configured</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Current Time</p>
                <p className="text-sm font-mono">{simulation.currentTime || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 