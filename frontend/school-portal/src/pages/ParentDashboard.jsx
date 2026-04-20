import { useState, useEffect } from 'react';
import KPICard from '../components/common/KPICard';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const SCHOOL_ID = '11111111-1111-1111-1111-111111111111';

const DEMO_STUDENTS = [
  { id: '04d76549-cc74-4bd6-bb3b-c8dac2b48229', name: 'Aarav Sharma' },
  { id: 'd27ef342-a739-47ed-be86-7603e048ef81', name: 'Ishita Patel' },
  { id: 'affd74cb-90b5-4aca-8a2d-421ab41a378b', name: 'Reyansh Singh' },
];

export default function ParentDashboard() {
  const [selectedStudent, setSelectedStudent] = useState(DEMO_STUDENTS[0]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/api/parent/summary/${selectedStudent.id}`, {
      headers: { 'x-school-id': SCHOOL_ID }
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(json => { setData(json); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [selectedStudent]);

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 400, color: 'var(--ink)', margin: 0 }}>
            Parent Dashboard
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-60)' }}>
            Your child's academic overview
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {DEMO_STUDENTS.map(s => (
            <button key={s.id} onClick={() => setSelectedStudent(s)} style={{
              padding: '6px 14px', borderRadius: 'var(--r-sm)', border: '0.5px solid var(--border)',
              background: selectedStudent.id === s.id ? 'var(--gold)' : 'var(--surface-2)',
              color: selectedStudent.id === s.id ? 'white' : 'var(--ink)',
              fontFamily: 'var(--font-sans)', fontSize: 13, cursor: 'pointer'
            }}>
              {s.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {loading && <div style={{ padding: 40, fontFamily: 'var(--font-sans)', color: 'var(--ink-60)', fontSize: 14 }}>Loading...</div>}
      {error && <div style={{ padding: 40, fontFamily: 'var(--font-sans)', color: 'red', fontSize: 14 }}>Error: {error}</div>}

      {data && !loading && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <KPICard label="Student" value={data.student.name} delta="enrolled" deltaType="success" />
            <KPICard label="Attendance" value={`${data.attendance.percentage}%`} delta={`${data.attendance.present_days}/${data.attendance.total_days} days`} deltaType={Number(data.attendance.percentage) >= 75 ? 'success' : 'warning'} />
            <KPICard label="Pending Homework" value={data.homework_pending} delta="submissions due" deltaType={data.homework_pending > 0 ? 'warning' : 'success'} />
            <KPICard label="Outstanding Fees" value={`₹${(data.fees.outstanding / 100).toFixed(0)}`} delta={`${data.fees.overdue_count} overdue`} deltaType={data.fees.outstanding > 0 ? 'warning' : 'success'} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div style={{ background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, marginTop: 0, marginBottom: 16 }}>
                Attendance Summary
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Total School Days', value: data.attendance.total_days },
                  { label: 'Days Present', value: data.attendance.present_days },
                  { label: 'Days Absent', value: data.attendance.total_days - data.attendance.present_days },
                  { label: 'Attendance Rate', value: `${data.attendance.percentage}%` },
                ].map((item, i, arr) => (
                  <div key={item.label} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '8px 0', borderBottom: i < arr.length - 1 ? '0.5px solid var(--border)' : 'none'
                  }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-60)' }}>{item.label}</span>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, marginTop: 0, marginBottom: 16 }}>
                Fee Status
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Outstanding Balance', value: `₹${(data.fees.outstanding / 100).toFixed(0)}` },
                  { label: 'Overdue Invoices', value: data.fees.overdue_count },
                  { label: 'Homework Pending', value: data.homework_pending },
                ].map((item, i, arr) => (
                  <div key={item.label} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '8px 0', borderBottom: i < arr.length - 1 ? '0.5px solid var(--border)' : 'none'
                  }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-60)' }}>{item.label}</span>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
