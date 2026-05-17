import { Rocket } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import type { DeploymentPayload, DeploymentStatus, Environment, Service } from '../lib/types';

type DeploymentFormProps = {
  services: Service[];
  onSubmit: (payload: DeploymentPayload) => Promise<void>;
};

const statusOptions: DeploymentStatus[] = ['healthy', 'progressing', 'degraded', 'failed'];
const environmentOptions: Environment[] = ['development', 'staging', 'production'];

export default function DeploymentForm({ services, onSubmit }: DeploymentFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<DeploymentPayload>({
    service_id: services[0]?.id ?? 1,
    environment: 'staging',
    version: 'v1.0.0',
    status: 'progressing',
    replicas: 2,
    cpu_request: '250m',
    memory_request: '512Mi',
    latency_ms: 120,
    error_rate: 0.2,
    deployed_by: 'Instructor',
  });

  function update<K extends keyof DeploymentPayload>(key: K, value: DeploymentPayload[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  useEffect(() => {
    if (services.length === 0) return;

    setForm((current) => {
      const selectedServiceExists = services.some((service) => service.id === current.service_id);
      return selectedServiceExists ? current : { ...current, service_id: services[0].id };
    });
  }, [services]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(form);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="panel form-panel">
      <div className="panel-heading">
        <div>
          <p>Hands-on API Write</p>
          <h2>Register Deployment</h2>
        </div>
        <Rocket size={22} />
      </div>

      <form onSubmit={handleSubmit}>
        <label>
          Service
          <select
            value={form.service_id}
            onChange={(event) => update('service_id', Number(event.target.value))}
          >
            {services.map((service) => (
              <option value={service.id} key={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </label>

        <div className="form-grid">
          <label>
            Environment
            <select
              value={form.environment}
              onChange={(event) => update('environment', event.target.value as Environment)}
            >
              {environmentOptions.map((environment) => (
                <option value={environment} key={environment}>
                  {environment}
                </option>
              ))}
            </select>
          </label>

          <label>
            Status
            <select
              value={form.status}
              onChange={(event) => update('status', event.target.value as DeploymentStatus)}
            >
              {statusOptions.map((status) => (
                <option value={status} key={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="form-grid">
          <label>
            Version
            <input value={form.version} onChange={(event) => update('version', event.target.value)} />
          </label>
          <label>
            Deployed By
            <input value={form.deployed_by} onChange={(event) => update('deployed_by', event.target.value)} />
          </label>
        </div>

        <div className="form-grid thirds">
          <label>
            Replicas
            <input
              type="number"
              min="1"
              max="20"
              value={form.replicas}
              onChange={(event) => update('replicas', Number(event.target.value))}
            />
          </label>
          <label>
            CPU
            <input value={form.cpu_request} onChange={(event) => update('cpu_request', event.target.value)} />
          </label>
          <label>
            Memory
            <input
              value={form.memory_request}
              onChange={(event) => update('memory_request', event.target.value)}
            />
          </label>
        </div>

        <div className="form-grid">
          <label>
            Latency ms
            <input
              type="number"
              min="1"
              value={form.latency_ms}
              onChange={(event) => update('latency_ms', Number(event.target.value))}
            />
          </label>
          <label>
            Error %
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.error_rate}
              onChange={(event) => update('error_rate', Number(event.target.value))}
            />
          </label>
        </div>

        <button type="submit" disabled={submitting || services.length === 0}>
          <Rocket size={18} />
          {submitting ? 'Saving...' : 'Create Deployment'}
        </button>
      </form>
    </section>
  );
}
