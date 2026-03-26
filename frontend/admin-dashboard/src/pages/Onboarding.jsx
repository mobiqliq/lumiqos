import { useState } from 'react';
import { api } from '../api/client';

export default function Onboarding() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [plan, setPlan] = useState('Starter');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setResult(null);
        setLoading(true);
        try {
            const data = await api.onboardTenant({ name, admin_email: email, plan });
            setResult(data);
        } catch (err) {
            setError(err.message || 'Onboarding failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-content">
            <div className="page-header">
                <div>
                    <h2>🚀 Tenant Onboarding</h2>
                    <p>Provision a new school tenant with one click</p>
                </div>
            </div>

            <div className="card form-card">
                <h3>School Details</h3>
                {error && <div className="login-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>School Name</label>
                        <input
                            type="text" value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Greenfield Academy" required
                        />
                    </div>
                    <div className="form-group">
                        <label>Admin Email</label>
                        <input
                            type="email" value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@school.com" required
                        />
                    </div>
                    <div className="form-group">
                        <label>Plan</label>
                        <select
                            value={plan} onChange={(e) => setPlan(e.target.value)}
                            style={{
                                width: '100%', padding: '12px 16px',
                                background: 'var(--bg-primary)', border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                                fontSize: 14, fontFamily: 'inherit', outline: 'none'
                            }}
                        >
                            <option value="Starter">Starter — 500 students</option>
                            <option value="Growth">Growth — 2,000 students</option>
                            <option value="Enterprise">Enterprise — Unlimited</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                        {loading ? '⏳ Provisioning...' : '🚀 Onboard School'}
                    </button>
                </form>

                {result && (
                    <div className="form-result">
                        <h4>✅ Tenant Provisioned Successfully!</h4>
                        <pre>{JSON.stringify(result, null, 2)}</pre>
                    </div>
                )}
            </div>
        </div>
    );
}
