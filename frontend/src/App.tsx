import { Boxes, Gauge, HeartPulse, ShieldAlert } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import DeploymentForm from './components/DeploymentForm';
import DeploymentTable from './components/DeploymentTable';
import MetricCard from './components/MetricCard';
import StatusScene from './components/StatusScene';
import { createDeployment, getDeployments, getServices, getSummary } from './lib/api';
import type { Deployment, DeploymentPayload, Environment, Service, Summary } from './lib/types';

const emptySummary: Summary = {
  total_services: 0,
  total_deployments: 0,
  healthy: 0,
  degraded: 0,
  failed: 0,
  progressing: 0,
  average_latency_ms: 0,
  average_error_rate: 0,
};

type Filter = Environment | 'all';

export default function App() {
  const [summary, setSummary] = useState<Summary>(emptySummary);
  const [services, setServices] = useState<Service[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (currentFilter: Filter) => {
    setLoading(true);
    setError(null);
    try {
      const [summaryData, servicesData, deploymentsData] = await Promise.all([
        getSummary(),
        getServices(),
        getDeployments(currentFilter),
      ]);
      setSummary(summaryData);
      setServices(servicesData);
      setDeployments(deploymentsData);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : 'Could not reach the API');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData('all');
  }, [loadData]);

  async function handleFilterChange(nextFilter: Filter) {
    setFilter(nextFilter);
    await loadData(nextFilter);
  }

  async function handleCreateDeployment(payload: DeploymentPayload) {
    await createDeployment(payload);
    await loadData(filter);
  }

  const healthScore = useMemo(() => {
    if (summary.total_deployments === 0) return 0;
    return Math.round((summary.healthy / summary.total_deployments) * 100);
  }, [summary]);

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">3-tier deployment classroom</p>
          <h1>DevOps LaunchBoard</h1>
          <p>
            Track services, release versions, environments, resource requests, latency, and incident
            signals from a real PostgreSQL-backed API.
          </p>
          <div className="hero-actions">
            <a href="#deployments">View deployments</a>
            <a href="#create">Create release</a>
          </div>
        </div>
        <StatusScene />
      </section>

      <section className="metrics" aria-label="Deployment metrics">
        <MetricCard
          label="Services"
          value={summary.total_services}
          detail="frontend, backend, database"
          icon={<Boxes size={22} />}
        />
        <MetricCard
          label="Health Score"
          value={`${healthScore}%`}
          detail={`${summary.healthy} healthy deployments`}
          icon={<HeartPulse size={22} />}
        />
        <MetricCard
          label="Avg Latency"
          value={`${summary.average_latency_ms}ms`}
          detail={`${summary.average_error_rate}% avg errors`}
          icon={<Gauge size={22} />}
        />
        <MetricCard
          label="Needs Attention"
          value={summary.degraded + summary.failed}
          detail="degraded or failed releases"
          icon={<ShieldAlert size={22} />}
        />
      </section>

      <section className="workspace">
        <div className="toolbar">
          <div>
            <p>Environment</p>
            <h2>Operations View</h2>
          </div>
          <div className="segments">
            {(['all', 'development', 'staging', 'production'] as Filter[]).map((item) => (
              <button
                type="button"
                key={item}
                className={filter === item ? 'active' : ''}
                onClick={() => void handleFilterChange(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="api-error">
            API connection failed. Start the backend and confirm <code>VITE_API_URL</code> is correct.
            <span>{error}</span>
          </div>
        )}

        <div className="content-grid">
          <div id="deployments">
            {loading ? (
              <section className="panel loading-panel">Loading deployment data...</section>
            ) : (
              <DeploymentTable deployments={deployments} />
            )}
          </div>
          <div id="create">
            <DeploymentForm services={services} onSubmit={handleCreateDeployment} />
          </div>
        </div>
      </section>
    </main>
  );
}
