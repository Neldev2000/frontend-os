import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { AlgorithmResult } from './store/algorithm-results';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format percentage for display
export const formatPercentage = (value: string | number): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return `${numValue.toFixed(2)}%`;
};

// Format time for display
export const formatTime = (value: string | number): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return `${numValue.toFixed(2)}`;
};

// Generate random color for charts
export const generateRandomColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Prepare data for algorithm comparison chart
export const prepareComparisonData = (results: AlgorithmResult[]) => {
  if (!results.length) return [];
  
  // Extract algorithm names and statistics
  return results.map(result => ({
    algorithm: result.algorithm,
    cpuUtilization: parseFloat(result.statistics.cpuUtilization),
    avgWaitingTime: parseFloat(result.statistics.avgWaitingTime),
    avgTurnaroundTime: parseFloat(result.statistics.avgTurnaroundTime),
    avgResponseTime: parseFloat(result.statistics.avgResponseTime),
    throughput: parseFloat(result.statistics.throughput)
  }));
};

// Format algorithms for select options
export const formatAlgorithmOptions = (algorithms: string[]) => {
  if (!algorithms.length) return [];
  
  return algorithms.map(algorithm => ({
    value: algorithm,
    label: getAlgorithmFullName(algorithm)
  }));
};

// Get full algorithm name
export const getAlgorithmFullName = (algorithm: string): string => {
  const algorithmNames: Record<string, string> = {
    'FCFS': 'First-Come, First-Served',
    'SJF': 'Shortest Job First',
    'SRTF': 'Shortest Remaining Time First',
    'RR': 'Round Robin',
    'PRIORITY': 'Priority (Non-preemptive)',
    'PRIORITY_P': 'Priority (Preemptive)',
    'RANDOM': 'Random'
  };
  
  return algorithmNames[algorithm] || algorithm;
};

// Generate unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
