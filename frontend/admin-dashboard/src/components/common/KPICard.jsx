import s from './KPICard.module.css';

export default function KPICard({ label, value, delta, deltaType = 'neutral', mono = false }) {
  return (
    <div className={s.card}>
      <span className={s.label}>{label}</span>
      <span className={`${s.value} ${mono ? s.mono : ''}`}>{value}</span>
      {delta && (
        <span className={`${s.delta} ${s[deltaType] || ''}`}>{delta}</span>
      )}
    </div>
  );
}
