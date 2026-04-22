import s from './StatusBadge.module.css';

const MAP = {
  active:    { label: 'Active',    cls: 'positive' },
  inactive:  { label: 'Inactive',  cls: 'neutral'  },
  suspended: { label: 'Suspended', cls: 'danger'   },
  pending:   { label: 'Pending',   cls: 'warning'  },
  healthy:   { label: 'Healthy',   cls: 'positive' },
  degraded:  { label: 'Degraded',  cls: 'warning'  },
  down:      { label: 'Down',      cls: 'danger'   },
  starter:   { label: 'Starter',   cls: 'neutral'  },
  growth:    { label: 'Growth',    cls: 'accent'   },
  enterprise:{ label: 'Enterprise',cls: 'accent'   },
};

export default function StatusBadge({ status }) {
  const cfg = MAP[status?.toLowerCase()] || { label: status, cls: 'neutral' };
  return <span className={`${s.badge} ${s[cfg.cls]}`}>{cfg.label}</span>;
}
