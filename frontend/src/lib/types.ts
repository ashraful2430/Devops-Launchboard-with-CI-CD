export type DeploymentStatus = 'healthy' | 'degraded' | 'failed' | 'progressing';
export type Environment = 'development' | 'staging' | 'production';
export type Tier = 'frontend' | 'backend' | 'database' | 'worker';

export type Service = {
  id: number;
  name: string;
  owner: string;
  tier: Tier;
  runtime: string;
  repository_url: string;
  health_endpoint: string;
  created_at: string;
};

export type Deployment = {
  id: number;
  service_id: number;
  environment: Environment;
  version: string;
  status: DeploymentStatus;
  replicas: number;
  cpu_request: string;
  memory_request: string;
  latency_ms: number;
  error_rate: number;
  deployed_by: string;
  created_at: string;
  service: Service;
};

export type Summary = {
  total_services: number;
  total_deployments: number;
  healthy: number;
  degraded: number;
  failed: number;
  progressing: number;
  average_latency_ms: number;
  average_error_rate: number;
};

export type DeploymentPayload = {
  service_id: number;
  environment: Environment;
  version: string;
  status: DeploymentStatus;
  replicas: number;
  cpu_request: string;
  memory_request: string;
  latency_ms: number;
  error_rate: number;
  deployed_by: string;
};

