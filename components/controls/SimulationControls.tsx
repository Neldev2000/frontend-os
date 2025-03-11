'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSimulationStore } from '@/lib/store/simulation-state';
import { useAlgorithmResultsStore } from '@/lib/store/algorithm-results';
import { 
  initializeSocket, 
  startSimulation, 
  pauseSimulation, 
  resumeSimulation, 
  stepSimulation, 
  resetSimulation, 
  cleanupSocket
} from '@/lib/socket';
import { runSimulation } from '@/lib/api';
import { generateId } from '@/lib/utils';

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
      (state) => {
        setStatus(state as any);
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
        simulation.algorithmConfig
      );
    } catch (err: any) {
      console.error('Error starting real-time simulation:', err);
      setError(err?.message || 'Failed to start real-time simulation. Please try again.');
    }
  };
  
  const handleSimSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setSimSpeed(value);
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
        <CardTitle>Simulation Controls</CardTitle>
        <CardDescription>
          Control the simulation execution
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Simulation Speed (ms per step):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={100}
                max={2000}
                step={100}
                value={simSpeed}
                onChange={handleSimSpeedChange}
                className="w-full"
              />
              <span className="text-xs w-12 text-right">{simSpeed}ms</span>
            </div>
          </div>
          
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleRunSimulation}
              disabled={loading || simulation.processes.length === 0}
            >
              {loading ? 'Running...' : 'Run Simulation'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleStartRealTimeSimulation}
              disabled={
                simulation.status === 'running' || 
                simulation.processes.length === 0
              }
            >
              Start Real-time
            </Button>
            
            <Button 
              variant="outline"
              onClick={pauseSimulation}
              disabled={simulation.status !== 'running'}
            >
              Pause
            </Button>
            
            <Button 
              variant="outline"
              onClick={resumeSimulation}
              disabled={simulation.status !== 'paused'}
            >
              Resume
            </Button>
            
            <Button 
              variant="outline"
              onClick={stepSimulation}
              disabled={simulation.status !== 'paused'}
            >
              Step
            </Button>
            
            <Button 
              variant="destructive"
              onClick={handleReset}
              disabled={simulation.status === 'running'}
            >
              Reset
            </Button>
          </div>
          
          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm font-medium">Current Status</p>
            <p className="text-xs capitalize">{simulation.status}</p>
            
            <p className="text-sm font-medium mt-2">Selected Algorithm</p>
            <p className="text-xs">{simulation.algorithm}</p>
            
            {simulation.algorithmConfig.timeQuantum && (
              <>
                <p className="text-sm font-medium mt-2">Time Quantum</p>
                <p className="text-xs">{simulation.algorithmConfig.timeQuantum}</p>
              </>
            )}
            
            <p className="text-sm font-medium mt-2">Processes</p>
            <p className="text-xs">{simulation.processes.length} configured</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 