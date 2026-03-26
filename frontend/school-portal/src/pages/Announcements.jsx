import { useState } from 'react';
import { demoData } from '../api/client';

export default function Announcements() {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [priority, setPriority] = useState('info');
    const [announcements, setAnnouncements] = useState(demoData.announcements);

    const handlePost = (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        setAnnouncements([
            { id: Date.now(), title, body, time: 'Just now', priority },
            ...announcements,
        ]);
        setTitle(''); setBody('');
    };

    return (
        <div className="page-content">
            <div className="page-header">
                <div><h2>Announcements</h2><p>School-wide notices and updates</p></div>
            </div>

            <div className="card" style={{ padding: 24, marginBottom: 24 }}>
                <h3 style={{ marginBottom: 16 }}>📝 Post New Announcement</h3>
                <form onSubmit={handlePost}>
                    <div className="form-group">
                        <label>Title</label>
                        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Announcement title" required />
                    </div>
                    <div className="form-group">
                        <label>Message</label>
                        <input value={body} onChange={e => setBody(e.target.value)} placeholder="What would you like to announce?" />
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'end' }}>
                        <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                            <label>Priority</label>
                            <select className="filter-select" value={priority} onChange={e => setPriority(e.target.value)} style={{ width: '100%', padding: '12px 16px' }}>
                                <option value="info">ℹ️ Info</option>
                                <option value="important">⚠️ Important</option>
                                <option value="urgent">🚨 Urgent</option>
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ height: 46 }}>📢 Post</button>
                    </div>
                </form>
            </div>

            <div className="card announcements">
                <h3>All Announcements</h3>
                {announcements.map(a => (
                    <div key={a.id} className="announcement-item">
                        <div className="ann-title"><span className={`badge ${a.priority}`}>{a.priority}</span> {a.title}</div>
                        <div className="ann-body">{a.body}</div>
                        <div className="ann-time">{a.time}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
