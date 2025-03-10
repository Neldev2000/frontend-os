'use client';

import { useEffect } from "react";
import { Dashboard } from "@/components/Dashboard";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  // For testing API connection
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/scheduler/algorithms');
        if (response.ok) {
          console.log('Successfully connected to backend API');
        } else {
          console.error('Backend API connection failed with status:', response.status);
        }
      } catch (error) {
        console.error('Failed to connect to backend API:', error);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="container mx-auto py-6 space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold">Process Scheduler Simulator</h1>
            <p className="text-muted-foreground">
              Visualize and analyze different CPU scheduling algorithms
            </p>
          </header>

          <Dashboard />
        </div>
      </main>
      <Footer />
    </div>
  );
}
