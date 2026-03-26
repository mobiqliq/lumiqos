import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLES, api } from '../api/client';

export default function Login() {
    const [selectedRole, setSelectedRole] = useState('principal');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const role = ROLES[selectedRole];

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.login(role.email, '123456');
        } catch { /* demo bypass */ }
        localStorage.setItem('school_token', 'demo-token');
        localStorage.setItem('school_role', selectedRole);
        localStorage.setItem('school_user', JSON.stringify({ email: role.email, role: selectedRole, name: role.label }));
        setLoading(false);
        navigate('/');
    };

    return (
        <div className="login-page">
            <div className="login-card" style={{ width: 480 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, var(--success), var(--cyan))', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, color: 'white' }}>G</div>
                    <span style={{ fontSize: 20, fontWeight: 700 }}>Greenfield Academy</span>
                </div>
                <h2>School Portal</h2>
                <p className="subtitle">Select your role to sign in</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
                    {Object.values(ROLES).map(r => (
                        <button
                            key={r.key}
                            type="button"
                            onClick={() => setSelectedRole(r.key)}
                            style={{
                                padding: '14px 8px', background: selectedRole === r.key ? `${r.color}22` : 'var(--bg-primary)',
                                border: `2px solid ${selectedRole === r.key ? r.color : 'var(--border)'}`,
                                borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'var(--transition)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                                color: selectedRole === r.key ? r.color : 'var(--text-secondary)',
                            }}
                        >
                            <span style={{ fontSize: 24 }}>{r.icon}</span>
                            <span style={{ fontSize: 12, fontWeight: 600 }}>{r.label}</span>
                        </button>
                    ))}
                </div>

                <div style={{ padding: 16, background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', marginBottom: 20, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Signing in as</div>
                    <div style={{ fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>{role.icon}</span> {role.label}
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>({role.email})</span>
                    </div>
                </div>

                <button onClick={handleLogin} className="btn btn-primary login-btn" disabled={loading}
                    style={{ background: `linear-gradient(135deg, ${role.color}, ${role.color}cc)` }}>
                    {loading ? '⏳ Signing in...' : `Sign In as ${role.label}`}
                </button>
                <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--text-muted)' }}>Powered by LumiqOS — School Intelligence OS</p>
            </div>
        </div>
    );
}
