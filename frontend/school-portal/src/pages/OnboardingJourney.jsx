import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const STEPS = [
    { id: 1, name: 'Global Boundaries', icon: '🌐' },
    { id: 2, name: 'Resource Mapping', icon: '⚔️' },
    { id: 3, name: 'Intelligence Pour', icon: '⚡' },
    { id: 4, name: 'Strategic Lock', icon: '🔐' }
];

export default function OnboardingJourney() {
    const [currentStep, setCurrentStep] = useState(1);
    const [config, setConfig] = useState({
        startDate: '2026-04-01',
        endDate: '2027-03-31',
        holidays: [
            { date: '2026-08-15', description: 'Independence Day' },
            { date: '2026-10-02', description: 'Gandhi Jayanti' },
            { date: '2026-12-25', description: 'Christmas' }
        ]
    });
    const [audit, setAudit] = useState(null);
    const [launchStats, setLaunchStats] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const navigate = useNavigate();

    const handleSaveConfig = async () => {
        setIsProcessing(true);
        setTimeout(() => {
            setCurrentStep(2);
            fetchResourceAudit();
            setIsProcessing(false);
        }, 1200);
    };

    const fetchResourceAudit = async () => {
        setAudit({
            alerts: [
                { teacher_name: 'Mr. Rajesh Gupta', weekly_periods: 38, limit: 32, risk_level: 'CRITICAL' },
                { teacher_name: 'Ms. Priya Sharma', weekly_periods: 34, limit: 32, risk_level: 'WARNING' }
            ]
        });
    };

    const handleLaunch = async () => {
        setIsProcessing(true);
        setTimeout(() => {
            setLaunchStats({
                schedules: 142,
                lessons: 4820,
                teachers: 32
            });
            setIsProcessing(false);
            setCurrentStep(4);
        }, 2500);
    };

    return (
        <div className="page-container" style={{ padding: '60px 20px', maxWidth: '1100px', margin: '0 auto' }}>
            <header style={{ textAlign: 'center', marginBottom: '60px' }}>
                <div style={{ fontSize: '10px', background: 'var(--accent)', color: 'white', display: 'inline-block', padding: '6px 16px', borderRadius: '20px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px', boxShadow: '0 0 15px var(--accent-glow)' }}>
                    Initialization Protocol v26.4
                </div>
                <h1 style={{ fontSize: '44px', fontWeight: 900, color: 'white', margin: '0 0 12px', letterSpacing: '-0.02em' }}>Academic Year <span style={{ color: 'var(--accent-bright)' }}>Horizon</span></h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>Establish legal boundaries, verify human resources, and deploy curriculum intelligence.</p>
            </header>

            {/* Premium Stepper */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '80px', position: 'relative', padding: '0 40px' }}>
                <div style={{ position: 'absolute', top: '30px', left: '60px', right: '60px', height: '1px', background: 'var(--border-crystal)', zIndex: 0 }}></div>
                {STEPS.map(s => (
                    <div key={s.id} style={{ zIndex: 1, textAlign: 'center', width: '22%' }}>
                        <div style={{ 
                            width: '60px', height: '60px', borderRadius: '18px', 
                            background: currentStep >= s.id ? 'var(--accent)' : 'var(--bg-card)', 
                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            margin: '0 auto 16px', fontSize: '24px', 
                            border: '1px solid ' + (currentStep >= s.id ? 'rgba(255,255,255,0.4)' : 'var(--border-crystal)'),
                            boxShadow: currentStep === s.id ? '0 0 30px var(--accent-glow)' : 'none',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            transform: currentStep === s.id ? 'scale(1.1) translateY(-5px)' : 'none',
                            backdropFilter: 'blur(10px)'
                        }}>
                            {s.icon}
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 900, color: currentStep >= s.id ? 'white' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{s.name}</span>
                    </div>
                ))}
            </div>

            {/* Step 1: Config */}
            {currentStep === 1 && (
                <div className="crystal-panel" style={{ padding: '48px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '300px', background: 'var(--accent-glow)', filter: 'blur(150px)', opacity: 0.1, zIndex: 0 }}></div>
                    
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <h2 style={{ marginBottom: '32px', fontSize: '24px', fontWeight: 800 }}>📂 01. Temporal Boundaries</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '40px' }}>
                            <div>
                                <label className="hud-title">Session Commencement</label>
                                <input type="date" value={config.startDate} className="form-group" style={{ background: 'rgba(255,255,255,0.03)' }} onChange={e => setConfig({...config, startDate: e.target.value})} />
                            </div>
                            <div>
                                <label className="hud-title">Syllabus Deadlock Boundary</label>
                                <input type="date" value={config.endDate} className="form-group" style={{ background: 'rgba(255,255,255,0.03)' }} onChange={e => setConfig({...config, endDate: e.target.value})} />
                            </div>
                        </div>

                        <div style={{ marginBottom: '40px' }}>
                            <label className="hud-title">Blackout Dates & Cultural Halts</label>
                            <div className="crystal-panel" style={{ maxHeight: '240px', overflowY: 'auto', padding: '12px', background: 'rgba(255,255,255,0.02)' }}>
                                {config.holidays.map((h, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', borderBottom: i < config.holidays.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                        <span style={{ fontWeight: 700, color: 'white' }}>{h.description}</span>
                                        <span style={{ fontWeight: 800, color: 'var(--accent-bright)', fontFamily: 'monospace' }}>{h.date}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button className="btn-primary" onClick={handleSaveConfig} disabled={isProcessing} style={{ width: '100%', padding: '20px', fontSize: '16px' }}>
                            {isProcessing ? 'CALCULATING CALENDAR VECTORS...' : 'CONFIRM BOUNDARIES & PROCEED →'}
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Resource Mapping */}
            {currentStep === 2 && (
                <div className="crystal-panel" style={{ padding: '48px' }}>
                    <h2 style={{ marginBottom: '32px', fontSize: '24px', fontWeight: 800 }}>👥 02. Human Resource Audit</h2>
                    
                    {audit?.alerts.length > 0 ? (
                        <div style={{ marginBottom: '40px' }}>
                            <div style={{ background: 'rgba(244, 63, 94, 0.05)', border: '1px solid rgba(244, 63, 94, 0.2)', padding: '24px', borderRadius: '16px', marginBottom: '32px' }}>
                                <h3 style={{ color: 'var(--crystal-rose)', margin: '0 0 8px', fontSize: '18px', fontWeight: 800 }}>⚠️ Threshold Violations Detected</h3>
                                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>CBSE pedagogical guidelines recommend max 32 periods. The system flagged critical burnout risks.</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {audit.alerts.map((a, i) => (
                                    <div key={i} className="crystal-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: '16px', color: 'white' }}>{a.teacher_name}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>{a.weekly_periods} periods/week <span style={{ color: 'var(--crystal-rose)' }}>(+{a.weekly_periods - a.limit} overflow)</span></div>
                                        </div>
                                        <span style={{ fontSize: '10px', background: a.risk_level === 'CRITICAL' ? 'var(--crystal-rose)' : 'var(--crystal-amber)', color: 'white', padding: '6px 14px', borderRadius: '20px', fontWeight: 900 }}>{a.risk_level}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '24px', marginBottom: '40px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🛡️</div>
                            <h3 style={{ color: 'var(--crystal-emerald)', margin: '0 0 12px', fontSize: '24px', fontWeight: 800 }}>Resource Integrity Verified</h3>
                            <p style={{ color: 'var(--text-muted)', margin: 0 }}>All faculty loads are within optimal pedagogical safety zones.</p>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px' }}>
                        <button className="btn-primary" onClick={() => setCurrentStep(3)} style={{ padding: '20px' }}>
                            CONFIRM RESOURCE MAPPING →
                        </button>
                        <button style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', width: '64px', borderRadius: '16px', cursor: 'pointer', fontSize: '20px' }} onClick={() => setCurrentStep(1)}>←</button>
                    </div>
                </div>
            )}

            {/* Step 3: Intelligence Pour */}
            {currentStep === 3 && (
                <div className="crystal-panel" style={{ padding: '80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '120%', height: '120%', background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)', opacity: 0.15, zIndex: 0 }}></div>
                    
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ fontSize: '80px', marginBottom: '32px', filter: 'drop-shadow(0 0 20px var(--accent))' }}>✨</div>
                        <h2 style={{ marginBottom: '16px', fontSize: '32px', fontWeight: 900 }}>Commence Intelligence Pour?</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '48px', maxWidth: '580px', margin: '0 auto 48px', fontSize: '18px', lineHeight: 1.6 }}>
                            The <span style={{ color: 'white', fontWeight: 700 }}>Chronos Engine</span> will now synthesize the syllabus into a dynamic teaching calendar, optimizing for sequential complexity and pedagogical flow.
                        </p>
                        
                        <button 
                            className="btn-primary" 
                            onClick={handleLaunch} 
                            disabled={isProcessing} 
                            style={{ 
                                padding: '24px 60px', fontSize: '20px', width: 'auto', 
                                background: 'linear-gradient(135deg, var(--accent) 0%, #a855f7 100%)',
                                boxShadow: '0 15px 40px var(--accent-glow)'
                            }}
                        >
                            {isProcessing ? 'SYNTHESIZING ACADEMIC BASELINE...' : '🚀 DEPLOY CHRONOS ENGINE'}
                        </button>
                        
                        <div style={{ marginTop: '32px' }}>
                            <button onClick={() => setCurrentStep(2)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', cursor: 'pointer' }}>← Review Resource Cluster</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 4: Final Review */}
            {currentStep === 4 && (
                <div className="crystal-panel" style={{ padding: '48px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                        <div>
                            <h2 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 800 }}>📑 04. Strategic Lockdown</h2>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>Review synthesized calendar and lock the session baseline.</p>
                        </div>
                        <button onClick={() => navigate('/war-room')} className="btn-primary" style={{ padding: '16px 32px', width: 'auto', background: 'var(--crystal-emerald)', boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)' }}>
                            LOCK & BROADCAST →
                        </button>
                    </div>

                    <div className="crystal-panel" style={{ background: 'rgba(251, 191, 36, 0.05)', border: '1px solid rgba(251, 191, 36, 0.2)', padding: '24px', borderRadius: '16px', marginBottom: '40px' }}>
                        <div className="hud-title" style={{ color: 'var(--crystal-amber)', marginBottom: '8px' }}>🔍 Heuristic Gap Analysis</div>
                        <p style={{ color: 'white', fontSize: '15px', margin: '0 0 16px', lineHeight: 1.5 }}>
                            Grade 10 Physics section C projected to end on March 14th. Buffer: <span style={{ color: 'var(--crystal-rose)', fontWeight: 800 }}>48 Hours</span>. This violates the 7-day revision safety protocol.
                        </p>
                        <button style={{ background: 'var(--crystal-amber)', color: 'black', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer' }}>
                            ⚡ 1-Click Optimization Sweep
                        </button>
                    </div>

                    {/* Timeline Placeholder */}
                    <div className="crystal-panel" style={{ height: '360px', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(255,255,255,0.1)' }}>
                        <div style={{ fontSize: '32px', marginBottom: '16px', opacity: 0.5 }}>📊</div>
                        <div style={{ color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '4px', fontSize: '14px' }}>Horizon Timeline Initialized</div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                            <div style={{ width: '40px', height: '100px', background: 'var(--accent)', opacity: 0.2, borderRadius: '4px' }}></div>
                            <div style={{ width: '40px', height: '120px', background: 'var(--accent)', opacity: 0.4, borderRadius: '4px' }}></div>
                            <div style={{ width: '40px', height: '80px', background: 'var(--accent)', opacity: 0.3, borderRadius: '4px' }}></div>
                            <div style={{ width: '40px', height: '140px', background: 'var(--accent)', opacity: 0.5, borderRadius: '4px' }}></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
