import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import s from './Schools.module.css';

export default function Schools() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    api.getAdminSchools()
      .then(d => setSchools(Array.isArray(d) ? d : (d?.schools ?? [])))
      .catch(() => setSchools([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = schools.filter(sc => {
    const q = search.toLowerCase();
    const matchSearch = !q || sc.name?.toLowerCase().includes(q) || sc.schoolCode?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || sc.subscriptionStatus === statusFilter || sc.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    { key: 'name',   label: 'School',  render: (v) => <span className={s.schoolName}>{v}</span> },
    { key: 'schoolCode', label: 'Code', render: (v) => <span className={s.mono}>{v || '—'}</span> },
    { key: 'planName',   label: 'Plan', render: (v) => <StatusBadge status={v?.toLowerCase() || 'starter'} /> },
    { key: 'subscriptionStatus', label: 'Status', render: (v) => <StatusBadge status={v || 'active'} /> },
    { key: 'studentCount', label: 'Students', render: (v) => <span className={s.mono}>{(v ?? 0).toLocaleString()}</span> },
    { key: 'id', label: 'Actions', width: '100px', render: (_, row) => (
      <div className={s.actions}>
        <button className={s.actionBtn} title="View">↗</button>
        <button className={s.actionBtn} title="Edit">✎</button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader
        title="Schools"
        subtitle="All tenant schools on the platform"
        actions={
          <Link to="/schools/onboarding" className={s.primaryBtn}>+ Onboard School</Link>
        }
      />

      <div className={s.toolbar}>
        <input
          className={s.search}
          type="search"
          placeholder="Search by name or code…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className={s.select} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <DataTable columns={columns} rows={filtered} loading={loading} empty="No schools found" />
    </div>
  );
}
