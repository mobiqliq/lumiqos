import { useEffect, useState } from 'react';
import { api } from '../api/client';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import KPICard from '../components/common/KPICard';
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

  const rows = (data?.subscriptions ?? []).map((s, i) => ({ ...s, id: i }));

  const columns = [
    { key: 'school_id',  label: 'School ID',  render: v => <span style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-xs)'}}>{v}</span> },
    { key: 'plan_name',  label: 'Plan',        render: v => <StatusBadge status={v?.toLowerCase() || 'starter'} /> },
    { key: 'status',     label: 'Status',      render: v => <StatusBadge status={v} /> },
    { key: 'current_period_end', label: 'Renews', render: v => <span style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-xs)',color:'var(--text-muted)'}}>{v ? new Date(v).toLocaleDateString('en-IN') : '—'}</span> },
  ];

  return (
    <div>
      <PageHeader title="Subscriptions" subtitle="Plan distribution and tenant billing status" />
      <div className={s.kpiGrid}>
        <KPICard label="Active Subscriptions" value={loading ? '…' : (data?.active_subscriptions ?? '—')} deltaType="success" />
        <KPICard label="Total Schools"         value={loading ? '…' : (data?.total_schools ?? '—')}        deltaType="neutral" />
        <KPICard label="Inactive"              value={loading ? '…' : (data?.inactive_subscriptions ?? '—')} deltaType="neutral" />
        <KPICard label="Revenue Collected"     value={loading ? '…' : (data?.total_revenue_collected != null ? '₹' + Number(data.total_revenue_collected).toLocaleString('en-IN') : '—')} deltaType="neutral" />
      </div>
      <DataTable columns={columns} rows={rows} loading={loading} empty="No subscription data" />
    </div>
  );
}
