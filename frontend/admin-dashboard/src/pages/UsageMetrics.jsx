import { useEffect, useState } from 'react';
import { api } from '../api/client';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import s from './Generic.module.css';

export default function UsageMetrics() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getUsageMetrics()
      .then(d => setData(Array.isArray(d) ? d : (d?.schools ?? [])))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'schoolName',    label: 'School' },
    { key: 'activeUsers',   label: 'Active Users (30d)', render: v => <span style={{fontFamily:'var(--font-mono)'}}>{v ?? 0}</span> },
    { key: 'engagementScore', label: 'Engagement Score', render: v => (
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <div style={{flex:1,height:4,background:'var(--bg-raised)',borderRadius:'var(--r-pill)',overflow:'hidden'}}>
          <div style={{width:`${v ?? 0}%`,height:'100%',background:'var(--accent)',borderRadius:'var(--r-pill)'}} />
        </div>
        <span style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-xs)',width:32}}>{v ?? 0}%</span>
      </div>
    )},
    { key: 'lastActive', label: 'Last Active', render: v => <span style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-xs)',color:'var(--text-muted)'}}>{v || '—'}</span> },
  ];

  return (
    <div>
      <PageHeader title="Usage Metrics" subtitle="Active users and engagement per tenant" />
      <DataTable columns={columns} rows={data} loading={loading} empty="No usage data available" />
    </div>
  );
}
