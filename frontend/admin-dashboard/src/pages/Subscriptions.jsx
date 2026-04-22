import { useEffect, useState } from 'react';
import { api } from '../api/client';
import KPICard from '../components/common/KPICard';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import PageHeader from '../components/common/PageHeader';
import s from './Generic.module.css';

export default function Subscriptions() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getFinanceOverview()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const rows = data?.plans ?? [];

  const columns = [
    { key: 'planName',  label: 'Plan',     render: v => <StatusBadge status={v?.toLowerCase()} /> },
    { key: 'count',     label: 'Schools',  render: v => <span style={{fontFamily:'var(--font-mono)'}}>{v ?? 0}</span> },
    { key: 'mrr',       label: 'MRR',      render: v => <span style={{fontFamily:'var(--font-mono)'}}>{v ?? '—'}</span> },
    { key: 'arr',       label: 'ARR',      render: v => <span style={{fontFamily:'var(--font-mono)'}}>{v ?? '—'}</span> },
  ];

  return (
    <div>
      <PageHeader title="Subscriptions" subtitle="Plan distribution and recurring revenue" />
      <div className={s.kpiGrid}>
        <KPICard label="Total MRR"      value={loading ? '…' : (data?.totalMrr ?? '—')} deltaType="success" />
        <KPICard label="Total ARR"      value={loading ? '…' : (data?.totalArr ?? '—')} deltaType="success" />
        <KPICard label="Active Tenants" value={loading ? '…' : (data?.activeTenants ?? '—')} deltaType="neutral" />
        <KPICard label="Avg. Revenue"   value={loading ? '…' : (data?.avgRevenue ?? '—')} deltaType="neutral" />
      </div>
      <DataTable columns={columns} rows={rows} loading={loading} empty="No subscription data" />
    </div>
  );
}
