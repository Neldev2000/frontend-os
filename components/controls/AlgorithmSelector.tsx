'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchAlgorithms, fetchAlgorithmDescriptions, AlgorithmDescription } from '@/lib/api';
import { useSimulationStore } from '@/lib/store/simulation-state';

export function AlgorithmSelector() {
  const [algorithms, setAlgorithms] = useState<string[]>([]);
  const [descriptions, setDescriptions] = useState<Record<string, AlgorithmDescription>>({});
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('');
  const [timeQuantum, setTimeQuantum] = useState<number>(2);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const { setAlgorithm } = useSimulationStore();
  
  // Fetch algorithms and descriptions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [algorithmsData, descriptionsData] = await Promise.all([
          fetchAlgorithms(),
          fetchAlgorithmDescriptions()
        ]);
        
        setAlgorithms(algorithmsData);
        setDescriptions(descriptionsData);
        
        // Set default selected algorithm
        if (algorithmsData.length > 0) {
          setSelectedAlgorithm(algorithmsData[0]);
        }
      } catch (err) {
        console.error('Error fetching algorithm data:', err);
        setError('Failed to load algorithms. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Update simulation algorithm when selection changes
  useEffect(() => {
    if (selectedAlgorithm) {
      const config = selectedAlgorithm === 'RR' ? { timeQuantum } : {};
      setAlgorithm(selectedAlgorithm, config);
    }
  }, [selectedAlgorithm, timeQuantum, setAlgorithm]);
  
  const handleAlgorithmChange = (algorithm: string) => {
    setSelectedAlgorithm(algorithm);
  };
  
  const handleTimeQuantumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setTimeQuantum(value);
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Algorithm</CardTitle>
          <CardDescription>
            Loading available scheduling algorithms...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Algorithm</CardTitle>
          <CardDescription className="text-red-500">
            {error}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  const selectedDescription = descriptions[selectedAlgorithm];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Algorithm</CardTitle>
        <CardDescription>
          Choose a scheduling algorithm to simulate
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {algorithms.map((algorithm) => (
              <Button
                key={algorithm}
                variant={selectedAlgorithm === algorithm ? 'default' : 'outline'}
                onClick={() => handleAlgorithmChange(algorithm)}
                className="h-auto py-2 px-3"
              >
                {algorithm}
              </Button>
            ))}
          </div>
          
          {selectedAlgorithm === 'RR' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Time Quantum:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={timeQuantum}
                  onChange={handleTimeQuantumChange}
                  min={1}
                  className="w-20 px-2 py-1 border rounded-md"
                />
                <span className="text-sm text-muted-foreground">time units</span>
              </div>
            </div>
          )}
          
          {selectedDescription && (
            <div className="space-y-2 bg-muted/50 p-3 rounded-md">
              <h3 className="font-medium">{selectedDescription.name}</h3>
              <p className="text-sm text-muted-foreground">
                {selectedDescription.description}
              </p>
              <p className="text-xs">
                Type: <span className="font-medium">{selectedDescription.type}</span>
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 