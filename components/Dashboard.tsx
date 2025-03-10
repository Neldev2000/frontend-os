'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlgorithmSelector } from "@/components/controls/AlgorithmSelector";
import { ProcessGenerator } from "@/components/controls/ProcessGenerator";
import { SimulationControls } from "@/components/controls/SimulationControls";
import { ProcessVisualization } from "@/components/visualization/ProcessVisualization";
import { StatisticsPanel } from "@/components/visualization/StatisticsPanel";
import { AlgorithmComparisonChart } from "@/components/visualization/AlgorithmComparisonChart";

export function Dashboard() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="configuration" className="space-y-4">
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
            <SimulationControls />
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
                  <p className="text-muted-foreground">
                    No process currently running
                  </p>
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