import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function Schools() {
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.getSchools()
            .then((data) => setSchools(Array.isArray(data) ? data : []))
            .catch(() => setSchools([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="page-content">
            <div className="page-header">
                <div>
                    <h2>Schools</h2>
                    <p>Manage all registered schools</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/onboarding')}>
                    🚀 Onboard New School
                </button>
            </div>

            <div className="card table-card">
                {loading ? (
                    <div className="empty-state"><p>Loading schools...</p></div>
                ) : schools.length === 0 ? (
                    <div className="empty-state">
                        <div className="icon">🏫</div>
                        <h3>No schools yet</h3>
                        <p>Use the "Onboard New School" button to provision your first tenant.</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>School Name</th>
                                <th>School ID</th>
                                <th>Code</th>
                                <th>Country</th>
                                <th>Region</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schools.map((s, i) => (
                                <tr key={i}>
                                    <td className="name-cell">{s.name || s.school_name}</td>
                                    <td>{s.school_id}</td>
                                    <td><code>{s.school_code}</code></td>
                                    <td>{s.country}</td>
                                    <td>{s.region}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
