import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function Login() {
    const [email, setEmail] = useState('admin@test.com');
    const [password, setPassword] = useState('123456');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await api.login(email, password);
            localStorage.setItem('lumiq_token', data.access_token);
            localStorage.setItem('lumiq_user', JSON.stringify(data.user || { email }));
            navigate('/');
        } catch (err) {
            setError(err.message || 'Login failed. Check credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <div style={{
                        width: 40, height: 40,
                        background: 'linear-gradient(135deg, var(--accent), var(--purple))',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: 18, color: 'white'
                    }}>L</div>
                    <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>LumiqOS</span>
                </div>
                <h2>Welcome back</h2>
                <p className="subtitle">Sign in to your admin dashboard</p>
                {error && <div className="login-error">{error}</div>}
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Email address</label>
                        <input
                            type="email" value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@school.com" required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password" value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••" required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
                        {loading ? '⏳ Signing in...' : 'Sign In'}
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
                    School Intelligence Operating System
                </p>
            </div>
        </div>
    );
}
