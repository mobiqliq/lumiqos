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
                {(svc.latency_ms ?? svc.latency) != null && (
                  <span className={s.serviceLatency}>{svc.latency_ms ?? svc.latency}ms</span>
                )}
              </div>
            ))
          }
        </div>
      )}
      {data?.db_stats && (
        <div className={s.card} style={{marginTop:'var(--sp-4)'}}>
          <h3 className={s.cardTitle}>Database</h3>
          <div className={s.dbRow}><span>Schools</span><span className={s.mono}>{data.db_stats?.total_schools ?? '—'}</span></div>
          <div className={s.dbRow}><span>Users</span><span className={s.mono}>{data.db_stats?.total_users ?? '—'}</span></div>
          <div className={s.dbRow}><span>Students</span><span className={s.mono}>{data.db_stats?.total_students ?? '—'}</span></div>
        </div>
      )}
    </div>
  );
}
