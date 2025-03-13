import { io, Socket } from 'socket.io-client';
import { Process, SimulationConfig } from './api';

// Use environment variable with fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

let socket: Socket | null = null;

// Define the types for our socket data
export interface SimulationStepData {
  currentTime: number;
  processes?: Process[];
  queues?: {
    readyQueue?: Process[];
    runningProcess?: Process | null;
    waitingQueue?: Process[];
    completedProcesses?: Process[];
  };
  statistics?: Record<string, string | number>;
}

export interface SimulationCompletedData {
  results: Process[];
  statistics: Record<string, string | number>;
}

// Initialize socket connection
export const initializeSocket = (
  onSimulationStep: (data: SimulationStepData) => void,
  onSimulationCompleted: (data: SimulationCompletedData) => void,
  onSimulationError: (error: Error | { message: string }) => void,
  onSimulationState: (state: string | { state: string; tickSpeed?: number }) => void
) => {
  if (socket) {
    console.log('Disconnecting existing socket');
    socket.disconnect();
  }

  console.log('Connecting to socket server at:', API_URL);
  try {
    socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Setup event listeners
    socket.on('connect', () => {
      console.log('Socket connected successfully with ID:', socket?.id);
    });
    
    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      onSimulationError({message: `Failed to connect to simulation server: ${err.message}`});
    });
    
    socket.on('simulation-step', onSimulationStep);
    socket.on('simulation-completed', onSimulationCompleted);
    socket.on('simulation-error', onSimulationError);
    socket.on('simulation-state', onSimulationState);

    return socket;
  } catch (err) {
    console.error('Error initializing socket:', err);
    throw new Error('Failed to initialize socket connection');
  }
};

// Start a real-time simulation
export const startSimulation = (
  algorithm: string,
  processes: Process[],
  stepInterval: number = 1000,
  config: SimulationConfig = {}
) => {
  if (!socket) {
    throw new Error('Socket not initialized. Call initializeSocket first.');
  }

  socket.emit('start-simulation', {
    algorithm,
    processes,
    stepInterval,
    config,
  });
};

// Pause the simulation
export const pauseSimulation = () => {
  if (!socket) {
    throw new Error('Socket not initialized');
  }
  
  socket.emit('pause-simulation');
};

// Resume the simulation
export const resumeSimulation = () => {
  if (!socket) {
    throw new Error('Socket not initialized');
  }
  
  socket.emit('resume-simulation');
};

// Execute a single step in the simulation
export const stepSimulation = () => {
  if (!socket) {
    throw new Error('Socket not initialized');
  }
  
  socket.emit('step-simulation');
};

// Reset the simulation
export const resetSimulation = () => {
  if (!socket) {
    throw new Error('Socket not initialized');
  }
  
  socket.emit('reset-simulation');
};

// Change the simulation tick speed
export const changeTickSpeed = (stepInterval: number) => {
  if (!socket) {
    throw new Error('Socket not initialized');
  }
  
  socket.emit('change-tick-speed', {
    stepInterval
  });
};

// Clean up the socket connection
export const cleanupSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}; 