import { Activity, Database, Globe2, Server, Workflow } from 'lucide-react';
import type { Deployment, Tier } from '../lib/types';

const tierIcons: Record<Tier, typeof Globe2> = {
  frontend: Globe2,
  backend: Server,
  database: Database,
  worker: Workflow,
};

type DeploymentTableProps = {
  deployments: Deployment[];
};

export default function DeploymentTable({ deployments }: DeploymentTableProps) {
  return (
    <section className="panel table-panel">
      <div className="panel-heading">
        <div>
          <p>Release Activity</p>
          <h2>Deployments</h2>
        </div>
        <Activity size={22} />
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Environment</th>
              <th>Version</th>
              <th>Status</th>
              <th>Resources</th>
              <th>Signals</th>
              <th>Owner</th>
            </tr>
          </thead>
          <tbody>
            {deployments.map((deployment) => {
              const TierIcon = tierIcons[deployment.service.tier];
              return (
                <tr key={deployment.id}>
                  <td>
                    <div className="service-cell">
                      <TierIcon size={18} />
                      <div>
                        <strong>{deployment.service.name}</strong>
                        <span>{deployment.service.runtime}</span>
                      </div>
                    </div>
                  </td>
                  <td>{deployment.environment}</td>
                  <td>{deployment.version}</td>
                  <td>
                    <span className={`status-pill ${deployment.status}`}>{deployment.status}</span>
                  </td>
                  <td>
                    {deployment.replicas} pods · {deployment.cpu_request} · {deployment.memory_request}
                  </td>
                  <td>
                    {deployment.latency_ms}ms · {deployment.error_rate}% errors
                  </td>
                  <td>{deployment.deployed_by}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

