import { useState, useEffect } from 'react';
import { api } from '../api/client';
import KPICard from '../components/common/KPICard';
import PageHeader from '../components/common/PageHeader';

export default function HRDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getHrOverview()
      .then(setData)
      .catch(e => setError(e.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n) => n?.toLocaleString('en-IN') ?? '—';

  const card = { background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '20px' };
  const row = (last) => ({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: last ? 'none' : '1px solid var(--border)' });
  const lbl = { fontSize: 'var(--text-sm)', color: 'var(--text-muted)' };
  const val = { fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' };

  if (loading) return <div style={{ padding: 'var(--sp-6)', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Loading HR data…</div>;
  if (error) return <div style={{ padding: 'var(--sp-6)', color: 'var(--danger)', fontSize: 'var(--text-sm)' }}>Error: {error}</div>;

  const activeRate = data.total_staff > 0 ? Math.round((data.active_staff / data.total_staff) * 100) : 0;

  return (
    <div>
      <PageHeader title="HR Dashboard" subtitle="Staff management and workforce overview" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
        <KPICard label="Total Staff"          value={fmt(data.total_staff)}                      delta="registered"                        deltaType="success" />
        <KPICard label="Active Staff"         value={fmt(data.active_staff)}                     delta={`${activeRate}% active rate`}       deltaType={activeRate >= 90 ? 'success' : 'warning'} />
        <KPICard label="Inactive Staff"       value={fmt(data.inactive_staff)}                   delta="on leave or inactive"              deltaType={data.inactive_staff > 0 ? 'warning' : 'success'} />
        <KPICard label="Subject Assignments"  value={fmt(data.teacher_subject_assignments)}      delta="teacher-subject links"             deltaType="neutral" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
        <div style={card}>
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginTop: 0, marginBottom: 16 }}>Staff Summary</h3>
          {[
            { label: 'Total Staff',          value: fmt(data.total_staff) },
            { label: 'Active',               value: fmt(data.active_staff) },
            { label: 'Inactive',             value: fmt(data.inactive_staff) },
            { label: 'Active Rate',          value: `${activeRate}%` },
            { label: 'Subject Assignments',  value: fmt(data.teacher_subject_assignments) },
          ].map((item, i, arr) => (
            <div key={item.label} style={row(i === arr.length - 1)}>
              <span style={lbl}>{item.label}</span>
              <span style={val}>{item.value}</span>
            </div>
          ))}
        </div>

        <div style={card}>
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginTop: 0, marginBottom: 16 }}>Role Distribution</h3>
          {data.role_distribution.length === 0 ? (
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', padding: '20px 0' }}>No staff roles assigned yet.</div>
          ) : (
            data.role_distribution.map(role => (
              <div key={role.role} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={lbl}>{role.role}</span>
                  <span style={val}>{role.count}</span>
                </div>
                <div style={{ height: 4, background: 'var(--bg-raised)', borderRadius: 'var(--r-pill)' }}>
                  <div style={{
                    width: `${data.total_staff > 0 ? (role.count / data.total_staff) * 100 : 0}%`,
                    height: 4, background: 'var(--accent)', borderRadius: 'var(--r-pill)'
                  }} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
