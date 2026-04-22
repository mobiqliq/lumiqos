import { useState, useEffect } from 'react';
import { api } from '../api/client';
import KPICard from '../components/common/KPICard';
import PageHeader from '../components/common/PageHeader';

const DEMO_STUDENTS = [
  { id: '04d76549-cc74-4bd6-bb3b-c8dac2b48229', name: 'Aarav Sharma' },
  { id: 'd27ef342-a739-47ed-be86-7603e048ef81', name: 'Ishita Patel' },
  { id: 'affd74cb-90b5-4aca-8a2d-421ab41a378b', name: 'Reyansh Singh' },
];

export default function StudentDashboard() {
  const [selected, setSelected] = useState(DEMO_STUDENTS[0]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getParentSummary(selected.id)
      .then(setData)
      .catch(e => setError(e.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [selected]);

  const card = { background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '20px' };
  const row = (last) => ({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: last ? 'none' : '1px solid var(--border)' });
  const lbl = { fontSize: 'var(--text-sm)', color: 'var(--text-muted)' };
  const val = { fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' };

  return (
    <div>
      <PageHeader
        title="Student Dashboard"
        subtitle="Your academic progress and overview"
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            {DEMO_STUDENTS.map(s => (
              <button key={s.id} onClick={() => setSelected(s)} style={{
                padding: '6px 14px', borderRadius: 'var(--r-md)',
                border: '1px solid var(--border)',
                background: selected.id === s.id ? 'var(--accent)' : 'var(--bg-surface)',
                color: selected.id === s.id ? '#fff' : 'var(--text-secondary)',
                fontSize: 'var(--text-sm)', cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
              }}>
                {s.name.split(' ')[0]}
              </button>
            ))}
          </div>
        }
      />

      {loading && <div style={{ padding: 'var(--sp-6)', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Loading…</div>}
      {error && <div style={{ padding: 'var(--sp-6)', color: 'var(--danger)', fontSize: 'var(--text-sm)' }}>Error: {error}</div>}

      {data && !loading && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
            <KPICard label="Student"          value={data.student.name}                               delta="active"                                        deltaType="success" />
            <KPICard label="Attendance"       value={`${data.attendance.percentage}%`}                delta={`${data.attendance.present_days} of ${data.attendance.total_days} days`} deltaType={Number(data.attendance.percentage) >= 75 ? 'success' : 'warning'} />
            <KPICard label="Homework Pending" value={data.homework_pending}                           delta="submissions due"                               deltaType={data.homework_pending > 0 ? 'warning' : 'success'} />
            <KPICard label="Outstanding Fees" value={`₹${(data.fees.outstanding / 100).toFixed(0)}`} delta={`${data.fees.overdue_count} overdue`}           deltaType={data.fees.outstanding > 0 ? 'warning' : 'success'} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
            <div style={card}>
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginTop: 0, marginBottom: 16 }}>Attendance Overview</h3>
              <div style={{ position: 'relative', height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 120 120" style={{ width: 140, height: 140 }}>
                  <circle cx="60" cy="60" r="50" fill="none" stroke="var(--bg-raised)" strokeWidth="12" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke="var(--accent)" strokeWidth="12"
                    strokeDasharray={`${Number(data.attendance.percentage) * 3.14} 314`}
                    strokeLinecap="round" transform="rotate(-90 60 60)" />
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {data.attendance.percentage}%
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>attendance</div>
                </div>
              </div>
            </div>

            <div style={card}>
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginTop: 0, marginBottom: 16 }}>Academic Status</h3>
              {[
                { label: 'Total Days Recorded',  value: data.attendance.total_days },
                { label: 'Days Present',         value: data.attendance.present_days },
                { label: 'Days Absent',          value: data.attendance.total_days - data.attendance.present_days },
                { label: 'Pending Submissions',  value: data.homework_pending },
                { label: 'Fee Outstanding',      value: `₹${(data.fees.outstanding / 100).toFixed(0)}` },
              ].map((item, i, arr) => (
                <div key={item.label} style={row(i === arr.length - 1)}>
                  <span style={lbl}>{item.label}</span>
                  <span style={val}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
