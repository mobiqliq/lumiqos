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
        <KPICard label="MRR"            value={loading ? '…' : (data?.totalMrr ?? '—')} delta={data?.mrrDelta} deltaType="success" />
        <KPICard label="ARR"            value={loading ? '…' : (data?.totalArr ?? '—')} deltaType="success" />
        <KPICard label="Active Tenants" value={loading ? '…' : (data?.activeTenants ?? '—')} deltaType="neutral" />
        <KPICard label="Avg per Tenant" value={loading ? '…' : (data?.avgRevenue ?? '—')} deltaType="neutral" />
      </div>
      <div className={s.card}>
        <p style={{color:'var(--text-muted)',fontSize:'var(--text-sm)'}}>Detailed revenue charts coming in Phase 30.</p>
      </div>
    </div>
  );
}
