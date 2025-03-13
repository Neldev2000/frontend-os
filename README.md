# Process Scheduler Simulator - Frontend

A minimalist, UX-focused dashboard for visualizing and analyzing CPU scheduling algorithms.

## Features

- Interactive visualization of CPU scheduling algorithms
- Real-time updates of process states and statistics
- Performance comparison between different algorithms
- Configurable process generation and algorithm parameters
- Responsive design for various screen sizes

## Supported Algorithms

- **Non-preemptive algorithms**:
  - First-Come, First-Served (FCFS)
  - Shortest Job First (SJF)
  - Priority Scheduling
  - Random Selection

- **Preemptive algorithms**:
  - Shortest Remaining Time First (SRTF)
  - Round Robin (RR)
  - Priority Scheduling with Preemption

## Getting Started

### Prerequisites

- Node.js (18.x or higher recommended)
- pnpm package manager
- Backend server running at `http://localhost:8000`

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd process-scheduler-frontend
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Configuration Tab**:
   - Select a scheduling algorithm
   - Configure algorithm parameters (e.g., time quantum for Round Robin)
   - Generate random processes or create them manually
   - Set simulation speed

2. **Simulation Tab**:
   - View real-time visualization of processes in different states
   - Monitor CPU and ready queue

3. **Statistics Tab**:
   - View performance metrics of the current simulation
   - Analyze CPU utilization, waiting time, turnaround time, etc.

4. **Comparison Tab**:
   - Compare performance metrics of different algorithms
   - Visualize differences through charts

## Backend Integration

The frontend communicates with a backend server providing REST APIs and WebSocket for real-time updates. By default, it connects to `http://localhost:8000`.

### Environment Configuration

The API URL can be configured through environment variables:

1. For local development, create a `.env.local` file in the root directory:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8000
   # Or for WSL:
   # NEXT_PUBLIC_API_URL=http://wsl.localhost:8000
   ```

2. For production deployment, either:
   - Create a `.env.production` file, or
   - Set the environment variable in your deployment platform

For more details on backend integration, see [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md).

## Technologies Used

- Next.js
- React
- TypeScript
- Zustand (State Management)
- shadcn/ui (Component Library)
- Recharts (Visualization Library)
- Socket.io-client (Real-time Communication)
- Tailwind CSS (Styling)

## License

This project is licensed under the MIT License.
