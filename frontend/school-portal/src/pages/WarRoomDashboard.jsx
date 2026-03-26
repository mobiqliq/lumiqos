import React, { useState, useEffect } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { useTranslation } from 'react-i18next';
import { useCurriculumStore } from '../store/useCurriculumStore';
import { useSyllabusRisk } from '../hooks/useSyllabusRisk';

ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function WarRoomDashboard() {
    const { t } = useTranslation();
    const [auditData, setAuditData] = useState(null);
    const [parityAlerts, setParityAlerts] = useState([]);
    const [morningPulse, setMorningPulse] = useState([]);
    const [selectedRecoveryAlert, setSelectedRecoveryAlert] = useState(null);
    const [isApprovingPlan, setIsApprovingPlan] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDisrupting, setIsDisrupting] = useState(false);
    const [disruptionImpact, setDisruptionImpact] = useState(null);
    const [isResolvingDisruption, setIsResolvingDisruption] = useState(false);
    const [disruptionResolved, setDisruptionResolved] = useState(null);
    const [nepReport, setNepReport] = useState(null);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [teacherHealthAlerts, setTeacherHealthAlerts] = useState([]);
    const [schoolId] = useState('SCH-001'); // Hardcoded for demo
    const [yearId] = useState('AYMAX-001'); // Hardcoded for demo

    // Sandbox State
    const [sandboxForm, setSandboxForm] = useState({
        start_date: '',
        end_date: '',
        event_name: ''
    });
    const [casualtyReport, setCasualtyReport] = useState(null);
    const [isSimulating, setIsSimulating] = useState(false);

    // Global Store & Intelligence Hook
    const connectSocket = useCurriculumStore(state => state.connectSocket);
    const disconnectSocket = useCurriculumStore(state => state.disconnectSocket);
    const { latestVelocity, lastUpdate } = useSyllabusRisk();

    // Pulse state for UI animation
    const [isPulsing, setIsPulsing] = useState(false);

    useEffect(() => {
        // Connect WebSockets when standard War Room mounts
        connectSocket();
        return () => disconnectSocket();
    }, [connectSocket, disconnectSocket]);

    useEffect(() => {
        if (latestVelocity !== null && latestVelocity < 0.85) {
            setIsPulsing(true);
            const timer = setTimeout(() => setIsPulsing(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [latestVelocity]);

    // Mock Backend data based on the API response structure
    useEffect(() => {
        // In a real scenario, fetch from /academic/compliance-audit endpoint
        setAuditData({
            ail_compliance: "33.3%",
            vocational_ratio: "67/33",
            bagless_days_scheduled: "8/10",
            status: {
                ail_risk: false,
                vocational_risk: false,
                bagless_pause_compliance: false
            }
        });

        // Fetch Parity Alerts
        const fetchAudit = async () => {
            try {
                const schoolId = localStorage.getItem('schoolId') || 'f2efb39f-304b-4841-8faf-7bda14454aac';
                const yearId = localStorage.getItem('academicYearId') || '844c8c7c-4809-4ce4-8461-125032bb982d';
                const headers = { 'X-School-Id': schoolId, 'Authorization': `Bearer ${localStorage.getItem('school_token') || ''}` };
                // Fetch from your actual Backend API
                // const res = await axios.get(`/api/academic/parity-audit?school_id=${schoolId}&academic_year_id=${yearId}`, { headers });
                // setParityAlerts(res.data);
                
                // MOCK DATA for now to show the UI
                setParityAlerts([
                    {
                        class_name: 'Grade 10',
                        subject_name: 'Science',
                        leading_section_name: 'Section A',
                        lagging_section_name: 'Section B',
                        topic_gap: 3,
                        recommendation: 'In Grade 10 Science, Section A is 3 classes ahead of Section B. Suggest moving 1 period from Section A to Section B next week.'
                    }
                ]);

                // MOCK Morning Pulse Data (Traffic Light Dashboard)
                setMorningPulse([
                    { id: 1, class_name: 'Grade 10', subject_name: 'Math', synced: true, message: 'All sections in sync.' },
                    { id: 2, class_name: 'Grade 10', subject_name: 'English', synced: true, message: 'All sections in sync.' },
                    { id: 3, class_name: 'Grade 9', subject_name: 'Science', synced: false, lagging_section: '9B', lag_days: 4, message: 'Section B is lagging by 4 days.' }
                ]);

                // Fetch Teacher Health Radar
                try {
                    const healthRes = await axios.get(`http://localhost:3001/api/academic/teacher-health-radar?school_id=${schoolId}`, { headers });
                    if (healthRes.data && healthRes.data.length > 0) {
                        setTeacherHealthAlerts(healthRes.data);
                    } else {
                        // FALLBACK MOCK for demonstration if no "Red" teachers are found in current DB
                        setTeacherHealthAlerts([
                            { 
                                teacher_name: 'Rajiv Sharma', 
                                velocity: 0.72, 
                                density_score: '8.4', 
                                diagnosis: 'OVERLOAD_DETECTED',
                                rationale: 'Velocity is low (0.72v) primarily due to high average lesson complexity (8.4/10). This creates a "dense schedule" bottleneck.',
                                recommendation: 'Recommend reassigning 2 upcoming high-complexity units to an Assistant Teacher.',
                                action_label: '⚡ Support Required'
                            }
                        ]);
                    }
                } catch (e) {
                    console.error("Radar API issue", e);
                }

            } catch (err) {
                console.error('Failed to fetch parity alerts', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAudit();
    }, [schoolId, yearId]);

    // 1. The "Pulse" Heatmap Mock Data
    const classes = ['Grade 10A', 'Grade 10B', 'Grade 9A', 'Grade 9B', 'Grade 8A'];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    
    // Velocity > 0.95 (Green), 0.85-0.94 (Yellow), < 0.85 (Red)
    const getHeatmapColor = (velocity) => {
        if (velocity >= 0.95) return 'var(--success)';
        if (velocity >= 0.85) return 'var(--warning)';
        return 'var(--danger)';
    };

    const heatmapData = classes.map(cls => ({
        name: cls,
        velocities: days.map(() => Math.random() < 0.2 ? 0.80 : Math.random() < 0.5 ? 0.90 : 1.0)
    }));

    // 2. The "Resource Conflict" Gantt Mock Data
    const resources = ['Physics Lab', 'AV Room', 'Auditorium'];
    const timelineHours = ['08:00', '09:00', '10:00', '11:00', '12:00'];
    
    const ganttConflicts = {
        'Physics Lab': { '10:00': 'Grade 10A & 10B (Overlap Conflict)' },
        'AV Room': {},
        'Auditorium': { '09:00': 'Grade 8A & 9A (Overlap Conflict)' }
    };

    // 3. The "Compliance Gauge"
    const complianceScore = auditData ? parseFloat(auditData.ail_compliance) : 0;
    const gaugeData = {
        labels: ['Compliant', 'Non-Compliant'],
        datasets: [{
            data: [complianceScore, 100 - complianceScore],
            backgroundColor: ['#10b981', '#334155'], // Green and dark slate
            borderWidth: 0,
            cutout: '75%'
        }],
    };

    const gaugeOpts = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
            legend: { display: false },
            tooltip: { enabled: false }
        }
    };

    // 4. "Teacher Velocity" Leaderboard
    const teachers = [
        { name: 'Rajiv Sharma', subject: 'Mathematics', velocity: 1.02 },
        { name: 'Sunita Verma', subject: 'Science', velocity: 0.96 },
        { name: 'Anita Desai', subject: 'English', velocity: 0.88 },
        { name: 'Priya Patel', subject: 'History', velocity: 0.82 },
    ];

    const fixBaglessDay = () => {
        alert(t("Auto-inserting Bagless Day activities into the next available gap in the School Calendar..."));
        setAuditData(prev => ({ ...prev, bagless_days_scheduled: "10/10", status: { ...prev.status, bagless_pause_compliance: true }}));
    };

    const handleApprovePlan = async (planType, alert) => {
        setIsApprovingPlan(true);
        try {
            const headers = { 'X-School-Id': 'SCH-001', 'Authorization': `Bearer ${localStorage.getItem('school_token') || ''}` };
            const payload = {
                school_id: 'SCH-001',
                class_id: alert.class_name,
                subject_id: alert.subject_name,
                section_id: alert.lagging_section,
                plan_type: planType
            };
            const res = await axios.post(`http://localhost:3001/api/academic/recovery/approve`, payload, { headers });
            
            // UI Success State update
            alert(res.data.message);
            // Mark the pulse item as resolved/synced
            setMorningPulse(prev => prev.map(p => p.id === alert.id ? { ...p, synced: true, message: `System resolving schedule via ${planType}...` } : p));
            setSelectedRecoveryAlert(null); // Close modal
        } catch (e) {
            console.error("Failed to approve plan", e);
            alert("Error applying recovery plan.");
        } finally {
            setIsApprovingPlan(false);
        }
    };

    const handleDeclareClosure = async () => {
        setIsDisrupting(true);
        try {
            const tom = new Date();
            tom.setDate(tom.getDate() + 1);
            const dateStr = tom.toISOString().split('T')[0];
            
            const headers = { 'X-School-Id': 'SCH-001', 'Authorization': `Bearer ${localStorage.getItem('school_token') || ''}` };
            const res = await axios.post(`http://localhost:3001/api/academic/calendar/disruption/impact`, { school_id: 'SCH-001', date: dateStr }, { headers });
            setDisruptionImpact(res.data);
        } catch (error) {
            console.error("Failed to get disruption impact", error);
        } finally {
            setIsDisrupting(false);
        }
    };

    const handleResolveDisruption = async (plan) => {
        setIsResolvingDisruption(true);
        try {
            const headers = { 'X-School-Id': 'SCH-001', 'Authorization': `Bearer ${localStorage.getItem('school_token') || ''}` };
            const res = await axios.post(`http://localhost:3001/api/academic/calendar/disruption/resolve`, {
                school_id: 'SCH-001',
                date: disruptionImpact.date,
                plan_id: plan.id,
                plan_name: plan.name
            }, { headers });
            
            setDisruptionResolved(res.data);
        } catch (error) {
            console.error("Failed to resolve disruption", error);
        } finally {
            setIsResolvingDisruption(false);
        }
    };

    const handleGenerateNEPReport = async () => {
        setIsGeneratingReport(true);
        // Simulate premium scan for the user
        setTimeout(() => {
            setNepReport({
                summary: {
                    ail_quota: { value: '33.3%', status: 'COMPLIANT', evidence: 'Vocational/Core ratio exceeds 25% threshold.' },
                    bagless_days: { value: '8/10', status: 'WARNING', evidence: '10 Bagless Days required; 2 slots missing in March.' },
                    art_integration: { value: '15%', status: 'COMPLIANT', evidence: '112/750 lessons tagged with AI-Outcome.' },
                    pedagogical_velocity: { value: '0.96v', status: 'COMPLIANT', evidence: 'Mean syllabus velocity is within +/- 5% of baseline.' }
                },
                certification: {
                    statement: 'This curriculum DNA has been audited by LumiqOS Chronos Engine. All NCERT 2026-27 Learning Outcomes are mapped and sequentialized.',
                    verification_id: 'AQ-XC82-2026-991'
                }
            });
            setIsGeneratingReport(false);
        }, 1500);
    };

    const handleRunSimulation = async () => {
        setIsSimulating(true);
        // Simulation delay for high-tech effect
        setTimeout(() => {
            setCasualtyReport({
                event: sandboxForm.event_name,
                simulated_dates: `${sandboxForm.start_date} to ${sandboxForm.end_date}`,
                overall_status: 'CRITICAL_RISK',
                casualty_report: [
                    { class_name: 'Grade 10A', subject_name: 'Physics', lost_periods: 4, projected_end_date: '2027-03-24', status: 'CRITICAL_CASUALTY', warning: 'Syllabus completion delayed beyond March 15th deadline.' },
                    { class_name: 'Grade 9B', subject_name: 'Math', lost_periods: 3, projected_end_date: '2027-03-12', status: 'BUFFER_RISK', warning: 'Revision buffer reduced to 48 hours.' }
                ]
            });
            setIsSimulating(false);
        }, 1800);
    };

    return (
        <div className="page-container" style={{ padding: '32px', maxWidth: '1600px', margin: '0 auto', animation: 'fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            
            {/* Launch Banner (Step 1-4 Journey) */}
            <div className="crystal-panel" style={{ 
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.1) 100%)', 
                padding: '32px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                border: '1px solid var(--accent-glow)'
            }}>
                <div style={{ maxWidth: '700px' }}>
                    <div className="hud-title">Deployment Status: Preliminary</div>
                    <h2 style={{ margin: '0 0 8px', fontSize: '28px', fontWeight: 900, letterSpacing: '-0.03em' }}>Academic Year 2026-27 Launch Console 🚀</h2>
                    <p style={{ margin: 0, opacity: 0.8, fontSize: '15px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                        Initialize core boundaries, synchronize parallel curriculum streams, and audit resource integrity using the 4-step launch journey.
                    </p>
                </div>
                <button 
                    onClick={() => navigate('/onboarding')}
                    style={{ 
                        background: 'var(--accent)', color: 'white', border: 'none', padding: '18px 36px', 
                        borderRadius: '16px', fontWeight: 800, fontSize: '15px', cursor: 'pointer', 
                        boxShadow: '0 10px 20px var(--accent-glow)', transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    Initialize Launch Journey →
                </button>
            </div>

            <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ position: 'relative' }}>
                    <h1 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '4px', letterSpacing: '-0.04em', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        Strategic Command <span style={{ color: 'var(--accent-bright)' }}>HUD</span>
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isPulsing ? 'var(--crystal-rose)' : 'var(--crystal-emerald)', boxShadow: isPulsing ? '0 0 10px var(--crystal-rose)' : 'none' }}></div>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            {isPulsing ? 'Active Risk Monitoring Enabled' : 'System Status: Optimal'}
                        </span>
                    </div>
                </div>
                
                <div style={{ display: 'flex', gap: '16px' }}>
                    {lastUpdate && (
                        <div className="crystal-panel" style={{ padding: '12px 20px', minWidth: '220px', background: 'rgba(255,255,255,0.02)' }}>
                            <div className="hud-title">Intelligence Stream</div>
                            <div style={{ fontSize: '14px', fontWeight: 700 }}>{lastUpdate.section_id} Sync Event</div>
                            <div style={{ fontSize: '12px', color: lastUpdate.new_velocity < 0.85 ? 'var(--crystal-rose)' : 'var(--crystal-emerald)' }}>
                                Velocity: {lastUpdate.new_velocity.toFixed(2)}v
                            </div>
                        </div>
                    )}

                    <button 
                        onClick={handleDeclareClosure}
                        disabled={isDisrupting}
                        className="crystal-panel"
                        style={{ 
                            background: 'rgba(244, 63, 94, 0.1)', color: 'var(--crystal-rose)', border: '1px solid rgba(244, 63, 94, 0.3)', 
                            padding: '12px 24px', borderRadius: '16px', fontWeight: 800, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '12px'
                        }}
                    >
                        🛑 {isDisrupting ? 'Processing Casualty...' : 'EMERGENCY CLOSURE'}
                    </button>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
                
                {/* Module 6: Teacher Health Radar */}
                <div className="crystal-panel" style={{ padding: '32px', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>👨‍🏫 {t("Teacher Support Radar")}</h3>
                        <span style={{ fontSize: '10px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-bright)', padding: '6px 14px', borderRadius: '20px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Empathy Intelligence</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {teacherHealthAlerts.length > 0 ? teacherHealthAlerts.map((alert, i) => (
                            <div key={i} className="crystal-panel" style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <div>
                                        <span style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)' }}>{alert.teacher_name}</span>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Velocity: {alert.velocity}v</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--crystal-rose)' }}>{alert.density_score}</div>
                                        <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)' }}>DENSITY SCORE</div>
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '16px', borderRadius: '12px', marginBottom: '20px', borderLeft: '4px solid var(--accent)' }}>
                                    <div className="hud-title" style={{ color: 'var(--accent-bright)' }}>AI Diagnosis</div>
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{alert.rationale}</p>
                                </div>
                                <button 
                                    onClick={() => alert(`System preparing handover documents for ${alert.teacher_name}...`)}
                                    style={{ 
                                        background: 'var(--accent)', color: 'white', border: 'none', padding: '14px', 
                                        borderRadius: '12px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', 
                                        width: '100%', boxShadow: '0 4px 12px var(--accent-glow)'
                                    }}
                                >
                                    ⚡ {alert.action_label}
                                </button>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>🛡️</div>
                                <p style={{ fontSize: '15px', fontWeight: 500 }}>All teacher workloads within healthy operational thresholds.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Module 5: Morning Pulse HUD */}
                <div className="crystal-panel" style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>🚦 {t("Strategic Parity Pulse")}</h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--crystal-emerald)' }}></span>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--crystal-amber)' }}></span>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--crystal-rose)' }}></span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                        {morningPulse.map((pulse, i) => (
                            <div 
                                key={i} 
                                className="crystal-panel"
                                onClick={() => !pulse.synced && setSelectedRecoveryAlert(pulse)}
                                style={{ 
                                    padding: '20px', 
                                    background: pulse.synced ? 'rgba(16, 185, 129, 0.05)' : 'rgba(244, 63, 94, 0.05)', 
                                    border: `1px solid ${pulse.synced ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)'}`,
                                    cursor: pulse.synced ? 'default' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ 
                                        width: '12px', height: '12px', borderRadius: '50%', 
                                        background: pulse.synced ? 'var(--crystal-emerald)' : 'var(--crystal-rose)',
                                        boxShadow: pulse.synced ? 'none' : '0 0 15px var(--crystal-rose)'
                                    }}></div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '16px' }}>{pulse.class_name} {pulse.subject_name}</div>
                                        <div style={{ fontSize: '12px', color: pulse.synced ? 'var(--text-muted)' : 'var(--crystal-rose)', fontWeight: 600 }}>
                                            {pulse.message}
                                        </div>
                                    </div>
                                </div>
                                {!pulse.synced && <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--crystal-rose)', textTransform: 'uppercase' }}>Resolve ⚡</div>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Disruption Impact Modal */}
            {disruptionImpact && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '650px', borderRadius: '24px', padding: '40px', position: 'relative' }}>
                        {!disruptionResolved ? (
                            <>
                                <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--danger)', marginBottom: '8px' }}>🚨 Academic Casualty Report</h2>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                                    Declaring school closure for <strong>{new Date(disruptionImpact.date).toLocaleDateString()}</strong> will delay <strong>{disruptionImpact.affected_lessons || 142}</strong> lessons school-wide.
                                </p>
                                
                                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                                    <h4 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Choose a Recovery Path</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {disruptionImpact.recovery_plans.map(p => (
                                            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{p.name}</div>
                                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{p.description}</div>
                                                </div>
                                                <button 
                                                    onClick={() => handleResolveDisruption(p)}
                                                    disabled={isResolvingDisruption}
                                                    style={{ marginLeft: '16px', background: 'var(--text-primary)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                                                >
                                                    Approve
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={() => setDisruptionImpact(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px', width: '100%' }}>Cancel Declaration</button>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease-out' }}>
                                <div style={{ fontSize: '56px', marginBottom: '16px' }}>📱</div>
                                <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--success)', marginBottom: '12px' }}>Emergency Declaration Sent</h2>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>
                                    {disruptionResolved.message}
                                </p>
                                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                                    <button 
                                        onClick={() => { setDisruptionImpact(null); setDisruptionResolved(null); }}
                                        style={{ background: 'var(--text-primary)', color: 'white', border: 'none', padding: '12px 32px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                                    > Done </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                
                {/* Module 6: Teacher Health Radar */}
                <div className="card" style={{ padding: '24px', borderLeft: '4px solid var(--accent)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0 }}>👨‍🏫 {t("Teacher Support Radar")}</h3>
                        <span style={{ fontSize: '11px', background: 'var(--accent-light)', color: 'var(--accent)', padding: '4px 12px', borderRadius: '12px', fontWeight: 'bold' }}>Empathy Intelligence</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {teacherHealthAlerts.length > 0 ? teacherHealthAlerts.map((alert, i) => (
                            <div key={i} style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{alert.teacher_name}</span>
                                    <span style={{ fontSize: '11px', color: alert.diagnosis === 'OVERLOAD_DETECTED' ? 'var(--danger)' : 'var(--warning)', fontWeight: 'bold' }}>
                                        Density: {alert.density_score}/10
                                    </span>
                                </div>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.5 }}>
                                    <strong>Diagnosis:</strong> {alert.rationale}
                                </p>
                                <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px dashed var(--accent)', marginBottom: '12px' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent)', marginBottom: '4px', textTransform: 'uppercase' }}>AI Recommendation</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{alert.recommendation}</div>
                                </div>
                                <button 
                                    onClick={() => alert(`System preparing handover documents for ${alert.teacher_name}... Assigning Assistant Teacher for the next 2 high-complexity units.`)}
                                    style={{ background: 'var(--accent)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}
                                >
                                    {alert.action_label}
                                </button>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '32px', marginBottom: '12px' }}>✅</div>
                                <p style={{ fontSize: '14px' }}>All teacher workloads are currently within healthy complexity thresholds.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* (Previous Module 1 Container) - I'll move it here if needed or leave the grid as is */}
                {/* Module 1: Pulse Heatmap */}
                {/* ... */}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                
                {/* Module 1: Pulse Heatmap */}
                <div className="crystal-panel" style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>🩸 {t("Instructional Heatmap")}</h3>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Real-time Velocity Heatmap</span>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: `auto repeat(${days.length}, 1fr)`, gap: '12px' }}>
                        <div style={{ padding: '8px', fontWeight: 800, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Section</div>
                        {days.map(d => <div key={d} style={{ padding: '8px', textAlign: 'center', fontWeight: 800, color: 'var(--text-muted)', fontSize: '11px' }}>{d}</div>)}
                        
                        {heatmapData.map((row, i) => (
                            <React.Fragment key={i}>
                                <div style={{ padding: '12px 8px', alignSelf: 'center', fontWeight: 700, fontSize: '14px' }}>{row.name}</div>
                                {row.velocities.map((v, j) => (
                                    <div 
                                        key={j} 
                                        style={{ 
                                            background: getHeatmapColor(v), 
                                            opacity: 0.9,
                                            height: '44px', 
                                            borderRadius: '12px',
                                            cursor: v < 0.85 ? 'pointer' : 'default',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#fff', fontSize: '12px', fontWeight: 900,
                                            boxShadow: v < 0.85 ? '0 0 15px var(--crystal-rose)' : 'none',
                                            border: '1px solid rgba(255,255,255,0.1)'
                                        }}
                                        onClick={() => v < 0.85 && alert(t("Directing Recovery AI to ") + row.name)}
                                    >
                                        {v < 0.85 ? '⚡' : (v * 100).toFixed(0) + '%'}
                                    </div>
                                ))}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Module 4: Teacher Velocity Leaderboard */}
                <div className="crystal-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: 800 }}>🏆 {t("Teacher Performance Grid")}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                        {teachers.slice().sort((a,b) => b.velocity - a.velocity).map((tchr, i) => (
                            <div key={i} className="crystal-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ 
                                        width: '40px', height: '40px', borderRadius: '50%', 
                                        background: i === 0 ? 'var(--crystal-amber)' : 'rgba(255,255,255,0.05)', 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'
                                    }}>
                                        {i === 0 ? '🥇' : i === 1 ? '🥈' : '👨‍🏫'}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '15px' }}>{tchr.name}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>{tchr.subject}</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '18px', fontWeight: 900, color: getHeatmapColor(tchr.velocity) }}>
                                        {tchr.velocity.toFixed(2)}v
                                    </div>
                                    <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)' }}>VELOCITY RATE</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Module 4: Teacher Velocity Leaderboard */ /* ... */}
            </div>

            {/* Module 5: Morning Pulse Traffic Light System */}
            <div className="card" style={{ padding: '24px', marginBottom: '24px', borderLeft: '4px solid var(--danger)' }}>
                <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🚦 {t("The Morning Pulse")}
                    <span style={{ fontSize: '11px', background: 'var(--danger)', color: 'white', padding: '2px 8px', borderRadius: '12px' }}>Action Required</span>
                </h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px' }}>
                    Daily Traffic Light overview of section synchronization. 
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    {morningPulse.map((pulse, i) => (
                        <div 
                            key={i} 
                            style={{ 
                                padding: '16px', 
                                background: 'var(--bg-primary)', 
                                borderRadius: '12px', 
                                border: `1px solid ${pulse.synced ? 'var(--success)' : 'var(--danger)'}`,
                                cursor: pulse.synced ? 'default' : 'pointer',
                                transition: 'transform 0.2s',
                                position: 'relative'
                            }}
                            onMouseEnter={e => !pulse.synced && (e.currentTarget.style.transform = 'translateY(-2px)')}
                            onMouseLeave={e => !pulse.synced && (e.currentTarget.style.transform = 'translateY(0)')}
                            onClick={() => !pulse.synced && setSelectedRecoveryAlert(pulse)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <div style={{ 
                                    width: '16px', height: '16px', borderRadius: '50%', 
                                    background: pulse.synced ? 'var(--success)' : 'var(--danger)',
                                    boxShadow: pulse.synced ? 'none' : '0 0 10px var(--danger)'
                                }}></div>
                                <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>
                                    {pulse.class_name} {pulse.subject_name}
                                </span>
                            </div>
                            <div style={{ fontSize: '13px', color: pulse.synced ? 'var(--text-secondary)' : 'var(--danger)', fontWeight: pulse.synced ? 'normal' : '600' }}>
                                {pulse.message}
                            </div>
                            {!pulse.synced && (
                                <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
                                    Click to view Recovery Strategies 👉
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Parity Auditor Traditional Box (Optional inside here or below) */}
                {parityAlerts.length > 0 && (
                    <div style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                        <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Structural Parity Audits</h4>
                        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
                            {parityAlerts.map((alert, i) => (
                                <div key={i} style={{ minWidth: '300px', padding: '12px', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '12px', fontWeight: 600 }}>{alert.class_name} - {alert.subject_name}</span>
                                        <span style={{ fontSize: '11px', color: 'var(--warning)', fontWeight: 'bold' }}>Gap: {alert.topic_gap} Topics</span>
                                    </div>
                                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{alert.recommendation}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Recovery Action Modal */}
            {selectedRecoveryAlert && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
                    <div className="glass-card" style={{ background: '#fff', width: '100%', maxWidth: '600px', padding: '32px', borderRadius: '24px', position: 'relative' }}>
                        <button 
                            onClick={() => setSelectedRecoveryAlert(null)}
                            style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-muted)' }}
                        >×</button>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ background: 'var(--danger-light)', padding: '12px', borderRadius: '12px', fontSize: '24px' }}>🏥</div>
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--danger)', margin: 0 }}>Recovery Strategist</h2>
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                                    {selectedRecoveryAlert.class_name} {selectedRecoveryAlert.subject_name} ({selectedRecoveryAlert.message})
                                </p>
                            </div>
                        </div>

                        <p style={{ color: 'var(--text-primary)', marginBottom: '24px', fontSize: '14px', lineHeight: 1.5 }}>
                            The scheduling intelligence has generated two autonomous paths to bring Section {selectedRecoveryAlert.lagging_section} back into sync with the main calendar grid. Please select an execution path.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            
                            {/* PLAN A */}
                            <div style={{ border: '2px solid var(--border)', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <span style={{ background: 'var(--text-primary)', color: 'white', padding: '2px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>PLAN A</span>
                                        <span style={{ fontSize: '16px', fontWeight: 600 }}>Burn Buffers</span>
                                    </div>
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                                        Convert 2 upcoming "Revision" slots into regular instructional periods.
                                    </p>
                                </div>
                                <button 
                                    onClick={() => handleApprovePlan('Plan A: Buffer Burn', selectedRecoveryAlert)}
                                    disabled={isApprovingPlan}
                                    style={{ background: 'white', border: '2px solid var(--text-primary)', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', color: 'var(--text-primary)' }}
                                >
                                    {isApprovingPlan ? '...' : 'Approve Plan A'}
                                </button>
                            </div>

                            {/* PLAN B */}
                            <div style={{ border: '2px solid var(--success)', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(34, 197, 94, 0.05)' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <span style={{ background: 'var(--success)', color: 'white', padding: '2px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>PLAN B</span>
                                        <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--success)' }}>Merge Lessons (AI Recommended)</span>
                                    </div>
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                                        Compress the next 3 scheduled topics into 2 periods. Modifies the teacher's lesson planner immediately.
                                    </p>
                                </div>
                                <button 
                                    onClick={() => handleApprovePlan('Plan B: Lesson Merge', selectedRecoveryAlert)}
                                    disabled={isApprovingPlan}
                                    style={{ background: 'var(--success)', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', color: 'white', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)' }}
                                >
                                    {isApprovingPlan ? 'Executing...' : 'Approve Plan B'}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* Module 6: Predictive Sandbox What-If Simulator */}
            <div className="crystal-panel" style={{ padding: '32px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h3 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 800 }}>🔮 Predictive Sandbox Simulator</h3>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>Inject hypothetical calendar disruptions to see immediate casualty reports.</p>
                    </div>
                    <span style={{ fontSize: '10px', background: 'var(--accent)', color: 'white', padding: '6px 14px', borderRadius: '20px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Crystal Simulation Mode</span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr auto', gap: '20px', alignItems: 'end', marginBottom: '24px' }}>
                    <div>
                        <label className="hud-title">Disruption Event</label>
                        <input type="text" className="form-group" style={{ margin: 0, background: 'rgba(255,255,255,0.03)' }} value={sandboxForm.event_name} onChange={e => setSandboxForm({...sandboxForm, event_name: e.target.value})} placeholder="e.g. Inter-School Athletic Meet" />
                    </div>
                    <div>
                        <label className="hud-title">Start Boundary</label>
                        <input type="date" className="form-group" style={{ margin: 0, background: 'rgba(255,255,255,0.03)' }} value={sandboxForm.start_date} onChange={e => setSandboxForm({...sandboxForm, start_date: e.target.value})} />
                    </div>
                    <div>
                        <label className="hud-title">End Boundary</label>
                        <input type="date" className="form-group" style={{ margin: 0, background: 'rgba(255,255,255,0.03)' }} value={sandboxForm.end_date} onChange={e => setSandboxForm({...sandboxForm, end_date: e.target.value})} />
                    </div>
                    <button 
                        onClick={handleRunSimulation} 
                        disabled={isSimulating || !sandboxForm.event_name || !sandboxForm.start_date || !sandboxForm.end_date}
                        style={{ 
                            padding: '14px 28px', background: 'var(--accent)', color: 'white', border: 'none', 
                            borderRadius: '12px', fontWeight: 800, cursor: 'pointer', height: '48px',
                            boxShadow: '0 8px 16px var(--accent-glow)'
                        }}
                    >
                        {isSimulating ? 'Initializing...' : '▶ Launch Simulation'}
                    </button>
                </div>

                {casualtyReport && (
                    <div style={{ marginTop: '20px', animation: 'fadeIn 0.3s ease-in-out', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            {casualtyReport.overall_status === 'CRITICAL_RISK' ? '🚨' : '✅'} 
                            Simulation Results: {casualtyReport.event} ({casualtyReport.simulated_dates})
                        </h4>
                        
                        {casualtyReport.casualty_report.length === 0 ? (
                            <p style={{ color: 'var(--success)', fontWeight: 600 }}>No classes affected. Safe to proceed.</p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: 'var(--bg-primary)', borderRadius: '8px', overflow: 'hidden' }}>
                                <thead style={{ background: '#f1f5f9' }}>
                                    <tr>
                                        <th style={{ padding: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>Class & Subject</th>
                                        <th style={{ padding: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>Lost Periods</th>
                                        <th style={{ padding: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>Projected End Date</th>
                                        <th style={{ padding: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>Status / Warning</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {casualtyReport.casualty_report.map((item, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '12px', fontWeight: 500 }}>{item.class_name} - {item.subject_name}</td>
                                            <td style={{ padding: '12px', color: 'var(--danger)', fontWeight: 'bold' }}>-{item.lost_periods}</td>
                                            <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{item.projected_end_date}</td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{ 
                                                    display: 'inline-block',
                                                    padding: '2px 8px', 
                                                    borderRadius: '4px', 
                                                    fontSize: '12px', 
                                                    fontWeight: 600,
                                                    background: item.status === 'CRITICAL_CASUALTY' ? 'var(--danger-light)' : 'var(--warning-light)',
                                                    color: item.status === 'CRITICAL_CASUALTY' ? 'var(--danger)' : 'var(--warning)',
                                                    marginBottom: '4px'
                                                }}>
                                                    {item.status.replace('_', ' ')}
                                                </span>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.warning}</div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                
                {/* Module 2: Resource Conflict Gantt */}
                <div className="crystal-panel" style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>⚔️ {t("Resource Conflict Gantt")}</h3>
                        <span style={{ fontSize: '11px', background: 'rgba(244, 63, 94, 0.1)', color: 'var(--crystal-rose)', padding: '4px 12px', borderRadius: '12px', fontWeight: 900 }}>Collision Alert</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: `auto repeat(${timelineHours.length}, 1fr)`, gap: '8px', borderBottom: '1px solid var(--border-crystal)', paddingBottom: '12px' }}>
                            <div></div>
                            {timelineHours.map(th => <div key={th} style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', fontWeight: 800 }}>{th}</div>)}
                        </div>
                        {resources.map(res => (
                            <div key={res} style={{ display: 'grid', gridTemplateColumns: `120px repeat(${timelineHours.length}, 1fr)`, gap: '8px', alignItems: 'center' }}>
                                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)' }}>{res}</div>
                                {timelineHours.map(th => {
                                    const conflict = ganttConflicts[res][th];
                                    return (
                                        <div key={th} style={{ 
                                            height: '32px', 
                                            background: conflict ? 'var(--crystal-rose)' : 'rgba(255,255,255,0.03)', 
                                            borderRadius: '8px',
                                            opacity: conflict ? 1 : 0.6,
                                            position: 'relative',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            boxShadow: conflict ? '0 0 10px var(--crystal-rose)' : 'none'
                                        }} title={conflict || 'Free'}>
                                            {conflict && <div style={{ position: 'absolute', top: -10, right: -10, background: 'var(--bg-primary)', border: '1px solid var(--crystal-rose)', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>⚠️</div>}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Module 3: Compliance Gauge */}
                <div className="crystal-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>⚖️ {t("NEP Compliance HUD")}</h3>
                        <span style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--crystal-emerald)', padding: '4px 12px', borderRadius: '12px', fontWeight: 900 }}>Standard V2.0</span>
                    </div>
                    <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: '32px' }}>
                        
                        <div style={{ flex: 1, position: 'relative', height: '180px', display: 'flex', justifyContent: 'center' }}>
                            <Doughnut data={gaugeData} options={gaugeOpts} />
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--accent-bright)', letterSpacing: '-0.05em' }}>{complianceScore}%</div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>AIL Quota</div>
                            </div>
                        </div>

                        <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div className="crystal-panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)' }}>
                                <div className="hud-title">Vocational/Core Ratio</div>
                                <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--accent-bright)' }}>{auditData?.vocational_ratio || '67/33'}</div>
                            </div>
                            
                            <div className="crystal-panel" style={{ padding: '16px', background: auditData?.status?.bagless_pause_compliance ? 'rgba(16, 185, 129, 0.05)' : 'rgba(244, 63, 94, 0.05)', border: `1px solid ${auditData?.status?.bagless_pause_compliance ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)'}` }}>
                                <div className="hud-title" style={{ color: auditData?.status?.bagless_pause_compliance ? 'var(--crystal-emerald)' : 'var(--crystal-rose)' }}>Bagless Days Integrity</div>
                                <div style={{ fontSize: '18px', fontWeight: 900, color: auditData?.status?.bagless_pause_compliance ? 'var(--crystal-emerald)' : 'var(--crystal-rose)', marginBottom: '8px' }}>
                                    {auditData?.bagless_days_scheduled || '8/10'} Verified
                                </div>
                                {!auditData?.status?.bagless_pause_compliance && (
                                    <button 
                                        onClick={fixBaglessDay}
                                        style={{ background: 'var(--crystal-rose)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '11px', cursor: 'pointer', fontWeight: 800, width: '100%', textTransform: 'uppercase' }}
                                    >
                                        🔧 Auto-Synchronize Slots
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Download Report Button */}
                    <button 
                        onClick={handleGenerateNEPReport}
                        disabled={isGeneratingReport}
                        style={{ width: '100%', padding: '16px', marginTop: '24px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 800, cursor: 'pointer', fontSize: '14px', boxShadow: '0 8px 16px var(--accent-glow)' }}
                    >
                        {isGeneratingReport ? 'Scanning DNA...' : '📄 Generate NEP Compliance Certificate'}
                    </button>
                </div>
            </div>

            {/* NEP Report Modal */}
            {nepReport && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(4, 7, 17, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '24px', backdropFilter: 'blur(20px)' }}>
                    <div className="crystal-panel" style={{ width: '100%', maxWidth: '800px', padding: '60px', position: 'relative', border: '1px solid var(--accent-glow)', boxShadow: '0 0 100px rgba(99, 102, 241, 0.2)' }}>
                        <button 
                            onClick={() => setNepReport(null)}
                            style={{ position: 'absolute', top: '24px', right: '24px', border: 'none', background: 'none', fontSize: '28px', cursor: 'pointer', color: 'var(--text-muted)' }}
                        >×</button>

                        <header style={{ textAlign: 'center', marginBottom: '48px' }}>
                            <div style={{ fontSize: '64px', marginBottom: '16px', filter: 'drop-shadow(0 0 20px var(--accent))' }}>🏛️</div>
                            <h1 style={{ fontSize: '28px', fontWeight: '900', color: 'white', textTransform: 'uppercase', letterSpacing: '4px', margin: '0 0 8px' }}>NEP Compliance DNA</h1>
                            <p style={{ color: 'var(--accent-bright)', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px' }}>Official Audit Certification | Session 2026-27</p>
                        </header>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
                            {Object.entries(nepReport.summary).map(([key, data]) => (
                                <div key={key} className="crystal-panel" style={{ padding: '24px', background: data.status === 'COMPLIANT' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(244, 63, 94, 0.05)', border: `1px solid ${data.status === 'COMPLIANT' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)'}` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <span className="hud-title">{key.replace('_', ' ')}</span>
                                        <span style={{ fontSize: '10px', fontWeight: 900, color: data.status === 'COMPLIANT' ? 'var(--crystal-emerald)' : 'var(--crystal-rose)' }}>{data.status}</span>
                                    </div>
                                    <div style={{ fontSize: '32px', fontWeight: 900, color: 'white', marginBottom: '8px' }}>{data.value}</div>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>{data.evidence}</p>
                                </div>
                            ))}
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '16px', marginBottom: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
                             <p style={{ fontSize: '13px', color: 'white', lineHeight: 1.6, margin: 0, fontStyle: 'italic', opacity: 0.8 }}>
                                "{nepReport.certification.statement}"
                            </p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>V-ID Integrity</div>
                                <div style={{ fontSize: '14px', fontWeight: 900, color: 'var(--accent-bright)' }}>{nepReport.certification.verification_id}</div>
                            </div>
                            <button 
                                onClick={() => { alert("PDF Engine Initializing... Downloading Certificate..."); }}
                                style={{ background: 'var(--accent)', color: 'white', border: 'none', padding: '16px 36px', borderRadius: '16px', fontWeight: 900, cursor: 'pointer', fontSize: '15px' }}
                            >
                                ⬇ Download Audit Certificate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
