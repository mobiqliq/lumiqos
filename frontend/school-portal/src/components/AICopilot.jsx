import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export default function AICopilot({ role = 'principal' }) {
    const { t } = useTranslation();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const endRef = useRef(null);

    // Premium Glow Signals
    const signals = [
        { time: '09:22:11', event: 'BIO_GATE', msg: 'Core Auth Node: Stable' },
        { time: '09:25:44', event: 'PRED_ENG', msg: 'Revenue Velocity: +0.12v' },
        { time: '09:28:02', event: 'AI_CORE', msg: 'Predictive Baseline Hydrated' }
    ];

    useEffect(() => { 
        endRef.current?.scrollIntoView({ behavior: 'smooth' }); 
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages(prev => [...prev, { role: 'user', text: input.trim() }]);
        setInput('');
        
        setTimeout(() => {
            setMessages(prev => [...prev, { 
                role: 'ai', 
                text: "Institutional intelligence suggests a 4% optimization in 'Staff Allocation' for the upcoming term. Would you like to view the projected ROI?"
            }]);
        }, 1000);
    };

    return (
        <div style={{ 
            display: 'flex', flexDirection: 'column', height: '100%', 
            background: 'transparent', color: '#fff' 
        }}>
            {/* Header */}
            <div style={{ padding: '32px 24px 24px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ 
                    fontSize: '10px', fontWeight: '800', color: '#fbbf24', 
                    letterSpacing: '0.12em', marginBottom: '8px' 
                }}>
                    LUMIQ INTELLIGENCE
                </div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>AI Neural Core</h3>
            </div>

            {/* Live Data Signals (Neon Amber) */}
            <div style={{ padding: '20px 24px', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ fontSize: '9px', fontWeight: '800', color: 'rgba(255,255,255,0.3)', marginBottom: '16px' }}>
                    LIVE_SIGNALS
                </div>
                <div className="flex-column" style={{ gap: '10px' }}>
                    {signals.map((s, i) => (
                        <div key={i} className="mono" style={{ fontSize: '10px', display: 'flex', gap: '12px' }}>
                            <span style={{ color: '#fbbf24', opacity: 0.8 }}>{s.time}</span>
                            <span style={{ color: '#94a3b8' }}>[{s.event}]</span>
                            <span style={{ color: '#f8fafc', opacity: 0.6 }}>{s.msg}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Insight Stream */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ fontSize: '9px', fontWeight: '800', color: 'rgba(255,255,255,0.3)' }}>
                    ACTIVE_INSIGHTS
                </div>
                
                {messages.length === 0 && (
                    <div className="ai-signal">
                        <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '8px', color: '#fbbf24' }}>
                            Operational Anomaly
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                            Fee collection pipeline for Grade 12 is trailing the 24-month baseline by 8.2%. Proactive reminder sequence recommended.
                        </p>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div key={i} style={{ 
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '90%', padding: '14px 18px', borderRadius: '16px',
                        background: msg.role === 'user' ? 'var(--persona-accent)' : 'var(--surface)',
                        border: '1px solid var(--border)',
                        boxShadow: msg.role === 'user' ? '0 10px 20px rgba(59, 130, 246, 0.2)' : 'none',
                        fontSize: '13px', lineHeight: '1.5'
                    }}>
                        {msg.text}
                    </div>
                ))}
                <div ref={endRef} />
            </div>

            {/* Command Input */}
            <div style={{ padding: '24px', borderTop: '1px solid var(--border)' }}>
                <div style={{ position: 'relative' }}>
                    <input 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder="Interrogate Neural Core..."
                        style={{ 
                            width: '100%', padding: '14px 18px', borderRadius: '14px',
                            background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border)',
                            color: '#FFF', fontSize: '13px', outline: 'none',
                            backdropFilter: 'blur(10px)'
                        }}
                    />
                    <button 
                        onClick={handleSend}
                        style={{ 
                            position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                            background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, fontSize: '18px'
                        }}
                    >
                        ✦
                    </button>
                </div>
            </div>
        </div>
    );
}
