import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  const handleDevLogin = () => {
    const mockUser = {
      id: 'platform-admin',
      email: 'admin@xceliqos.dev',
      role: 'platform_admin',
      name: 'Platform Admin',
    };
    localStorage.setItem('xceliq_token', 'dev-mock-token');
    localStorage.setItem('xceliq_user', JSON.stringify(mockUser));
    navigate('/');
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--surface)',
      fontFamily: 'var(--font-sans)',
    }}>
      <div style={{
        background: 'var(--surface-2)',
        padding: '32px',
        borderRadius: 'var(--r-lg)',
        border: '0.5px solid var(--border)',
        maxWidth: '400px',
        width: '100%',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{
            width: 40, height: 40,
            background: 'var(--gold)',
            borderRadius: 'var(--r-sm)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 18, color: 'var(--ink)'
          }}>L</div>
          <span style={{ fontSize: 22, fontWeight: 500, fontFamily: 'var(--font-serif)', color: 'var(--ink)' }}>
            XceliQOS Admin
          </span>
        </div>
        <h2 style={{ marginBottom: 8, fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 400 }}>
          Platform Management
        </h2>
        <p style={{ marginBottom: 24, color: 'var(--ink-60)', fontSize: 14 }}>
          Manage schools, billing, and platform settings.
        </p>
        <button
          onClick={handleDevLogin}
          style={{
            background: 'var(--gold)',
            border: 'none',
            borderRadius: 'var(--r-pill)',
            padding: '12px 24px',
            fontSize: 15,
            fontWeight: 500,
            color: 'var(--ink)',
            cursor: 'pointer',
            width: '100%',
            transition: 'all var(--t-instant) var(--ease-static)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          Enter Admin Dashboard (Dev)
        </button>
        <p style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: 'var(--ink-30)' }}>
          XceliQOS — Illuminate Every Learner
        </p>
      </div>
    </div>
  );
}
