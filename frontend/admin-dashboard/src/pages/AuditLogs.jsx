import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';

const MOCK = [
  { id: 1, actor: 'platform-admin', action: 'SCHOOL_ONBOARDED',  target: 'Test School',  time: '2026-04-21 14:32' },
  { id: 2, actor: 'platform-admin', action: 'PLAN_CHANGED',       target: 'Test School',  time: '2026-04-20 09:10' },
  { id: 3, actor: 'system',         action: 'HEALTH_CHECK',        target: 'all-services', time: '2026-04-22 00:00' },
];

const columns = [
  { key: 'time',   label: 'Time',   render: v => <span style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-xs)'}}>{v}</span> },
  { key: 'actor',  label: 'Actor' },
  { key: 'action', label: 'Action', render: v => <span style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-xs)',color:'var(--accent)'}}>{v}</span> },
  { key: 'target', label: 'Target' },
];

export default function AuditLogs() {
  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="Platform-level action history (static mock — no backend yet)" />
      <DataTable columns={columns} rows={MOCK} />
    </div>
  );
}
