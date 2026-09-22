import { Octokit } from 'octokit';
import { env } from '../env.js';

/**
 * Exchange an OAuth authorization code for a GitHub user access token.
 */
export async function exchangeCodeForToken(code: string): Promise<string> {
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const data = (await response.json()) as { access_token?: string; error?: string };
  if (!data.access_token) {
    throw new Error(data.error ?? 'Failed to exchange code for token');
  }
  return data.access_token;
}

/**
 * Get the authenticated GitHub user's profile.
 */
export async function getAuthenticatedUser(token: string) {
  const octokit = new Octokit({ auth: token });
  const { data } = await octokit.rest.users.getAuthenticated();
  return {
    githubId: data.id,
    login: data.login,
    avatarUrl: data.avatar_url,
  };
}

/**
 * List all GitHub App installations accessible to the authenticated user.
 */
export async function getUserInstallations(token: string) {
  const octokit = new Octokit({ auth: token });
  const { data } = await octokit.rest.apps.listInstallationsForAuthenticatedUser();
  return data.installations.map((inst) => ({
    githubId: inst.id,
    appId: inst.app_id,
    account: inst.account
      ? { login: (inst.account as { login: string }).login }
      : null,
  }));
}

/**
 * List repositories accessible to a specific installation.
 */
export async function getInstallationRepos(installationId: number, token: string) {
  const octokit = new Octokit({ auth: token });
  const { data } =
    await octokit.rest.apps.listInstallationReposForAuthenticatedUser({
      installation_id: installationId,
    });
  return data.repositories.map((repo) => ({
    githubId: repo.id,
    name: repo.name,
    owner: repo.owner.login,
    fullName: repo.full_name,
  }));
}

/**
 * List milestones for a repository.
 */
export async function getRepoMilestones(
  owner: string,
  repo: string,
  token: string,
) {
  const octokit = new Octokit({ auth: token });
  const { data } = await octokit.rest.issues.listMilestones({
    owner,
    repo,
    state: 'all',
    sort: 'due_on',
    direction: 'desc',
    per_page: 100,
  });
  return data.map((ms) => ({
    githubId: ms.number,
    number: ms.number,
    title: ms.title,
    description: ms.description ?? null,
    state: ms.state ?? 'open',
    dueOn: ms.due_on ?? null,
    closedAt: ms.closed_at ?? null,
    openIssues: ms.open_issues,
    closedIssues: ms.closed_issues,
    createdAt: ms.created_at,
    updatedAt: ms.updated_at,
  }));
}
