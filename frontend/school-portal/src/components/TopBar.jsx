import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function TopBar() {
    const { t, i18n } = useTranslation();
    const [time, setTime] = useState(new Date().toLocaleTimeString());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <header style={{ 
            height: 'var(--topbar-h)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '0 40px',
            background: 'transparent',
            zIndex: 50,
            borderBottom: '1px solid var(--border)'
        }}>
            {/* Left: Institutional Context */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#fff', letterSpacing: '0.05em' }}>
                        GREENFIELD ACADEMY
                    </div>
                    <div className="mono" style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        AY_2026_27 // BASELINE_STABLE
                    </div>
                </div>
            </div>

            {/* Center: Command Search */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 40px' }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: '480px' }}>
                    <input 
                        style={{ 
                            width: '100%', padding: '10px 18px', borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border)',
                            color: '#fff', fontSize: '13px', outline: 'none',
                            backdropFilter: 'blur(10px)'
                        }}
                        placeholder="Search Intelligence... ⌘K"
                    />
                    <div className="mono" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3, fontSize: '10px' }}>
                        CMD_K
                    </div>
                </div>
            </div>

            {/* Right: Connectivity & Active Signals */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px', 
                    padding: '6px 14px', background: 'rgba(16, 185, 129, 0.05)', 
                    borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.1)' 
                }}>
                    <div style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 12px #10b981' }} />
                    <span style={{ fontSize: '10px', color: '#10b981', fontWeight: '800', letterSpacing: '0.05em' }}>LIVE</span>
                    <div style={{ width: '1px', height: '10px', background: 'rgba(16, 185, 129, 0.2)' }} />
                    <span className="mono" style={{ fontSize: '10px', color: '#10b981' }}>0.96v</span>
                </div>

                <div style={{ display: 'flex', gap: '4px' }}>
                    <button style={{ padding: '6px 10px', fontSize: '10px', fontWeight: '800', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: '#fff', borderRadius: '6px' }}>EN</button>
                </div>

                <div style={{ 
                    width: '36px', height: '36px', borderRadius: '10px', 
                    background: 'var(--grad-blue)', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', 
                    fontWeight: '800', fontSize: '14px', color: '#fff',
                    boxShadow: '0 0 15px rgba(59, 130, 246, 0.2)' 
                }}>
                    P
                </div>
            </div>
        </header>
    );
}
