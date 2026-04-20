import { useState, useEffect } from 'react';
import KPICard from '../components/common/KPICard';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const SCHOOL_ID = '11111111-1111-1111-1111-111111111111';

export default function HRDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/hr/overview`, {
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
      Loading HR data...
    </div>
  );

  if (error) return (
    <div style={{ padding: 40, fontFamily: 'var(--font-sans)', color: 'red', fontSize: 14 }}>
      Error: {error}
    </div>
  );

  const fmt = (n) => n?.toLocaleString('en-IN') ?? '—';
  const activeRate = data.total_staff > 0
    ? Math.round((data.active_staff / data.total_staff) * 100)
    : 0;

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 400, color: 'var(--ink)', margin: 0 }}>
          HR Dashboard
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-60)' }}>
          Staff management and workforce overview
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <KPICard label="Total Staff" value={fmt(data.total_staff)} delta="registered" deltaType="success" />
        <KPICard label="Active Staff" value={fmt(data.active_staff)} delta={`${activeRate}% active rate`} deltaType={activeRate >= 90 ? 'success' : 'warning'} />
        <KPICard label="Inactive Staff" value={fmt(data.inactive_staff)} delta="on leave or inactive" deltaType={data.inactive_staff > 0 ? 'warning' : 'success'} />
        <KPICard label="Subject Assignments" value={fmt(data.teacher_subject_assignments)} delta="teacher-subject links" deltaType="neutral" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <div style={{ background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, marginTop: 0, marginBottom: 16 }}>
            Staff Summary
          </h3>
          {[
            { label: 'Total Staff', value: fmt(data.total_staff) },
            { label: 'Active', value: fmt(data.active_staff) },
            { label: 'Inactive', value: fmt(data.inactive_staff) },
            { label: 'Active Rate', value: `${activeRate}%` },
            { label: 'Subject Assignments', value: fmt(data.teacher_subject_assignments) },
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
            Role Distribution
          </h3>
          {data.role_distribution.length === 0 ? (
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-60)', padding: '20px 0' }}>
              No staff roles assigned yet.
            </div>
          ) : (
            data.role_distribution.map((role, i) => (
              <div key={role.role} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13 }}>{role.role}</span>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-60)' }}>{role.count}</span>
                </div>
                <div style={{ height: 4, background: 'var(--ink-10)', borderRadius: 2 }}>
                  <div style={{
                    width: `${data.total_staff > 0 ? (role.count / data.total_staff) * 100 : 0}%`,
                    height: 4, background: 'var(--gold)', borderRadius: 2
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
