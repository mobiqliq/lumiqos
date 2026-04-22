import PageHeader from '../components/common/PageHeader';
import s from './Generic.module.css';

export default function Settings() {
  return (
    <div>
      <PageHeader title="Settings" subtitle="Platform configuration (coming in Phase 30)" />
      <div className={s.card}>
        <p style={{color:'var(--text-muted)',fontSize:'var(--text-sm)'}}>No settings backend yet. Configuration options will appear here.</p>
      </div>
    </div>
  );
}
