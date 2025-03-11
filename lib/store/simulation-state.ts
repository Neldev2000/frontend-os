import { create } from 'zustand';
import { Process } from './algorithm-results';

// Queue structure for simulation
export interface SimulationQueues {
  readyQueue: Process[];
  runningProcess: Process | null;
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
  };
  algorithm: string;
  algorithmConfig: {
    timeQuantum?: number;
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
  updateSimulationStep: (data: any) => void;
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
    avgResponseTime: '0.00'
  },
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
    
    return {
      simulation: {
        ...prev.simulation,
        currentTime: data.currentTime ?? prev.simulation.currentTime,
        processes: Array.isArray(data.processes) ? data.processes : prev.simulation.processes,
        queues: {
          ...prev.simulation.queues,
          readyQueue: data.queues?.readyQueue ?? prev.simulation.queues.readyQueue,
          runningProcess: data.queues?.runningProcess ?? prev.simulation.queues.runningProcess,
          waitingQueue: Array.isArray(data.queues?.waitingQueue) 
            ? data.queues.waitingQueue 
            : prev.simulation.queues.waitingQueue,
          completedProcesses: Array.isArray(data.queues?.completedProcesses) 
            ? data.queues.completedProcesses 
            : prev.simulation.queues.completedProcesses
        },
        statistics: {
          ...prev.simulation.statistics,
          cpuUtilization: data.statistics?.cpuUtilization ?? prev.simulation.statistics.cpuUtilization,
          avgWaitingTime: data.statistics?.avgWaitingTime ?? prev.simulation.statistics.avgWaitingTime,
          avgTurnaroundTime: data.statistics?.avgTurnaroundTime ?? prev.simulation.statistics.avgTurnaroundTime,
          avgResponseTime: data.statistics?.avgResponseTime ?? prev.simulation.statistics.avgResponseTime
        }
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