import { useState } from 'react';

const PERSONAS = [
  { id: 'principal', label: 'Principal', accent: '#2B5BA8' },
  { id: 'admin', label: 'Administrator', accent: '#1A3A6B' },
  { id: 'teacher', label: 'Teacher', accent: '#0E7A6E' },
  { id: 'finance', label: 'Finance', accent: '#B86B1A' },
  { id: 'hr', label: 'HR', accent: '#4A3080' },
  { id: 'parent', label: 'Parent', accent: '#2E6B2E' },
  { id: 'student', label: 'Student', accent: '#9B3A5C' },
];

export default function Login() {
  const [showDevMenu, setShowDevMenu] = useState(false);

  const handleDevLogin = (persona) => {
    localStorage.setItem('school_token', 'dev-mock-token');
    localStorage.setItem('school_role', persona.id);
    localStorage.setItem('school_user', JSON.stringify({
      id: `dev-${persona.id}`,
      email: `${persona.id}@lumiqos.dev`,
      role: persona.id,
      name: persona.label,
      school_id: '11111111-1111-1111-1111-111111111111',
    }));
    window.location.href = '/';
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: 'var(--surface)', fontFamily: 'var(--font-sans)'
    }}>
      <div style={{
        background: 'var(--surface-2)', padding: '32px', borderRadius: 'var(--r-lg)',
        border: '0.5px solid var(--border)', maxWidth: '400px', width: '100%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{
            width: 40, height: 40, background: 'var(--gold)',
            borderRadius: 'var(--r-sm)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 18, color: 'var(--ink)'
          }}>L</div>
          <span style={{ fontSize: 22, fontWeight: 500, fontFamily: 'var(--font-serif)', color: 'var(--ink)' }}>
            LumiqOS Portal
          </span>
        </div>
        <h2 style={{ marginBottom: 8, fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 400 }}>
          Developer Login
        </h2>
        <p style={{ marginBottom: 24, color: 'var(--ink-60)', fontSize: 14 }}>
          Select a persona to preview the school portal.
        </p>
        <button
          onClick={() => setShowDevMenu(!showDevMenu)}
          style={{
            background: 'var(--gold)', border: 'none', borderRadius: 'var(--r-pill)',
            padding: '12px 24px', fontSize: 15, fontWeight: 500, color: 'var(--ink)',
            cursor: 'pointer', width: '100%', marginBottom: 16
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
                style={{
                  background: 'white', border: '0.5px solid var(--border)',
                  borderRadius: 'var(--r-sm)', padding: '10px 16px', fontSize: 14,
                  fontWeight: 500, color: 'var(--ink)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center'
                }}
              >
                <span style={{
                  width: 10, height: 10, background: p.accent,
                  borderRadius: '50%', marginRight: 12
                }} />
                {p.label}
              </button>
            ))}
          </div>
        )}
        <p style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: 'var(--ink-30)' }}>
          School Intelligence Operating System
        </p>
      </div>
    </div>
  );
}
