import { create } from 'zustand';

// Types for process data
export interface Process {
  id: string;
  name: string;
  arrivalTime: number;
  burstTime: number;
  priority?: number;
  ioBurstTime?: number;
  waitingTime?: number;
  turnaroundTime?: number;
  responseTime?: number;
  completionTime?: number;
  remainingTime?: number;
  state?: 'new' | 'ready' | 'running' | 'blocked' | 'terminated';
}

// Types for algorithm statistics
export interface AlgorithmStatistics {
  totalProcesses: number;
  totalTime: number;
  cpuUtilization: string;
  avgWaitingTime: string;
  avgTurnaroundTime: string;
  avgResponseTime: string;
  avgArrivalsPerStep: string;
  throughput: string;
}

// Types for algorithm results
export interface AlgorithmResult {
  id: string;
  algorithm: string;
  processes: Process[];
  statistics: AlgorithmStatistics;
  timestamp: number;
}

// Store interface
interface AlgorithmResultsState {
  results: AlgorithmResult[];
  addResult: (result: AlgorithmResult) => void;
  clearResults: () => void;
  getResultByAlgorithm: (algorithm: string) => AlgorithmResult | undefined;
  compareResults: () => AlgorithmResult[];
}

// Create the store
export const useAlgorithmResultsStore = create<AlgorithmResultsState>()((set, get) => ({
  results: [],
  
  addResult: (result) => set((state) => {
    // If result with same algorithm exists, replace it
    const existingResultIndex = state.results.findIndex(r => r.algorithm === result.algorithm);
    
    if (existingResultIndex !== -1) {
      const newResults = [...state.results];
      newResults[existingResultIndex] = result;
      return { results: newResults };
    } else {
      return { results: [...state.results, result] };
    }
  }),
  
  clearResults: () => set({ results: [] }),
  
  getResultByAlgorithm: (algorithm) => {
    return get().results.find(result => result.algorithm === algorithm);
  },
  
  compareResults: () => {
    return get().results;
  }
})); 