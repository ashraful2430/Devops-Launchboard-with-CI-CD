import type { Deployment, DeploymentPayload, Environment, Service, Summary } from './types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getSummary(): Promise<Summary> {
  return request<Summary>('/api/summary');
}

export async function getServices(): Promise<Service[]> {
  return request<Service[]>('/api/services');
}

export async function getDeployments(environment?: Environment | 'all'): Promise<Deployment[]> {
  const query = environment && environment !== 'all' ? `?environment=${environment}` : '';
  return request<Deployment[]>(`/api/deployments${query}`);
}

export async function createDeployment(payload: DeploymentPayload): Promise<Deployment> {
  return request<Deployment>('/api/deployments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

