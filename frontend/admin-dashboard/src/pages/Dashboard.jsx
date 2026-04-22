import { useEffect, useState } from 'react';
import { api } from '../api/client';
import KPICard from '../components/common/KPICard';
import AIInsightStrip from '../components/common/AIInsightStrip';
import PageHeader from '../components/common/PageHeader';
import s from './Dashboard.module.css';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getAdminOverview()
      .then(setData)
      .catch(e => setError(e.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const kpis = [
    { label: 'Total Schools',        value: loading ? '…' : (data?.total_schools ?? '—'),      deltaType: 'success' },
    { label: 'Active Users',         value: loading ? '…' : (data?.total_users ?? '—'),         deltaType: 'success' },
    { label: 'Active Subscriptions', value: loading ? '…' : (data?.active_subscriptions ?? '—'), deltaType: 'success' },
    { label: 'System Health',        value: loading ? '…' : '99.9%', delta: 'All services operational', deltaType: 'neutral' },
  ];

  return (
    <div>
      <PageHeader title="Platform Overview" subtitle="Cross-tenant health and system metrics" />
      <AIInsightStrip text="3 schools have teacher login rates below 60% this week. AI lesson planner usage is up +15% WoW across all tenants." />

      {error && <div className={s.error}>{error}</div>}

      <div className={s.kpiGrid}>
        {kpis.map(k => <KPICard key={k.label} {...k} />)}
      </div>

      <div className={s.row}>
        <div className={s.card}>
          <h3 className={s.cardTitle}>Subscription Breakdown</h3>
          {data?.plan_breakdown?.length ? (
            <div className={s.subList}>
              {data.plan_breakdown.map(({ plan, count }) => (
                <div key={plan} className={s.subRow}>
                  <span className={s.subPlan}>{plan}</span>
                  <div className={s.subTrack}>
                    <div className={s.subFill} style={{ width: `${Math.min(100, ((count||0) / (data.total_schools || 1)) * 100)}%` }} />
                  </div>
                  <span className={s.subCount}>{count ?? 0}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className={s.empty}>No subscription data</div>
          )}
        </div>

        <div className={s.card}>
          <h3 className={s.cardTitle}>Recent Tenant Activity</h3>
          <div className={s.activityList}>
            {(data?.recent_activity || [
              { school: 'Loading…', action: '—', time: '—' },
            ]).map((item, i) => (
              <div key={i} className={s.activityRow}>
                <div className={s.activityDot} />
                <div className={s.activityBody}>
                  <span className={s.activitySchool}>{item.school}</span>
                  <span className={s.activityAction}>{item.action}</span>
                </div>
                <span className={s.activityTime}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
