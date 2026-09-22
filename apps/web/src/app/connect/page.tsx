'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';

interface Repo {
  githubId: number;
  name: string;
  owner: string;
  fullName: string;
}

interface Installation {
  githubId: number;
  repositories: Repo[];
}

interface Milestone {
  githubId: number;
  number: number;
  title: string;
  description: string | null;
  state: string;
  dueOn: string | null;
  closedAt: string | null;
  openIssues: number;
  closedIssues: number;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  login: string;
  avatarUrl: string | null;
}

export default function ConnectPage() {
  const [user, setUser] = useState<User | null>(null);
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [selectedInstId, setSelectedInstId] = useState<number | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);

  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingMilestones, setLoadingMilestones] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    apiFetch<{ user: User }>('/auth/me')
      .then((data) => {
        setUser(data.user);
        setLoadingUser(false);
        return apiFetch<{ installations: Installation[] }>('/github/installations');
      })
      .then((data) => {
        setInstallations(data.installations);
      })
      .catch((err: Error) => {
        setMessage({ type: 'error', text: err.message });
        setLoadingUser(false);
      });
  }, []);

  const handleRepoSelect = (repo: Repo, instId: number) => {
    setSelectedRepo(repo);
    setSelectedInstId(instId);
    setSelectedMilestone(null);
    setLoadingMilestones(true);

    apiFetch<{ milestones: Milestone[] }>(
      `/github/repos/${repo.owner}/${repo.name}/milestones`,
    )
      .then((data) => {
        setMilestones(data.milestones);
        setLoadingMilestones(false);
      })
      .catch((err: Error) => {
        setMessage({ type: 'error', text: err.message });
        setLoadingMilestones(false);
      });
  };

  const handleConnect = async () => {
    if (!selectedInstId || !selectedRepo || !selectedMilestone) return;

    setSubmitting(true);
    setMessage(null);

    try {
      await apiFetch<{ success: boolean }>('/connect', {
        method: 'POST',
        body: JSON.stringify({
          installationGithubId: selectedInstId,
          repository: selectedRepo,
          milestone: selectedMilestone,
        }),
      });

      setMessage({
        type: 'success',
        text: `Successfully connected ${selectedRepo.fullName} — "${selectedMilestone.title}"!`,
      });
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : 'Connection failed';
      setMessage({ type: 'error', text: errMessage });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingUser) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8 bg-gray-50">
        <p className="text-gray-500">Loading your profile & GitHub installations...</p>
      </main>
    );
  }

  const allRepos = installations.flatMap((inst) =>
    inst.repositories.map((repo) => ({ repo, instId: inst.githubId })),
  );

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <header className="flex justify-between items-center mb-8 border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Connect Milestone</h1>
            <p className="text-sm text-gray-500">Select a GitHub repository and milestone to forecast</p>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              {user.avatarUrl && (
                <img src={user.avatarUrl} alt={user.login} className="w-8 h-8 rounded-full" />
              )}
              <span className="text-sm font-semibold">{user.login}</span>
            </div>
          )}
        </header>

        {message && (
          <div
            className={`p-4 rounded-lg mb-6 text-sm ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Step 1: Select Repository */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">1. Select Repository</h2>
          {allRepos.length === 0 ? (
            <div className="bg-yellow-50 p-4 rounded-lg text-sm text-yellow-800">
              No GitHub App installations or repositories found. Please install the GitHub App on your repository first.
            </div>
          ) : (
            <select
              className="w-full p-3 border rounded-lg bg-white"
              value={selectedRepo?.fullName || ''}
              onChange={(e) => {
                const found = allRepos.find((r) => r.repo.fullName === e.target.value);
                if (found) handleRepoSelect(found.repo, found.instId);
              }}
            >
              <option value="">-- Choose a repository --</option>
              {allRepos.map(({ repo, instId }) => (
                <option key={`${instId}-${repo.githubId}`} value={repo.fullName}>
                  {repo.fullName}
                </option>
              ))}
            </select>
          )}
        </section>

        {/* Step 2: Select Milestone */}
        {selectedRepo && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-3">2. Select Milestone</h2>
            {loadingMilestones ? (
              <p className="text-sm text-gray-500">Loading milestones...</p>
            ) : milestones.length === 0 ? (
              <p className="text-sm text-gray-500">No milestones found in this repository.</p>
            ) : (
              <div className="space-y-3">
                {milestones.map((ms) => (
                  <label
                    key={ms.githubId}
                    className={`flex items-start p-4 border rounded-lg cursor-pointer transition ${
                      selectedMilestone?.githubId === ms.githubId
                        ? 'border-indigo-600 bg-indigo-50/50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="milestone"
                      className="mt-1 mr-3"
                      checked={selectedMilestone?.githubId === ms.githubId}
                      onChange={() => setSelectedMilestone(ms)}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">{ms.title}</span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            ms.state === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {ms.state}
                        </span>
                      </div>
                      {ms.description && (
                        <p className="text-sm text-gray-600 mt-1">{ms.description}</p>
                      )}
                      <div className="text-xs text-gray-400 mt-2 flex gap-4">
                        <span>Open issues: {ms.openIssues}</span>
                        <span>Closed issues: {ms.closedIssues}</span>
                        {ms.dueOn && (
                          <span>Due: {new Date(ms.dueOn).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Step 3: Connect Action */}
        <button
          disabled={!selectedMilestone || submitting}
          onClick={handleConnect}
          className="w-full py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {submitting ? 'Connecting...' : 'Connect & Save Selection'}
        </button>
      </div>
    </main>
  );
}
