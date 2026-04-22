import { useEffect, useState } from 'react';
import { api } from '../api/client';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';

export default function Engagement() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getEngagement()
      .then(d => setData(Array.isArray(d) ? d : (d?.schools ?? [])))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'schoolName',      label: 'School' },
    { key: 'teacherLoginRate', label: 'Teacher Login Rate', render: v => (
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <div style={{flex:1,height:4,background:'var(--bg-raised)',borderRadius:'var(--r-pill)',overflow:'hidden',maxWidth:120}}>
          <div style={{width:`${v ?? 0}%`,height:'100%',background: v < 60 ? 'var(--danger)' : v < 80 ? 'var(--warning)' : 'var(--positive)',borderRadius:'var(--r-pill)'}} />
        </div>
        <span style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-xs)',width:36}}>{v ?? 0}%</span>
      </div>
    )},
    { key: 'totalTeachers', label: 'Teachers', render: v => <span style={{fontFamily:'var(--font-mono)'}}>{v ?? 0}</span> },
    { key: 'activeTeachers', label: 'Active', render: v => <span style={{fontFamily:'var(--font-mono)'}}>{v ?? 0}</span> },
  ];

  return (
    <div>
      <PageHeader title="Engagement" subtitle="Teacher login rates and activity across tenants" />
      <DataTable columns={columns} rows={data} loading={loading} empty="No engagement data available" />
    </div>
  );
}
