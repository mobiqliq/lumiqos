import { demoData } from '../api/client';

export default function Teachers() {
    const teachers = demoData.teachers;
    return (
        <div className="page-content">
            <div className="page-header">
                <div><h2>Teachers</h2><p>{teachers.length} faculty members</p></div>
                <button className="btn btn-primary">➕ Add Teacher</button>
            </div>
            <div className="card table-card">
                <table className="data-table">
                    <thead><tr><th>Name</th><th>Subject</th><th>Classes</th><th>Experience</th><th>Status</th></tr></thead>
                    <tbody>
                        {teachers.map(t => (
                            <tr key={t.id}>
                                <td className="name-cell">{t.name}</td>
                                <td>{t.subject}</td>
                                <td>{t.classes}</td>
                                <td>{t.experience}</td>
                                <td><span className={`badge ${t.status}`}>{t.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
