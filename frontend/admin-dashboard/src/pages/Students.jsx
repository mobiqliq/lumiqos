import { useState, useEffect } from 'react';
import { api } from '../api/client';

export default function Students() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getStudents()
            .then((data) => setStudents(Array.isArray(data) ? data : []))
            .catch(() => setStudents([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="page-content">
            <div className="page-header">
                <div>
                    <h2>Students</h2>
                    <p>Student roster across all schools</p>
                </div>
                <button className="btn btn-primary">➕ Add Student</button>
            </div>

            <div className="card table-card">
                {loading ? (
                    <div className="empty-state"><p>Loading students...</p></div>
                ) : students.length === 0 ? (
                    <div className="empty-state">
                        <div className="icon">🎓</div>
                        <h3>No students enrolled</h3>
                        <p>Students will appear here once they are enrolled through school onboarding or manual entry.</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Admission No</th>
                                <th>Class</th>
                                <th>School</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((s, i) => (
                                <tr key={i}>
                                    <td className="name-cell">{s.first_name} {s.last_name}</td>
                                    <td>{s.admission_number}</td>
                                    <td>{s.class_name || '—'}</td>
                                    <td>{s.school_id}</td>
                                    <td><span className={`badge ${s.status || 'active'}`}>{s.status || 'active'}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
