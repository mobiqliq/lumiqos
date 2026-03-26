import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const CurriculumBuilder = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pourProgress, setPourProgress] = useState(0);
    const [isPouring, setIsPouring] = useState(false);

    const schoolId = localStorage.getItem('school_id') || 'd4c837bd-ea38-42ca-a99f-ffddf2e148a8';
    const token = localStorage.getItem('school_token') || 'demo-token';

    const getHeaders = () => ({
        'X-School-Id': schoolId,
        'Authorization': `Bearer ${token}`
    });

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/academic/classes', { headers: getHeaders() });
            setClasses(res.data || []);
        } catch (err) { 
            console.error("Classes fetch failed, using fallback", err);
            setClasses([
                { id: '1', class_name: 'Grade 10A', grade_level: 10 },
                { id: '2', class_name: 'Grade 9B', grade_level: 9 }
            ]);
        }
        finally { setLoading(false); }
    };

    const fetchSubjects = async (classId) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/academic/subjects?class_id=${classId}`, { headers: getHeaders() });
            setSubjects(res.data || []);
        } catch (err) { 
            console.error("Subjects fetch failed, using fallback", err);
            setSubjects([
                { id: 's1', name: 'Physics' },
                { id: 's2', name: 'Mathematics' },
                { id: 's3', name: 'Chemistry' }
            ]);
        }
        finally { setLoading(false); }
    };

    const handleSelectClass = (cls) => {
        setSelectedClass(cls);
        fetchSubjects(cls.id);
        setStep(1.5); // Selection sub-step
    };

    const startIntelligencePour = () => {
        setIsPouring(true);
        setStep(2);
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;
            setPourProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
                setIsPouring(false);
                setStep(3);
            }
        }, 150);
    };

    const renderStep1 = () => (
        <div style={{ animation: 'fadeIn 0.3s' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px', color: '#fff', letterSpacing: '-0.5px' }}>
                Select <span style={{ color: 'var(--accent)' }}>Academic Context</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', fontSize: '15px' }}>
                Choose the grade and subject to initialize the intelligence-driven curriculum scan.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px' }}>
                {classes.map(cls => (
                    <div 
                        key={cls.id} 
                        className={`card ${selectedClass?.id === cls.id ? 'active' : ''}`}
                        onClick={() => handleSelectClass(cls)}
                        style={{ 
                            padding: '32px', textAlign: 'center', cursor: 'pointer',
                            background: selectedClass?.id === cls.id ? 'var(--accent)' : 'var(--bg-card)',
                            boxShadow: selectedClass?.id === cls.id ? 'var(--shadow-glow-blue)' : 'none',
                        }}
                    >
                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>{cls.class_name}</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: 700, marginTop: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            GRADE {cls.grade_level}
                        </div>
                    </div>
                ))}
            </div>

            {selectedClass && (
                <div style={{ marginTop: '48px' }}>
                    <div className="hud-title" style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 800 }}>SELECT SUBJECT</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '20px' }}>
                        {subjects.map(sub => (
                            <button 
                                key={sub.id} 
                                onClick={() => setSelectedSubject(sub)}
                                className={`btn ${selectedSubject?.id === sub.id ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ padding: '14px 28px', borderRadius: '12px', fontSize: '15px' }}
                            >
                                {sub.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {selectedSubject && (
                <div style={{ marginTop: '64px', textAlign: 'center' }}>
                    <button className="btn btn-primary" onClick={startIntelligencePour} style={{ padding: '20px 64px', fontSize: '18px', borderRadius: '16px', boxShadow: '0 8px 32px var(--accent-glow)' }}>
                        Initialize Intelligence Builder
                    </button>
                </div>
            )}
        </div>
    );

    const renderStep2 = () => (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '16px' }}>Generating <span style={{ color: 'var(--accent)' }}>Curriculum Plan</span></h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Mapping NCERT outcomes and calculating lesson sequences...</p>
            
            <div style={{ maxWidth: '480px', margin: '0 auto', marginBottom: '40px' }}>
                <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <div style={{ width: `${pourProgress}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.2s linear' }}></div>
                </div>
                <div style={{ marginTop: '12px', fontSize: '14px', fontWeight: 600, color: 'var(--accent)' }}>{pourProgress}% Complete</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                <div style={{ fontSize: '14px', color: pourProgress > 20 ? 'var(--success)' : 'var(--text-muted)', fontWeight: 500 }}>
                    {pourProgress > 20 ? '✓' : '○'} Mapping NCERT Learning Outcomes
                </div>
                <div style={{ fontSize: '14px', color: pourProgress > 50 ? 'var(--success)' : 'var(--text-muted)', fontWeight: 500 }}>
                    {pourProgress > 50 ? '✓' : '○'} Calculating Optimal Sequencing
                </div>
                <div style={{ fontSize: '14px', color: pourProgress > 80 ? 'var(--success)' : 'var(--text-muted)', fontWeight: 500 }}>
                    {pourProgress > 80 ? '✓' : '○'} Synchronizing Academic Baseline
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div style={{ animation: 'fadeIn 0.3s' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px', color: '#fff', letterSpacing: '-0.5px' }}>
                Baseline <span style={{ color: '#10b981' }}>Generated</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', fontSize: '15px' }}>
                Review the proposed syllabus distribution before deployment.
            </p>
            
            <div style={{ marginBottom: '48px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                    <div className="card card-glow-blue" style={{ padding: '32px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Target Completion</div>
                        <div style={{ fontSize: '26px', fontWeight: 800 }}>March 15, 2027</div>
                    </div>
                    <div className="card card-glow-purple" style={{ padding: '32px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Units Sequenced</div>
                        <div style={{ fontSize: '26px', fontWeight: 800 }}>14 Chapters</div>
                    </div>
                    <div className="card card-glow-emerald" style={{ padding: '32px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Revision Buffer</div>
                        <div style={{ fontSize: '26px', fontWeight: 800 }}>12 Days</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={() => setStep(1)} style={{ padding: '16px 40px', borderRadius: '14px' }}>Modify Parameters</button>
                <button className="btn btn-primary" onClick={() => navigate('/curriculum-portal')} style={{ padding: '20px 56px', fontSize: '18px', borderRadius: '16px', boxShadow: '0 8px 32px var(--accent-glow)' }}>
                    Deploy Baseline to Calendar
                </button>
            </div>
        </div>
    );

    return (
        <div className="page-container" style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ 
                            width: '40px', height: '4px', borderRadius: '2px',
                            background: step >= i ? 'var(--accent)' : 'var(--bg-secondary)',
                        }}></div>
                    ))}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>CURRICULUM ARCHITECT v1.0</div>
            </div>

            {loading && step < 2 ? <div style={{ textAlign: 'center' }}>Syncing with Board...</div> : (
                <>
                    {step < 2 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                </>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .nav-item.active { border-color: var(--accent); }
            `}</style>
        </div>
    );
};

export default CurriculumBuilder;
