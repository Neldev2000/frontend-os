const API_URL = 'http://localhost:8000';

// Process interface
export interface Process {
  id?: string;
  name: string;
  arrivalTime: number;
  burstTime: number;
  ioBurstTime?: number;
  priority?: number;
  remainingTime?: number;
  state?: 'new' | 'ready' | 'running' | 'blocked' | 'terminated';
  waitingTime?: number;
  turnaroundTime?: number;
  responseTime?: number;
  completionTime?: number;
}

// Algorithm Description interface
export interface AlgorithmDescription {
  name: string;
  description: string;
  type: 'preemptive' | 'non-preemptive';
  parameters: {
    name: string;
    description: string;
    type: string;
    defaultValue?: any;
  }[];
}

// Parameter Info interface
export interface ParameterInfo {
  name: string;
  description: string;
}

// Simulation Config interface
export interface SimulationConfig {
  timeQuantum?: number;
}

// Fetch available algorithms
export const fetchAlgorithms = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_URL}/api/scheduler/algorithms`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.algorithms;
    }
    throw new Error('Failed to fetch algorithms');
  } catch (error) {
    console.error('Error fetching algorithms:', error);
    throw error;
  }
};

// Fetch algorithm descriptions
export const fetchAlgorithmDescriptions = async (): Promise<Record<string, AlgorithmDescription>> => {
  try {
    const response = await fetch(`${API_URL}/api/algorithms/descriptions`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.descriptions;
    }
    throw new Error('Failed to fetch algorithm descriptions');
  } catch (error) {
    console.error('Error fetching algorithm descriptions:', error);
    throw error;
  }
};

// Fetch random processes
export const fetchRandomProcesses = async (
  count: number = 5,
  maxBurstTime: number = 10,
  maxIoBurstTime: number = 5,
  maxPriority: number = 10,
  maxArrivalTime: number = 10
): Promise<Process[]> => {
  try {
    const url = new URL(`${API_URL}/api/processes/random`);
    url.searchParams.append('count', count.toString());
    url.searchParams.append('maxBurstTime', maxBurstTime.toString());
    url.searchParams.append('maxIoBurstTime', maxIoBurstTime.toString());
    url.searchParams.append('maxPriority', maxPriority.toString());
    url.searchParams.append('maxArrivalTime', maxArrivalTime.toString());
    
    const response = await fetch(url.toString());
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.processes;
    }
    throw new Error('Failed to fetch random processes');
  } catch (error) {
    console.error('Error fetching random processes:', error);
    throw error;
  }
};

// Fetch process parameter descriptions
export const fetchProcessParameters = async (): Promise<Record<string, ParameterInfo>> => {
  try {
    const response = await fetch(`${API_URL}/api/processes/parameters`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.parameterInfo;
    }
    throw new Error('Failed to fetch process parameters');
  } catch (error) {
    console.error('Error fetching process parameters:', error);
    throw error;
  }
};

// Run one-time simulation
export const runSimulation = async (
  algorithm: string,
  processes: Process[],
  config: SimulationConfig = {}
) => {
  try {
    const response = await fetch(`${API_URL}/api/scheduler/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        algorithm,
        processes,
        config,
      }),
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      return data;
    }
    throw new Error(data.message || 'Failed to run simulation');
  } catch (error) {
    console.error('Error running simulation:', error);
    throw error;
  }
}; 