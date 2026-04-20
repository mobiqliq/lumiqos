import { useState, useEffect } from 'react';
import KPICard from '../components/common/KPICard';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const SCHOOL_ID = '11111111-1111-1111-1111-111111111111';

export default function FinanceDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/finance/overview`, {
      headers: { 'x-school-id': SCHOOL_ID }
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(json => { setData(json); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  if (loading) return (
    <div style={{ padding: 40, fontFamily: 'var(--font-sans)', color: 'var(--ink-60)', fontSize: 14 }}>
      Loading finance data...
    </div>
  );

  if (error) return (
    <div style={{ padding: 40, fontFamily: 'var(--font-sans)', color: 'red', fontSize: 14 }}>
      Error: {error}
    </div>
  );

  const currency = (n) => n != null ? `₹${(n / 100000).toFixed(1)}L` : '—';
  const fmt = (n) => n?.toLocaleString('en-IN') ?? '—';

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 400, color: 'var(--ink)', margin: 0 }}>
          Finance Dashboard
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-60)' }}>
          Revenue, collections, and budget overview
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <KPICard label="Total Collected" value={currency(data.total_collected)} delta="all time" deltaType="success" />
        <KPICard label="MTD Collected" value={currency(data.mtd_collected)} delta="this month" deltaType="success" />
        <KPICard label="Outstanding Fees" value={currency(data.outstanding_fees)} delta="pending collection" deltaType={data.outstanding_fees > 0 ? 'warning' : 'success'} />
        <KPICard label="Defaulters" value={fmt(data.defaulter_count)} delta={`${fmt(data.overdue_invoices)} overdue invoices`} deltaType={data.defaulter_count > 0 ? 'danger' : 'success'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <div style={{ background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, marginTop: 0, marginBottom: 16 }}>
            Collection Summary
          </h3>
          {[
            { label: 'Total Fee Collected', value: currency(data.total_collected) },
            { label: 'Month-to-Date Collection', value: currency(data.mtd_collected) },
            { label: 'Outstanding Balance', value: currency(data.outstanding_fees) },
            { label: 'Overdue Invoices', value: fmt(data.overdue_invoices) },
            { label: 'Defaulting Students', value: fmt(data.defaulter_count) },
          ].map((item, i, arr) => (
            <div key={item.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: i < arr.length - 1 ? '0.5px solid var(--border)' : 'none'
            }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-60)' }}>{item.label}</span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{item.value}</span>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, marginTop: 0, marginBottom: 16 }}>
            Collection Health
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              {
                label: 'Collection Rate',
                value: data.total_collected + data.outstanding_fees > 0
                  ? Math.round((data.total_collected / (data.total_collected + data.outstanding_fees)) * 100)
                  : 0,
              },
              {
                label: 'MTD vs Outstanding',
                value: data.mtd_collected + data.outstanding_fees > 0
                  ? Math.round((data.mtd_collected / (data.mtd_collected + data.outstanding_fees)) * 100)
                  : 0,
              },
            ].map(item => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13 }}>{item.label}</span>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: item.value >= 80 ? 'var(--success)' : 'var(--warning)' }}>
                    {item.value}%
                  </span>
                </div>
                <div style={{ height: 6, background: 'var(--ink-10)', borderRadius: 3 }}>
                  <div style={{
                    width: `${item.value}%`, height: 6, borderRadius: 3,
                    background: item.value >= 80 ? 'var(--gold)' : 'var(--warning, #f59e0b)'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
