import { io, Socket } from 'socket.io-client';
import { Process, SimulationConfig } from './api';

const API_URL = 'http://localhost:8000';

let socket: Socket | null = null;

// Initialize socket connection
export const initializeSocket = (
  onSimulationStep: (data: any) => void,
  onSimulationCompleted: (data: any) => void,
  onSimulationError: (error: any) => void,
  onSimulationState: (state: string) => void
) => {
  if (socket) {
    socket.disconnect();
  }

  socket = io(API_URL);

  // Setup event listeners
  socket.on('simulation-step', onSimulationStep);
  socket.on('simulation-completed', onSimulationCompleted);
  socket.on('simulation-error', onSimulationError);
  socket.on('simulation-state', onSimulationState);

  return socket;
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

// Clean up the socket connection
export const cleanupSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}; 