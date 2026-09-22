'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '../lib/api';

interface HealthStatus {
  status: string;
  timestamp: string;
}

interface User {
  id: string;
  login: string;
  avatarUrl: string | null;
}

export default function Home() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check API health
    apiFetch<HealthStatus>('/health')
      .then((data) => setHealth(data))
      .catch((err: Error) => setError(err.message));

    // Check auth status
    apiFetch<{ user: User }>('/auth/me')
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleSignIn = async () => {
    try {
      const { url } = await apiFetch<{ url: string }>('/auth/github');
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate sign-in');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Predictive Project Intelligence
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Forecast milestone completion dates with Monte Carlo simulation
        </p>

        {/* User Auth Card */}
        <div className="border rounded-lg p-6 mb-6 bg-white shadow-sm">
          {loading ? (
            <p className="text-sm text-gray-400">Checking auth session...</p>
          ) : user ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                {user.avatarUrl && (
                  <img src={user.avatarUrl} alt={user.login} className="w-10 h-10 rounded-full" />
                )}
                <div className="text-left">
                  <p className="text-xs text-gray-400">Signed in as</p>
                  <p className="font-semibold text-gray-800">{user.login}</p>
                </div>
              </div>
              <Link
                href="/connect"
                className="block w-full py-2.5 px-4 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 transition"
              >
                Go to Repository Picker →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Connect your GitHub repository to get started</p>
              <button
                onClick={handleSignIn}
                className="w-full py-2.5 px-4 bg-gray-900 text-white font-medium text-sm rounded-lg hover:bg-gray-800 flex items-center justify-center gap-2 transition"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                Sign in with GitHub
              </button>
            </div>
          )}
        </div>

        {/* API Health */}
        <div className="border rounded-lg p-4 bg-gray-50 text-left text-xs">
          <p className="font-semibold text-gray-500 mb-1">API Health</p>
          {error && <p className="text-red-600">{error}</p>}
          {health && <p className="text-green-700">✓ API is {health.status} ({health.timestamp})</p>}
        </div>

        <p className="text-xs text-gray-400 mt-6">Phase 2 — GitHub App & Connection</p>
      </div>
    </main>
  );
}
