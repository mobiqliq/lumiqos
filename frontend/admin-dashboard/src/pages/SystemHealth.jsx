import { useEffect, useState } from 'react';
import { api } from '../api/client';
import PageHeader from '../components/common/PageHeader';
import StatusBadge from '../components/common/StatusBadge';
import s from './Generic.module.css';

export default function SystemHealth() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSystemHealth()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const services = data?.services ?? [];

  return (
    <div>
      <PageHeader title="System Health" subtitle="Live service status and database metrics" />
      {loading && <p style={{color:'var(--text-muted)',fontSize:'var(--text-sm)'}}>Loading…</p>}
      {!loading && (
        <div className={s.serviceGrid}>
          {services.length === 0
            ? <p style={{color:'var(--text-muted)',fontSize:'var(--text-sm)'}}>No service data returned.</p>
            : services.map((svc, i) => (
              <div key={i} className={s.serviceCard}>
                <div className={s.serviceTop}>
                  <span className={s.serviceName}>{svc.name}</span>
                  <StatusBadge status={svc.status} />
                </div>
                {svc.latency != null && (
                  <span className={s.serviceLatency}>{svc.latency}ms</span>
                )}
              </div>
            ))
          }
        </div>
      )}
      {data?.db && (
        <div className={s.card} style={{marginTop:'var(--sp-4)'}}>
          <h3 className={s.cardTitle}>Database</h3>
          <div className={s.dbRow}><span>Tables</span><span className={s.mono}>{data.db.tables ?? '—'}</span></div>
          <div className={s.dbRow}><span>Size</span><span className={s.mono}>{data.db.size ?? '—'}</span></div>
        </div>
      )}
    </div>
  );
}
