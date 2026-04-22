import { useState } from 'react';
const PERSONAS = [
  { id: 'principal',     label: 'Principal',     email: 'principal@testschool.edu' },
  { id: 'administrator', label: 'Administrator',  email: 'admin@testschool.edu' },
  { id: 'teacher',       label: 'Teacher',        email: 'teacher1@testschool.edu' },
  { id: 'finance',       label: 'Finance',        email: 'finance@testschool.edu' },
  { id: 'hr',            label: 'HR',             email: 'hr@testschool.edu' },
  { id: 'parent',        label: 'Parent',         email: 'parent@testschool.edu' },
  { id: 'student',       label: 'Student',        email: 'student@testschool.edu' },
];

export default function Login() {
  const [showDevMenu, setShowDevMenu] = useState(false);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const handleDevLogin = async (persona) => {
    setLoading(persona.id);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: persona.email, password: 'password' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      localStorage.setItem('school_token', data.access_token);
      localStorage.setItem('school_role', persona.id);
      localStorage.setItem('school_user', JSON.stringify({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: persona.id,
        school_id: data.user.school_id,
      }));
      localStorage.setItem('school_id', data.user.school_id);
      window.location.href = '/';
    } catch (e) {
      setError(e.message || 'Login failed');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: 'var(--bg-base)', fontFamily: 'var(--font-sans)'
    }}>
      <div style={{
        background: 'var(--bg-surface)', padding: '40px 36px',
        borderRadius: 'var(--r-lg)', border: '1px solid var(--border)',
        maxWidth: '400px', width: '100%',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{
            width: 36, height: 36, background: 'var(--accent)',
            borderRadius: 'var(--r-sm)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 16, color: '#fff'
          }}>L</div>
          <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            LumiqOS Portal
          </span>
        </div>

        <h2 style={{ marginBottom: 6, fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Sign in
        </h2>
        <p style={{ marginBottom: 28, color: 'var(--text-muted)', fontSize: 13 }}>
          Select a role to sign in with test credentials.
        </p>

        {error && (
          <div style={{
            background: 'var(--danger-muted)', color: 'var(--danger)',
            border: '1px solid var(--danger)', borderRadius: 'var(--r-md)',
            padding: '10px 14px', fontSize: 13, marginBottom: 16
          }}>{error}</div>
        )}

        <button
          onClick={() => setShowDevMenu(!showDevMenu)}
          style={{
            background: 'var(--accent)', border: 'none', borderRadius: 'var(--r-md)',
            padding: '11px 20px', fontSize: 14, fontWeight: 500, color: '#fff',
            cursor: 'pointer', width: '100%', marginBottom: 16,
            transition: 'background 0.15s'
          }}
        >
          {showDevMenu ? 'Hide' : 'Show'} Dev Personas
        </button>

        {showDevMenu && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PERSONAS.map((p) => (
              <button
                key={p.id}
                onClick={() => handleDevLogin(p)}
                disabled={loading === p.id}
                style={{
                  background: 'var(--bg-raised)', border: '1px solid var(--border)',
                  borderRadius: 'var(--r-md)', padding: '10px 16px', fontSize: 13,
                  fontWeight: 500, color: loading === p.id ? 'var(--text-muted)' : 'var(--text-primary)',
                  cursor: loading === p.id ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'border-color 0.15s'
                }}
              >
                <span>{p.label}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {loading === p.id ? 'signing in…' : p.email}
                </span>
              </button>
            ))}
          </div>
        )}

        <p style={{ marginTop: 28, textAlign: 'center', fontSize: 11, color: 'var(--text-muted)' }}>
          School Intelligence Operating System
        </p>
      </div>
    </div>
  );
}
