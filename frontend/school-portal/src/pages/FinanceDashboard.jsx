import { useState, useEffect } from 'react';
import { api } from '../api/client';
import KPICard from '../components/common/KPICard';
import PageHeader from '../components/common/PageHeader';

export default function FinanceDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getFinanceOverview()
      .then(setData)
      .catch(e => setError(e.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const currency = (n) => n != null ? `₹${(n / 100000).toFixed(1)}L` : '—';
  const fmt = (n) => n?.toLocaleString('en-IN') ?? '—';

  const card = { background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '20px' };
  const row = (last) => ({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: last ? 'none' : '1px solid var(--border)' });
  const lbl = { fontSize: 'var(--text-sm)', color: 'var(--text-muted)' };
  const val = { fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' };

  if (loading) return <div style={{ padding: 'var(--sp-6)', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Loading finance data…</div>;
  if (error) return <div style={{ padding: 'var(--sp-6)', color: 'var(--danger)', fontSize: 'var(--text-sm)' }}>Error: {error}</div>;

  const collectionRate = data.total_collected + data.outstanding_fees > 0
    ? Math.round((data.total_collected / (data.total_collected + data.outstanding_fees)) * 100) : 0;
  const mtdRate = data.mtd_collected + data.outstanding_fees > 0
    ? Math.round((data.mtd_collected / (data.mtd_collected + data.outstanding_fees)) * 100) : 0;

  return (
    <div>
      <PageHeader title="Finance Dashboard" subtitle="Revenue, collections, and budget overview" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
        <KPICard label="Total Collected"   value={currency(data.total_collected)}    delta="all time"             deltaType="success" />
        <KPICard label="MTD Collected"     value={currency(data.mtd_collected)}      delta="this month"           deltaType="success" />
        <KPICard label="Outstanding Fees"  value={currency(data.outstanding_fees)}   delta="pending collection"   deltaType={data.outstanding_fees > 0 ? 'warning' : 'success'} />
        <KPICard label="Defaulters"        value={fmt(data.defaulter_count)}         delta={`${fmt(data.overdue_invoices)} overdue`} deltaType={data.defaulter_count > 0 ? 'danger' : 'success'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
        <div style={card}>
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginTop: 0, marginBottom: 16 }}>Collection Summary</h3>
          {[
            { label: 'Total Fee Collected',      value: currency(data.total_collected) },
            { label: 'Month-to-Date Collection', value: currency(data.mtd_collected) },
            { label: 'Outstanding Balance',      value: currency(data.outstanding_fees) },
            { label: 'Overdue Invoices',         value: fmt(data.overdue_invoices) },
            { label: 'Defaulting Students',      value: fmt(data.defaulter_count) },
          ].map((item, i, arr) => (
            <div key={item.label} style={row(i === arr.length - 1)}>
              <span style={lbl}>{item.label}</span>
              <span style={val}>{item.value}</span>
            </div>
          ))}
        </div>

        <div style={card}>
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginTop: 0, marginBottom: 16 }}>Collection Health</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { label: 'Collection Rate',     value: collectionRate },
              { label: 'MTD vs Outstanding',  value: mtdRate },
            ].map(item => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={lbl}>{item.label}</span>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: item.value >= 80 ? 'var(--positive)' : 'var(--warning)' }}>{item.value}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--bg-raised)', borderRadius: 'var(--r-pill)' }}>
                  <div style={{ width: `${item.value}%`, height: 6, borderRadius: 'var(--r-pill)', background: item.value >= 80 ? 'var(--positive)' : 'var(--warning)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
