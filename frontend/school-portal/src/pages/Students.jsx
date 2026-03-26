import { useState } from 'react';
import { demoData } from '../api/client';

export default function Students() {
    const [filter, setFilter] = useState('all');
    const students = demoData.students;
    const filtered = filter === 'all' ? students : students.filter(s => s.class_name === filter);
    const classes = [...new Set(students.map(s => s.class_name))];

    return (
        <div className="page-content">
            <div className="page-header">
                <div><h2>Students</h2><p>{students.length} students enrolled</p></div>
                <button className="btn btn-primary">➕ Add Student</button>
            </div>
            <div className="card table-card">
                <div className="table-header">
                    <div className="filters">
                        <select className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
                            <option value="all">All Classes</option>
                            {classes.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{filtered.length} results</span>
                </div>
                <table className="data-table">
                    <thead><tr><th>Name</th><th>Admission No</th><th>Class</th><th>Section</th><th>Status</th></tr></thead>
                    <tbody>
                        {filtered.map(s => (
                            <tr key={s.id}>
                                <td className="name-cell">{s.first_name} {s.last_name}</td>
                                <td><code>{s.admission_number}</code></td>
                                <td>{s.class_name}</td>
                                <td>{s.section}</td>
                                <td><span className={`badge ${s.status}`}>{s.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
