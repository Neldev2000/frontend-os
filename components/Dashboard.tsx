'use client';

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlgorithmSelector } from "@/components/controls/AlgorithmSelector";
import { ProcessGenerator } from "@/components/controls/ProcessGenerator";
import { SimulationControls } from "@/components/controls/SimulationControls";
import { ProcessVisualization } from "@/components/visualization/ProcessVisualization";
import { StatisticsPanel } from "@/components/visualization/StatisticsPanel";
import { AlgorithmComparisonChart } from "@/components/visualization/AlgorithmComparisonChart";
import { useSimulationStore } from "@/lib/store/simulation-state";
import { useAlgorithmResultsStore } from "@/lib/store/algorithm-results";
import { 
  initializeSocket, 
  cleanupSocket
} from "@/lib/socket";
import { generateId } from "@/lib/utils";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<string>("configuration");
  const [socketInitialized, setSocketInitialized] = useState<boolean>(false);
  const { simulation, updateSimulationStep, setStatus } = useSimulationStore();
  const { addResult } = useAlgorithmResultsStore();
  const algorithmRef = useRef(simulation.algorithm);

  // Keep the algorithm reference updated
  useEffect(() => {
    algorithmRef.current = simulation.algorithm;
  }, [simulation.algorithm]);

  // Initialize socket connection once when the Dashboard mounts
  useEffect(() => {
    console.log('Initializing socket connection from Dashboard');
    
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
        
        try {
          // Ensure we have valid data before saving
          if (!data || !data.results || !data.statistics) {
            console.error('Invalid data received from simulation:', data);
            return;
          }
          
          // Create a properly structured result object
          const resultToAdd = {
            id: generateId(),
            algorithm: algorithmRef.current, // Use the ref instead of direct access
            processes: Array.isArray(data.results) ? data.results : [],
            statistics: data.statistics || {},
            timestamp: Date.now()
          };
          
          console.log('Adding algorithm result to store:', resultToAdd);
          addResult(resultToAdd);
          
          // Log current state of results after adding
          setTimeout(() => {
            console.log('Current algorithm results after adding:', 
              useAlgorithmResultsStore.getState().results);
          }, 100);
        } catch (error) {
          console.error('Error saving simulation result:', error);
        }
      },
      // On simulation error
      (err) => {
        console.error('Simulation error:', err);
        setStatus('idle');
      },
      // On simulation state change
      (stateData) => {
        if (typeof stateData === 'object' && 'state' in stateData) {
          setStatus(stateData.state as any);
          // If state includes tickSpeed, update tickSpeed in simulation store
          // (SimulationControls will read this from the store)
        } else if (typeof stateData === 'string') {
          setStatus(stateData as any);
        }
      }
    );
    
    setSocketInitialized(true);
    
    return () => {
      console.log('Cleaning up socket connection from Dashboard');
      cleanupSocket();
    };
  }, []); // Empty dependency array - only run once

  // Switch to simulation tab when simulation is running or paused
  useEffect(() => {
    if (simulation.status === 'running' || simulation.status === 'paused') {
      setActiveTab('simulation');
    }
  }, [simulation.status]);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="simulation">Simulation</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>
        
        {/* Configuration Tab */}
        <TabsContent value="configuration" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AlgorithmSelector />
            <SimulationControls socketInitialized={socketInitialized} />
          </div>
          <ProcessGenerator />
        </TabsContent>
        
        {/* Simulation Tab */}
        <TabsContent value="simulation">
          <ProcessVisualization />
        </TabsContent>
        
        {/* Statistics Tab */}
        <TabsContent value="statistics">
          <div className="space-y-6">
            <StatisticsPanel />
            <Card>
              <CardHeader>
                <CardTitle>Running Process</CardTitle>
                <CardDescription>Current process executing on the CPU</CardDescription>
              </CardHeader>
              <CardContent className="h-[120px] flex items-center justify-center">
                <div className="text-center">
                  {simulation.queues.runningProcess ? (
                    <div>
                      <p className="font-medium">{simulation.queues.runningProcess.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Remaining time: {simulation.queues.runningProcess.remainingTime}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No process currently running
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Comparison Tab */}
        <TabsContent value="comparison">
          <div className="space-y-6">
            <AlgorithmComparisonChart />
            
            <Card>
              <CardHeader>
                <CardTitle>Simulation History</CardTitle>
                <CardDescription>Results from past simulations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <p className="text-muted-foreground">
                    Run different algorithms to see their performance comparison
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 