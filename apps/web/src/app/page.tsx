'use client';

import { useEffect, useState } from 'react';

interface HealthStatus {
  status: string;
  timestamp: string;
}

export default function Home() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    fetch(`${apiUrl}/health`)
      .then((res) => res.json())
      .then((data: HealthStatus) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          Predictive Project Intelligence
        </h1>
        <div className="border rounded-lg p-4">
          <h2 className="text-sm font-medium text-gray-500 mb-2">API Health Status</h2>
          {loading && (
            <p className="text-gray-400">Checking API connection...</p>
          )}
          {error && (
            <div className="text-red-600 bg-red-50 p-3 rounded">
              <p className="font-medium">Connection failed</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
          {health && (
            <div className="text-green-700 bg-green-50 p-3 rounded">
              <p className="font-medium">✓ API is {health.status}</p>
              <p className="text-sm text-gray-500">{health.timestamp}</p>
            </div>
          )}
        </div>
        <p className="text-xs text-center text-gray-400 mt-6">
          Phase 1 — Foundation
        </p>
      </div>
    </main>
  );
}
