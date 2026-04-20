import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Schools.module.css';

// Mock data - will be replaced with API call
const MOCK_SCHOOLS = [
  { id: '1', name: 'Greenfield Academy', subdomain: 'greenfield', plan: 'Premium', status: 'active', students: 1250, adminEmail: 'admin@greenfield.edu', createdAt: '2025-08-15' },
  { id: '2', name: 'Delhi Public School', subdomain: 'dps', plan: 'Enterprise', status: 'active', students: 3400, adminEmail: 'admin@dps.edu', createdAt: '2025-06-01' },
  { id: '3', name: 'St. Xavier\'s High School', subdomain: 'stxaviers', plan: 'Premium', status: 'active', students: 2100, adminEmail: 'principal@stxaviers.edu', createdAt: '2025-09-10' },
  { id: '4', name: 'Modern School', subdomain: 'modern', plan: 'Starter', status: 'suspended', students: 980, adminEmail: 'admin@modern.edu', createdAt: '2025-11-20' },
  { id: '5', name: 'Sanskriti School', subdomain: 'sanskriti', plan: 'Premium', status: 'pending', students: 0, adminEmail: 'setup@sanskriti.edu', createdAt: '2026-01-05' },
];

const getStatusBadge = (status) => {
  const statusMap = {
    active: { label: 'Active', className: styles.statusActive },
    suspended: { label: 'Suspended', className: styles.statusSuspended },
    pending: { label: 'Pending', className: styles.statusPending },
  };
  return statusMap[status] || { label: status, className: '' };
};

const getPlanBadge = (plan) => {
  const planMap = {
    Starter: styles.planStarter,
    Premium: styles.planPremium,
    Enterprise: styles.planEnterprise,
  };
  return planMap[plan] || '';
};

export default function Schools() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredSchools = MOCK_SCHOOLS.filter(school => {
    const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          school.subdomain.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || school.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Schools</h1>
        <p className={styles.pageSubtitle}>Manage all tenant schools on the platform</p>
      </div>

      <div className={styles.actionsBar}>
        <div className={styles.searchWrapper}>
          <input
            type="search"
            placeholder="Search by name or subdomain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filters}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <Link to="/schools/onboarding" className={styles.primaryButton}>
          + Onboard School
        </Link>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>School</th>
              <th>Subdomain</th>
              <th>Plan</th>
              <th>Students</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSchools.map(school => {
              const statusBadge = getStatusBadge(school.status);
              const planClass = getPlanBadge(school.plan);
              return (
                <tr key={school.id}>
                  <td className={styles.schoolName}>{school.name}</td>
                  <td className={styles.subdomain}>{school.subdomain}.lumiqos.io</td>
                  <td><span className={`${styles.planBadge} ${planClass}`}>{school.plan}</span></td>
                  <td>{school.students.toLocaleString()}</td>
                  <td><span className={`${styles.statusBadge} ${statusBadge.className}`}>{statusBadge.label}</span></td>
                  <td>{school.createdAt}</td>
                  <td className={styles.actions}>
                    <button className={styles.actionBtn} title="View Details">👁️</button>
                    <button className={styles.actionBtn} title="Edit">✏️</button>
                    <button className={styles.actionBtn} title="More">⋯</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
