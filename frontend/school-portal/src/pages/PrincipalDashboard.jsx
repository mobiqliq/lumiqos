import { useState, useEffect } from 'react';
import { api } from '../api/client';
import KPICard from '../components/common/KPICard';
import PageHeader from '../components/common/PageHeader';

export default function PrincipalDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getDashboard()
      .then(setData)
      .catch(e => setError(e.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n) => n?.toLocaleString('en-IN') ?? '—';
  const pct = (n) => n != null ? `${n}%` : '—';
  const currency = (n) => n != null ? `₹${(n / 100000).toFixed(1)}L` : '—';

  const card = {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r-lg)',
    padding: '20px',
  };

  const row = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '9px 0', borderBottom: '1px solid var(--border)',
  };

  const rowLast = { ...row, borderBottom: 'none' };

  const label = { fontSize: 'var(--text-sm)', color: 'var(--text-muted)' };
  const value = { fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' };

  if (loading) return <div style={{ padding: 'var(--sp-6)', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Loading dashboard…</div>;
  if (error) return <div style={{ padding: 'var(--sp-6)', color: 'var(--danger)', fontSize: 'var(--text-sm)' }}>Error: {error}</div>;

  return (
    <div>
      <PageHeader title="Principal Dashboard" subtitle="School-wide overview and strategic insights" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
        <KPICard label="Total Students"        value={fmt(data.students.total_students)}              delta={`${fmt(data.students.active_students)} active`}              deltaType="success" />
        <KPICard label="Today Attendance"       value={pct(data.attendance.today_attendance_rate)}      delta={`${fmt(data.attendance.absent_students_today)} absent`}       deltaType={data.attendance.today_attendance_rate >= 85 ? 'success' : 'warning'} />
        <KPICard label="Monthly Avg Attendance" value={pct(data.attendance.average_attendance_this_month)} delta="this month"                                               deltaType={data.attendance.average_attendance_this_month >= 85 ? 'success' : 'warning'} />
        <KPICard label="At-Risk Students"       value={fmt(data.academics.at_risk_students)}           delta="needs attention"                                             deltaType={data.academics.at_risk_students > 0 ? 'warning' : 'success'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
        <KPICard label="Exams Completed"    value={fmt(data.academics.exams_completed)}       delta={`Avg: ${pct(data.academics.average_exam_score)}`}                deltaType="success" />
        <KPICard label="Pending Signatures" value={fmt(data.academics.pending_signatures)}    delta="report cards"                                                   deltaType={data.academics.pending_signatures > 0 ? 'warning' : 'success'} />
        <KPICard label="Fee Collected"      value={currency(data.finance.total_fee_collected)} delta={`${fmt(data.finance.overdue_invoices)} overdue`}              deltaType={data.finance.overdue_invoices > 0 ? 'warning' : 'success'} />
        <KPICard label="Outstanding Fees"   value={currency(data.finance.outstanding_fees)}   delta="pending collection"                                             deltaType="warning" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 'var(--sp-4)' }}>
        <div style={card}>
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginTop: 0, marginBottom: 16 }}>Homework Overview</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { label: 'Assigned Today',   value: fmt(data.homework.homework_assigned_today) },
              { label: 'Pending Reviews',  value: fmt(data.homework.pending_homework_reviews) },
              { label: 'Submission Rate',  value: pct(data.homework.homework_submission_rate) },
            ].map(item => (
              <div key={item.label} style={{ textAlign: 'center', padding: 16, background: 'var(--bg-raised)', borderRadius: 'var(--r-md)' }}>
                <div style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{item.value}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={card}>
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginTop: 0, marginBottom: 16 }}>Communication</h3>
          {[
            { label: 'Notifications Sent Today',  value: fmt(data.communication.notifications_sent_today) },
            { label: 'Active Message Threads',    value: fmt(data.communication.active_message_threads) },
            { label: 'Unread Notifications',      value: fmt(data.communication.unread_notifications) },
          ].map((item, i, arr) => (
            <div key={item.label} style={i < arr.length - 1 ? row : rowLast}>
              <span style={label}>{item.label}</span>
              <span style={value}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
