import { useState, useEffect } from 'react';
import KPICard from '../components/common/KPICard';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const SCHOOL_ID = '11111111-1111-1111-1111-111111111111';

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/dashboard/overview`, { headers: { 'x-school-id': SCHOOL_ID } }).then(r => r.json()),
    ])
      .then(([ov]) => { setOverview(ov); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: 40, fontFamily: 'var(--font-sans)', color: 'var(--ink-60)', fontSize: 14 }}>Loading...</div>;
  if (error) return <div style={{ padding: 40, fontFamily: 'var(--font-sans)', color: 'red', fontSize: 14 }}>Error: {error}</div>;

  const fmt = (n) => n?.toLocaleString('en-IN') ?? '—';
  const pct = (n) => n != null ? `${n}%` : '—';
  const currency = (n) => n != null ? `₹${(n / 100000).toFixed(1)}L` : '—';

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 400, color: 'var(--ink)', margin: 0 }}>
          Administrator Dashboard
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-60)' }}>
          Operational management and compliance
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <KPICard label="Total Students" value={fmt(overview.students.total_students)} delta={`${fmt(overview.students.active_students)} active`} deltaType="success" />
        <KPICard label="Attendance Today" value={pct(overview.attendance.today_attendance_rate)} delta={`${fmt(overview.attendance.absent_students_today)} absent`} deltaType={overview.attendance.today_attendance_rate >= 85 ? 'success' : 'warning'} />
        <KPICard label="Pending Signatures" value={fmt(overview.academics.pending_signatures)} delta="report cards" deltaType={overview.academics.pending_signatures > 0 ? 'warning' : 'success'} />
        <KPICard label="At-Risk Students" value={fmt(overview.academics.at_risk_students)} delta="needs attention" deltaType={overview.academics.at_risk_students > 0 ? 'danger' : 'success'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <KPICard label="Exams Completed" value={fmt(overview.academics.exams_completed)} delta={`Avg: ${pct(overview.academics.average_exam_score)}`} deltaType="success" />
        <KPICard label="Homework Today" value={fmt(overview.homework.homework_assigned_today)} delta="assigned" deltaType="neutral" />
        <KPICard label="Fee Collected" value={currency(overview.finance.total_fee_collected)} delta={`${fmt(overview.finance.overdue_invoices)} overdue`} deltaType={overview.finance.overdue_invoices > 0 ? 'warning' : 'success'} />
        <KPICard label="Unread Notifications" value={fmt(overview.communication.unread_notifications)} delta={`${fmt(overview.communication.active_message_threads)} threads`} deltaType="neutral" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 'var(--space-4)' }}>
        <div style={{ background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, marginTop: 0, marginBottom: 16 }}>
            School Overview
          </h3>
          {[
            { label: 'Total Students', value: fmt(overview.students.total_students) },
            { label: 'Active Enrollments', value: fmt(overview.students.active_students) },
            { label: 'Today Attendance Rate', value: pct(overview.attendance.today_attendance_rate) },
            { label: 'Monthly Avg Attendance', value: pct(overview.attendance.average_attendance_this_month) },
            { label: 'Exams Completed', value: fmt(overview.academics.exams_completed) },
            { label: 'Average Exam Score', value: pct(overview.academics.average_exam_score) },
            { label: 'Homework Submission Rate', value: pct(overview.homework.homework_submission_rate) },
            { label: 'Outstanding Fees', value: currency(overview.finance.outstanding_fees) },
          ].map((item, i, arr) => (
            <div key={item.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '9px 0', borderBottom: i < arr.length - 1 ? '0.5px solid var(--border)' : 'none'
            }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-60)' }}>{item.label}</span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{item.value}</span>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, marginTop: 0, marginBottom: 16 }}>
            Communication
          </h3>
          {[
            { label: 'Notifications Today', value: fmt(overview.communication.notifications_sent_today) },
            { label: 'Active Threads', value: fmt(overview.communication.active_message_threads) },
            { label: 'Unread', value: fmt(overview.communication.unread_notifications) },
            { label: 'Pending HW Reviews', value: fmt(overview.homework.pending_homework_reviews) },
            { label: 'Top Class', value: overview.academics.top_performing_class?.class_name || '—' },
          ].map((item, i, arr) => (
            <div key={item.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '9px 0', borderBottom: i < arr.length - 1 ? '0.5px solid var(--border)' : 'none'
            }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-60)' }}>{item.label}</span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
