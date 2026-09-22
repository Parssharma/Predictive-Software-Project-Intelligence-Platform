'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '../../../lib/api';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      setError('No authorization code received from GitHub');
      return;
    }

    apiFetch<{ user: { login: string }; token: string }>('/auth/github/callback', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
      .then(() => {
        router.push('/connect');
      })
      .catch((err: Error) => {
        setError(err.message);
      });
  }, [searchParams, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Authenticating...</h1>
        {error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            <p className="font-semibold">Authentication Failed</p>
            <p className="text-sm mt-1">{error}</p>
            <a
              href="/"
              className="mt-4 inline-block px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-900"
            >
              Return Home
            </a>
          </div>
        ) : (
          <p className="text-gray-500">Exchanging code with GitHub and signing you in...</p>
        )}
      </div>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div>Loading authentication...</div>}>
      <CallbackContent />
    </Suspense>
  );
}
