import { demoData } from '../api/client';

export default function Classes() {
    return (
        <div className="page-content">
            <div className="page-header">
                <div><h2>Classes & Sections</h2><p>{demoData.classes.length} classes configured</p></div>
                <button className="btn btn-primary">➕ Add Class</button>
            </div>
            <div className="class-grid">
                {demoData.classes.map((c, i) => (
                    <div key={i} className="card class-card">
                        <h4>{c.name}</h4>
                        <div className="class-meta">
                            <div className="meta-item">Sections: <span>{c.sections.join(', ')}</span></div>
                            <div className="meta-item">Students: <span>{c.students}</span></div>
                        </div>
                        <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>
                            Class Teacher: <span style={{ color: 'var(--text-primary)' }}>{c.classTeacher}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
