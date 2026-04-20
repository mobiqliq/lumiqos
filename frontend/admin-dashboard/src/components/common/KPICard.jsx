import styles from './KPICard.module.css';

export default function KPICard({ label, value, delta, deltaType = 'neutral' }) {
  const getDeltaColor = () => {
    switch (deltaType) {
      case 'success': return 'var(--success)';
      case 'warning': return 'var(--warning)';
      case 'danger': return 'var(--danger)';
      default: return 'var(--ink-60)';
    }
  };

  return (
    <div className={styles.card}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
      {delta && (
        <span className={styles.delta} style={{ color: getDeltaColor() }}>
          {deltaType === 'success' ? '↑' : deltaType === 'danger' ? '↓' : '•'} {delta}
        </span>
      )}
    </div>
  );
}
