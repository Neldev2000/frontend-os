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
  if (!results || !Array.isArray(results) || results.length === 0) return [];
  
  type ComparisonDataItem = {
    algorithm: string;
    cpuUtilization: number;
    avgWaitingTime: number;
    avgTurnaroundTime: number;
    avgResponseTime: number;
    throughput: number;
  };
  
  try {
    // Extract algorithm names and statistics
    return results.map(result => {
      if (!result || !result.statistics) {
        console.error('Invalid result data:', result);
        return null;
      }
      
      return {
        algorithm: result.algorithm || 'Unknown',
        cpuUtilization: parseFloat(result.statistics.cpuUtilization || '0'),
        avgWaitingTime: parseFloat(result.statistics.avgWaitingTime || '0'),
        avgTurnaroundTime: parseFloat(result.statistics.avgTurnaroundTime || '0'),
        avgResponseTime: parseFloat(result.statistics.avgResponseTime || '0'),
        throughput: parseFloat(result.statistics.throughput || '0')
      };
    }).filter(item => item !== null) as ComparisonDataItem[]; // Filter out null items
  } catch (error) {
    console.error('Error preparing comparison data:', error);
    return [];
  }
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
