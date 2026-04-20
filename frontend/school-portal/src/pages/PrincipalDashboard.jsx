import { useState, useEffect } from 'react';
import KPICard from '../components/common/KPICard';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const SCHOOL_ID = '11111111-1111-1111-1111-111111111111';

export default function PrincipalDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/dashboard/overview`, {
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
      Loading dashboard...
    </div>
  );

  if (error) return (
    <div style={{ padding: 40, fontFamily: 'var(--font-sans)', color: 'red', fontSize: 14 }}>
      Error: {error}
    </div>
  );

  const fmt = (n) => n?.toLocaleString('en-IN') ?? '—';
  const pct = (n) => n != null ? `${n}%` : '—';
  const currency = (n) => n != null ? `₹${(n / 100000).toFixed(1)}L` : '—';

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 400, color: 'var(--ink)', margin: 0 }}>
          Principal Dashboard
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-60)' }}>
          School-wide overview and strategic insights
        </p>
      </div>

      {/* Row 1: Students + Attendance */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
        <KPICard label="Total Students" value={fmt(data.students.total_students)} delta={`${fmt(data.students.active_students)} active`} deltaType="success" />
        <KPICard label="Today Attendance" value={pct(data.attendance.today_attendance_rate)} delta={`${fmt(data.attendance.absent_students_today)} absent`} deltaType={data.attendance.today_attendance_rate >= 85 ? 'success' : 'warning'} />
        <KPICard label="Monthly Avg Attendance" value={pct(data.attendance.average_attendance_this_month)} delta="this month" deltaType={data.attendance.average_attendance_this_month >= 85 ? 'success' : 'warning'} />
        <KPICard label="At-Risk Students" value={fmt(data.academics.at_risk_students)} delta="needs attention" deltaType={data.academics.at_risk_students > 0 ? 'warning' : 'success'} />
      </div>

      {/* Row 2: Academics + Finance */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <KPICard label="Exams Completed" value={fmt(data.academics.exams_completed)} delta={`Avg score: ${pct(data.academics.average_exam_score)}`} deltaType="success" />
        <KPICard label="Pending Signatures" value={fmt(data.academics.pending_signatures)} delta="report cards" deltaType={data.academics.pending_signatures > 0 ? 'warning' : 'success'} />
        <KPICard label="Fee Collected" value={currency(data.finance.total_fee_collected)} delta={`${fmt(data.finance.overdue_invoices)} overdue`} deltaType={data.finance.overdue_invoices > 0 ? 'warning' : 'success'} />
        <KPICard label="Outstanding Fees" value={currency(data.finance.outstanding_fees)} delta="pending collection" deltaType="warning" />
      </div>

      {/* Row 3: Homework + Communication */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 'var(--space-4)' }}>
        <div style={{ background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, marginTop: 0, marginBottom: 16 }}>
            Homework Overview
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { label: 'Assigned Today', value: fmt(data.homework.homework_assigned_today) },
              { label: 'Pending Reviews', value: fmt(data.homework.pending_homework_reviews) },
              { label: 'Submission Rate', value: pct(data.homework.homework_submission_rate) },
            ].map(item => (
              <div key={item.label} style={{ textAlign: 'center', padding: 16, background: 'var(--surface-1)', borderRadius: 'var(--r-sm)' }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 600, color: 'var(--ink)' }}>{item.value}</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-60)', marginTop: 4 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, marginTop: 0, marginBottom: 16 }}>
            Communication
          </h3>
          {[
            { label: 'Notifications Sent Today', value: fmt(data.communication.notifications_sent_today) },
            { label: 'Active Message Threads', value: fmt(data.communication.active_message_threads) },
            { label: 'Unread Notifications', value: fmt(data.communication.unread_notifications) },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '0.5px solid var(--border)' }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-60)' }}>{item.label}</span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
