import { create } from 'zustand';
import { Process } from './algorithm-results';
import { SimulationStepData } from '../socket';

// Queue structure for simulation
export interface SimulationQueues {
  readyQueue: Process[];
  runningProcess: (Process & { progress?: number }) | null;
  waitingQueue: Process[];
  completedProcesses: Process[];
}

// Simulation state
export interface SimulationState {
  currentTime: number;
  processes: Process[];
  queues: SimulationQueues;
  statistics: {
    cpuUtilization: string;
    avgWaitingTime: string;
    avgTurnaroundTime: string;
    avgResponseTime: string;
    throughput?: string;
  };
  detailedMetrics?: {
    contextSwitches?: number;
    cpuIdleTime?: number;
    cpuIdlePercentage?: string;
    readyQueueLength?: number;
    waitingQueueLength?: number;
    algorithmType?: string;
    tickSpeed?: number;
  };
  algorithm: string;
  algorithmConfig: {
    timeQuantum?: number;
    showDetailedMetrics?: boolean;
  };
  status: 'idle' | 'running' | 'paused' | 'completed';
}

// Store interface
interface SimulationStateStore {
  simulation: SimulationState;
  updateSimulation: (state: Partial<SimulationState>) => void;
  resetSimulation: () => void;
  setAlgorithm: (algorithm: string, config?: { timeQuantum?: number }) => void;
  setProcesses: (processes: Process[]) => void;
  updateSimulationStep: (data: SimulationStepData) => void;
  setStatus: (status: 'idle' | 'running' | 'paused' | 'completed') => void;
}

// Initial state
const initialState: SimulationState = {
  currentTime: 0,
  processes: [],
  queues: {
    readyQueue: [],
    runningProcess: null,
    waitingQueue: [],
    completedProcesses: []
  },
  statistics: {
    cpuUtilization: '0.00',
    avgWaitingTime: '0.00',
    avgTurnaroundTime: '0.00',
    avgResponseTime: '0.00',
    throughput: '0.00'
  },
  detailedMetrics: {},
  algorithm: 'FCFS',
  algorithmConfig: {},
  status: 'idle'
};

// Create the store
export const useSimulationStore = create<SimulationStateStore>()((set) => ({
  simulation: initialState,
  
  updateSimulation: (state) => set((prev) => ({
    simulation: { ...prev.simulation, ...state }
  })),
  
  resetSimulation: () => set({
    simulation: initialState
  }),
  
  setAlgorithm: (algorithm, config = {}) => set((prev) => ({
    simulation: {
      ...prev.simulation,
      algorithm,
      algorithmConfig: config
    }
  })),
  
  setProcesses: (processes) => set((prev) => ({
    simulation: {
      ...prev.simulation,
      processes
    }
  })),
  
  updateSimulationStep: (data) => set((prev) => {
    console.log('Received simulation step update:', data);
    
    // Extract detailed metrics if they exist
    const detailedMetrics: Record<string, string | number> = {};
    if (data.statistics) {
      // Add detailed metrics if they exist
      ['contextSwitches', 'cpuIdleTime', 'cpuIdlePercentage', 'readyQueueLength', 
       'waitingQueueLength', 'algorithmType', 'tickSpeed'].forEach(key => {
        if (data.statistics && data.statistics[key] !== undefined) {
          detailedMetrics[key] = data.statistics[key];
        }
      });
    }
    
    // Ensure all processes have an id (convert undefined to empty string if needed)
    const safeProcesses = Array.isArray(data.processes) 
      ? data.processes.map(p => ({
          ...p,
          id: p.id || `process-${Math.random().toString(36).substring(2, 9)}`
        }))
      : prev.simulation.processes;
    
    // Similarly ensure all processes in queues have an id
    const safeReadyQueue = data.queues?.readyQueue 
      ? data.queues.readyQueue.map(p => ({...p, id: p.id || `process-${Math.random().toString(36).substring(2, 9)}`}))
      : prev.simulation.queues.readyQueue;
    
    const safeWaitingQueue = Array.isArray(data.queues?.waitingQueue) 
      ? data.queues.waitingQueue.map(p => ({...p, id: p.id || `process-${Math.random().toString(36).substring(2, 9)}`}))
      : prev.simulation.queues.waitingQueue;
    
    const safeCompletedProcesses = Array.isArray(data.queues?.completedProcesses) 
      ? data.queues.completedProcesses.map(p => ({...p, id: p.id || `process-${Math.random().toString(36).substring(2, 9)}`}))
      : prev.simulation.queues.completedProcesses;
    
    // Handle running process if present
    const safeRunningProcess = data.queues?.runningProcess 
      ? {...data.queues.runningProcess, id: data.queues.runningProcess.id || `process-${Math.random().toString(36).substring(2, 9)}`}
      : prev.simulation.queues.runningProcess;
    
    return {
      simulation: {
        ...prev.simulation,
        currentTime: data.currentTime ?? prev.simulation.currentTime,
        processes: safeProcesses,
        queues: {
          ...prev.simulation.queues,
          readyQueue: safeReadyQueue,
          runningProcess: safeRunningProcess,
          waitingQueue: safeWaitingQueue,
          completedProcesses: safeCompletedProcesses
        },
        statistics: {
          ...prev.simulation.statistics,
          cpuUtilization: data.statistics?.cpuUtilization?.toString() ?? prev.simulation.statistics.cpuUtilization,
          avgWaitingTime: data.statistics?.avgWaitingTime?.toString() ?? prev.simulation.statistics.avgWaitingTime,
          avgTurnaroundTime: data.statistics?.avgTurnaroundTime?.toString() ?? prev.simulation.statistics.avgTurnaroundTime,
          avgResponseTime: data.statistics?.avgResponseTime?.toString() ?? prev.simulation.statistics.avgResponseTime,
          throughput: data.statistics?.throughput?.toString() ?? prev.simulation.statistics.throughput
        },
        // Add detailed metrics if they exist
        detailedMetrics: Object.keys(detailedMetrics).length > 0 
          ? detailedMetrics 
          : prev.simulation.detailedMetrics
      }
    };
  }),
  
  setStatus: (status) => set((prev) => ({
    simulation: {
      ...prev.simulation,
      status
    }
  }))
})); 