import { useEffect, useState } from 'react';
import { api } from '../api/client';
import KPICard from '../components/common/KPICard';
import PageHeader from '../components/common/PageHeader';
import s from './Generic.module.css';

export default function Revenue() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getFinanceOverview()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="Revenue" subtitle="Platform-wide subscription revenue" />
      <div className={s.kpiGrid}>
        <KPICard label="Revenue Collected" value={loading ? '…' : (data?.total_revenue_collected != null ? '₹' + Number(data.total_revenue_collected).toLocaleString('en-IN') : '—')} deltaType="success" />
        <KPICard label="Active Subscriptions" value={loading ? '…' : (data?.active_subscriptions ?? '—')} deltaType="success" />
        <KPICard label="Total Schools" value={loading ? '…' : (data?.total_schools ?? '—')} deltaType="neutral" />
        <KPICard label="Inactive" value={loading ? '…' : (data?.inactive_subscriptions ?? 0)} deltaType="neutral" />
      </div>
      <div className={s.card}>
        <p style={{color:'var(--text-muted)',fontSize:'var(--text-sm)'}}>Detailed revenue charts — Phase 30.</p>
      </div>
    </div>
  );
}
