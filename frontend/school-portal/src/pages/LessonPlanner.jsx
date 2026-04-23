import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import InsightCard from '../components/InsightCard';

export default function LessonPlanner() {
    const location = useLocation();
    const initialState = location.state || {};

    const [subject, setSubject] = useState(initialState.subject || '');
    const [topic, setTopic] = useState(initialState.topic || '');
    const [targetClass, setTargetClass] = useState(initialState.targetClass || '');
    const [duration, setDuration] = useState(initialState.duration || '45 Mins');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);
    const [isExecuted, setIsExecuted] = useState(false);
    const [plan, setPlan] = useState(null);
    const [activeTab, setActiveTab] = useState('structure');
    const [assignments, setAssignments] = useState([]);
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [recommendation, setRecommendation] = useState(null);
    const [isCustomTopic, setIsCustomTopic] = useState(false);
    const [syllabusTopics, setSyllabusTopics] = useState([]);

    const schoolId = localStorage.getItem('schoolId') || 'f2efb39f-304b-4841-8faf-7bda14454aac';
    const teacherId = localStorage.getItem('userId') || '1dc69606-ae8e-46df-8f9d-2ee971e391a0'; 

    // 1. Fetch Teacher Assignments once
    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const res = await axios.get('/api/curriculum/teacher/assignments');
                setAssignments(res.data);
                
                // Initialize selection if not present
                if (res.data.length > 0 && !initialState.targetClass) {
                    const first = res.data[0];
                    const classLabel = `${first.class.name} (${first.class.grade_level})`;
                    setTargetClass(classLabel);
                    setSubject(first.subject.name);
                }
            } catch (err) {
                console.error("Failed to fetch teacher assignments", err);
            }
        };
        fetchAssignments();
    }, []);

    // 2. Update available subjects and fetch recommendations when targetClass changes
    useEffect(() => {
        if (targetClass && assignments?.length > 0) {
            const subjectsForClass = assignments
                .filter(a => `${a.class.name} (${a.class.grade_level})` === targetClass)
                .map(a => a.subject);
            
            setAvailableSubjects(subjectsForClass);

            // Fetch recommendations for the selected class/subject
            const activeAssignment = assignments.find(a => 
                `${a.class.name} (${a.class.grade_level})` === targetClass && a.subject.name === subject
            );

            if (activeAssignment) {
                const fetchRec = async () => {
                    try {
                        const res = await axios.get(`/api/curriculum/syllabus/recommendations/${activeAssignment.class_id}/${activeAssignment.subject_id}`);
                        setRecommendation(res.data);
                        setSyllabusTopics(res.data.topics || []);
                        if (!topic && res.data.recommendedTopic) {
                            setTopic(res.data.recommendedTopic);
                        }
                    } catch (err) {
                        console.error("Failed to fetch recommendations", err);
                    }
                };
                fetchRec();
            }
        }
    }, [targetClass, subject, assignments]);

    const handleGenerate = useCallback(async () => {
        if (!topic.trim()) return;
        setIsGenerating(true);
        setPlan(null);

        try {
            const activeAssignment = assignments.find(a => 
                `${a.class.name} (${a.class.grade_level})` === targetClass && a.subject.name === subject
            );

            const res = await axios.post('/api/curriculum/generate-lesson-plan', {
                schoolId,
                classId: activeAssignment?.class_id,
                subjectId: activeAssignment?.subject_id,
                teacherId,
                topic
            });

            const planData = res.data.plan_data;
            
            setPlan({
                ...planData,
                id: res.data.id, // Capture the saved LessonPlan ID
                targetClass: targetClass.split(' (')[0], // Clean label
                duration,
                subject 
            });
            setActiveTab('structure');
        } catch (err) {
            console.error("Failed to generate lesson plan.", err);
        } finally {
            setIsGenerating(false);
            setIsExecuted(false);
        }
    }, [topic, subject, targetClass, duration, schoolId, teacherId, assignments]);

    const handleExecute = async () => {
        if (!plan) return;
        setIsExecuting(true);
        try {
            const activeAssignment = assignments.find(a => 
                `${a.class.name} (${a.class.grade_level})` === targetClass && a.subject.name === subject
            );

            if (activeAssignment) {
                // Now passes the TeacherSubject ID, the topic, AND the lessonPlanId
                await axios.post(`/api/curriculum/execute/${activeAssignment.id}`, { 
                    topic: plan.topic,
                    lessonPlanId: plan.id 
                });
                setIsExecuted(true);
            }
        } catch (err) {
            console.error("Execution failed", err);
        } finally {
            setIsExecuting(false);
        }
    };

    useEffect(() => {
        if (initialState.autoGenerate) {
            handleGenerate();
        }
    }, [handleGenerate, initialState.autoGenerate]);

    return (
        <div className="page-content">
            <div className="page-header">
                <div>
                    <h2>💡 AI Lesson Planner & Formative Assessor</h2>
                    <p>Grade 1-12 & Subject-Adaptive Pedagogy (Board Aligned)</p>
                </div>
            </div>

            <div className="charts-grid" style={{ gridTemplateColumns: '300px 1fr', alignItems: 'start' }}>
                <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ marginBottom: 20 }}>Class Details</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>Subject</label>
                            <select className="form-input" style={{ appearance: 'auto' }} value={subject} onChange={(e) => setSubject(e.target.value)}>
                                <option value="">Select Subject...</option>
                                {availableSubjects.map((s, i) => (
                                    <option key={i} value={s.name}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>Target Grade & Section</label>
                            <select className="form-input" style={{ appearance: 'auto' }} value={targetClass} onChange={(e) => setTargetClass(e.target.value)}>
                                <option value="">Select Class...</option>
                                {[...new Set(assignments.filter(a => a?.class?.name).map(a => `${a.class.name} (${a.class.grade_level})`))].map((c, i) => (
                                    <option key={i} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>
                                Topic {recommendation && <span style={{ color: '#6366f1', fontSize: 11, fontWeight: 400, marginLeft: 8 }}>✨ Suggested: {recommendation.recommendedTopic}</span>}
                            </label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {!isCustomTopic ? (
                                    <select 
                                        className="form-input" 
                                        style={{ appearance: 'auto', flex: 1 }} 
                                        value={topic} 
                                        onChange={(e) => setTopic(e.target.value)}
                                    >
                                        <option value="">Select from Syllabus...</option>
                                        {syllabusTopics.map((t, i) => (
                                            <option key={i} value={t}>{t}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input 
                                        type="text" 
                                        className="form-input" 
                                        style={{ flex: 1 }}
                                        placeholder="Enter any topic (e.g. History of AI)..." 
                                        value={topic} 
                                        onChange={(e) => setTopic(e.target.value)}
                                    />
                                )}
                                <button 
                                    onClick={() => {
                                        setIsCustomTopic(!isCustomTopic);
                                        if (!isCustomTopic) setTopic(''); // Clear when going to custom
                                    }}
                                    style={{ 
                                        padding: '0 12px', 
                                        borderRadius: 8, 
                                        border: '1px solid #e2e8f0', 
                                        background: isCustomTopic ? '#6366f1' : 'white',
                                        color: isCustomTopic ? 'white' : '#64748b',
                                        fontSize: 12,
                                        cursor: 'pointer'
                                    }}
                                    title={isCustomTopic ? "Back to Syllabus" : "Custom Topic / AI Explorer"}
                                >
                                    {isCustomTopic ? '📚' : '🚀'}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>Class Duration</label>
                            <select className="form-input" style={{ appearance: 'auto' }} value={duration} onChange={(e) => setDuration(e.target.value)}>
                                <option value="45 Mins">45 Mins</option>
                                <option value="60 Mins">60 Mins</option>
                                <option value="90 Mins (Block)">90 Mins (Block)</option>
                            </select>
                        </div>

                        <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={handleGenerate} disabled={isGenerating || !topic}>
                            {isGenerating ? '🧠 Generating Plan...' : '✨ Generate Lesson Plan'}
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <InsightCard
                        type="action"
                        icon="🎯"
                        title="Universal Adaptivity"
                        body="Lesson plans now adapt structure based on school board (CBSE/IB) and grade-level cognitive benchmarks (Primary/Secondary)."
                    />

                    {isGenerating && (
                        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }} className="spin-animation">⚙️</div>
                            <h3>Optimizing Pedagogy for {targetClass}...</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Aligning with board benchmarks & grade benchmarks.</p>
                        </div>
                    )}

                    {plan && (
                        <div className="card" style={{ padding: 32, border: '2px solid var(--accent)' }}>
                            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 24 }}>
                                <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                                <span className="badge" style={{ backgroundColor: 'var(--accent-vibrant)', color: 'white' }}>{plan.targetClass}</span>
                                <span className="badge" style={{ backgroundColor: 'var(--success-vibrant)', color: 'white' }}>{plan.subject}</span>
                                {plan.pedagogy && (
                                    <span className="badge" style={{ backgroundColor: 'var(--accent-dim)', color: 'var(--accent-vibrant)', border: '1px solid var(--accent-vibrant)' }}>
                                        🧩 {plan.pedagogy}
                                    </span>
                                )}
                                {plan.benchmark && (
                                    <span className="badge" style={{ backgroundColor: 'var(--warning-dim)', color: 'var(--warning-vibrant)', border: '1px solid var(--warning-vibrant)' }}>
                                        📜 {plan.benchmark.label}
                                    </span>
                                )}
                                <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>{plan.duration} Overview</span>
                                </div>
                                <h2 style={{ margin: '8px 0', color: 'var(--text-primary)' }}>{plan.topic}</h2>
                                <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}><strong>Objective:</strong> {plan.objective}</p>
                            </div>

                            <div style={{ display: 'flex', gap: 16, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                                <button className={`btn btn-sm ${activeTab === 'structure' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('structure')} style={activeTab !== 'structure' ? { background: 'transparent', border: 'none' } : {}} >⏱️ Timeline</button>
                                <button className={`btn btn-sm ${activeTab === 'misconceptions' ? 'btn-danger' : 'btn-secondary'}`} onClick={() => setActiveTab('misconceptions')} style={activeTab !== 'misconceptions' ? { background: 'transparent', border: 'none' } : { background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderColor: 'var(--danger)' }} >⚠️ Misconception Traps</button>
                                <button className={`btn btn-sm ${activeTab === 'differentiation' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('differentiation')} style={activeTab !== 'differentiation' ? { background: 'transparent', border: 'none' } : { background: 'rgba(139, 92, 246, 0.1)', color: 'var(--purple)', borderColor: 'var(--purple)' }} >🎯 Differentiation</button>
                                <button className={`btn btn-sm ${activeTab === 'assessment' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('assessment')} style={activeTab !== 'assessment' ? { background: 'transparent', border: 'none' } : { background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', borderColor: 'var(--warning)' }} >📝 Assessment & Bloom's</button>
                                <button className={`btn btn-sm ${activeTab === 'parent' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('parent')} style={activeTab !== 'parent' ? { background: 'transparent', border: 'none' } : { background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderColor: 'var(--success)' }} >🏠 Kitchen Table Hooks</button>
                            </div>

                            {activeTab === 'structure' && (
                                <div>
                                    <h3 style={{ marginBottom: 16 }}>Class Structure</h3>
                                    <div style={{ display: 'grid', gap: 16 }}>
                                        {plan.structure.map((phase, i) => (
                                            <div key={i} style={{ display: 'flex', gap: 16, padding: 16, background: 'var(--bg-primary)', borderLeft: '3px solid var(--accent)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0', border: '1px solid var(--border)', borderLeftWidth: 3, borderLeftColor: 'var(--accent)' }}>
                                                <div style={{ fontWeight: 700, minWidth: 60, color: 'var(--accent)' }}>{phase.time}</div>
                                                <div>
                                                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{phase.phase}</div>
                                                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: '1.5' }}>{phase.desc}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'misconceptions' && (
                                <div>
                                    <h3 style={{ marginBottom: 16, color: 'var(--danger)' }}>Anticipated Misconceptions</h3>
                                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Address these specific traps proactively before students form incorrect mental models.</p>
                                    <div style={{ display: 'grid', gap: 16 }}>
                                        {plan.misconceptions.map((misc, i) => (
                                            <div key={i} style={{ padding: 16, background: 'rgba(239, 68, 68, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                                                <div style={{ fontWeight: 600, color: 'var(--danger)', marginBottom: 8 }}>❌ Trap: {misc.trap}</div>
                                                <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>✅ <strong>Solution:</strong> {misc.solution}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'differentiation' && (
                                <div>
                                    <h3 style={{ marginBottom: 16, color: 'var(--purple)' }}>Dynamic Differentiation Strategies</h3>
                                    <div style={{ display: 'grid', gap: 16 }}>
                                        <div style={{ padding: 16, background: 'rgba(139, 92, 246, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(139, 92, 246, 0.2)', borderLeft: '4px solid var(--danger)' }}>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>FOR STRUGGLING STUDENTS</div>
                                            <div style={{ fontSize: 14 }}>{plan.differentiation.struggling}</div>
                                        </div>
                                        <div style={{ padding: 16, background: 'rgba(139, 92, 246, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(139, 92, 246, 0.2)', borderLeft: '4px solid var(--success)' }}>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>FOR ADVANCED STUDENTS (HIGH COGNITIVE XP)</div>
                                            <div style={{ fontSize: 14 }}>{plan.differentiation.advanced}</div>
                                        </div>
                                        <div style={{ padding: 16, background: 'rgba(139, 92, 246, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(139, 92, 246, 0.2)', borderLeft: '4px solid var(--purple)' }}>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>FOR CREATIVE LEARNERS</div>
                                            <div style={{ fontSize: 14 }}>{plan.differentiation.creative}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'assessment' && (
                                <div>
                                    <h3 style={{ marginBottom: 16 }}>Bloom's Taxonomy Scaffolding</h3>
                                    <div style={{ display: 'grid', gap: 12, marginBottom: 32 }}>
                                        {plan.blooms.map((b, i) => (
                                            <div key={i} style={{ display: 'flex', gap: 16, padding: '12px 16px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                                                <div style={{ width: 100, fontSize: 12, fontWeight: 700, color: i === 0 ? 'var(--text-muted)' : i === 1 ? 'var(--accent)' : 'var(--purple)' }}>{b.level.toUpperCase()}</div>
                                                <div style={{ flex: 1, fontSize: 13 }}>{b.q}</div>
                                                <div style={{ width: 80, fontSize: 12, color: 'var(--text-secondary)', textAlign: 'right' }}>[{b.type}]</div>
                                            </div>
                                        ))}
                                    </div>

                                    <h3 style={{ marginBottom: 16, color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span>📝</span> Formative Assessment (Exit Ticket) (10 Mins)
                                    </h3>
                                    <div style={{ padding: 24, background: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid var(--warning)' }}>
                                        <p style={{ fontSize: 13, marginBottom: 16, color: 'var(--text-secondary)' }}>Hand this out 10 minutes before the bell rings. Use the XceliQOS Teacher App to scan responses to measure class grasp.</p>
                                        <div style={{ fontWeight: 600, marginBottom: 8 }}>1. {plan.exitTicket.q1}</div>
                                        <div style={{ fontWeight: 600 }}>2. {plan.exitTicket.q2}</div>
                                        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                                            <button className="btn btn-sm btn-primary" style={{ background: 'var(--warning)', color: '#000', border: 'none' }}>Print Tickets</button>
                                            <button className="btn btn-sm btn-secondary" style={{ borderColor: 'var(--warning)', color: 'var(--warning)', background: 'transparent' }}>Assign to Student Portal</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'parent' && (
                                <div>
                                    <h3 style={{ marginBottom: 16, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span>🏠</span> Kitchen Table Conversations (Parent Intelligence)
                                    </h3>
                                    <div style={{ padding: 24, background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid var(--success)' }}>
                                        <p style={{ fontSize: 13, marginBottom: 16, color: 'var(--text-secondary)' }}>These hooks encourage parents to engage in meaningful dialogue about today's learning. They will appear on the Parent Dashboard once you click "Execute Lesson".</p>
                                        <div style={{ display: 'grid', gap: 12 }}>
                                            {(plan.kitchenTableHooks || [
                                                "What was the most surprising thing you learned about " + plan.topic + " today?",
                                                "If you had to explain " + plan.topic + " to someone who had never heard of it, what would you say?"
                                            ]).map((hook, i) => (
                                                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'start' }}>
                                                    <span style={{ fontSize: 18 }}>💡</span>
                                                    <div style={{ fontWeight: 600, fontSize: 14 }}>{hook}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                                <button 
                                    className="btn btn-primary" 
                                    onClick={handleExecute} 
                                    disabled={isExecuting || isExecuted}
                                    style={{ background: isExecuted ? 'var(--success)' : 'var(--accent)', borderColor: isExecuted ? 'var(--success)' : 'var(--accent)' }}
                                >
                                    {isExecuting ? '⌛ Executing...' : isExecuted ? '✅ Lesson Executed & Syllabus Updated' : '🚀 Execute Lesson & Update Syllabus'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
