import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { demoData } from '../api/client';

export default function CurriculumPortal() {
    const { t } = useTranslation();
    const userRole = localStorage.getItem('userRole') || 'admin';
    const isTeacher = userRole === 'teacher';
    const schoolId = localStorage.getItem('schoolId') || 'f2efb39f-304b-4841-8faf-7bda14454aac';
    const academicYearId = localStorage.getItem('academicYearId') || '3a14ba0e-8762-4370-b1e9-679a75a782a6';

    const [viewDate, setViewDate] = useState(new Date());
    const [calendarData, setCalendarData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [dailyMappings, setDailyMappings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dashboardSummary, setDashboardSummary] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState(localStorage.getItem('selectedClassId') || '8cd9b059-b323-4295-b7ff-369687a9f9b8');
    const [subjects, setSubjects] = useState([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState('');

    const [planStatus, setPlanStatus] = useState('NONE'); // NONE, GENERATED, APPROVED, INFEASIBLE
    const [planVersion, setPlanVersion] = useState(1);
    const [isBaseline, setIsBaseline] = useState(false);
    const [disruptionMode, setDisruptionMode] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [approving, setApproving] = useState(false);
    const [planPreview, setPlanPreview] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editableItems, setEditableItems] = useState([]);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [subjectsLoading, setSubjectsLoading] = useState(false);
    const [viewMode, setViewMode] = useState('YEAR'); // YEAR, MONTH
    const [showApproveModal, setShowApproveModal] = useState(false);

    useEffect(() => { fetchClasses(); }, []);

    useEffect(() => {
        if (selectedClassId) {
            setSelectedSubjectId(''); // Reset subject when class changes
            fetchSubjects(selectedClassId);
        } else {
            setSubjects([]);
            setSelectedSubjectId('');
        }
    }, [selectedClassId]);

    useEffect(() => {
        if (selectedClassId && selectedSubjectId) {
            fetchPlanStatus();
        }
    }, [selectedClassId, selectedSubjectId]);

    useEffect(() => {
        if (planStatus === 'APPROVED') {
            fetchDashboardSummary();
            fetchCalendarSummary();
        }
    }, [planStatus, viewDate]);

    const fetchClasses = async () => {
        try {
            const res = await axios.get('/api/academic/classes', { headers: { 'X-School-Id': schoolId } });
            setClasses(res.data || []);
            if (res.data.length > 0 && !selectedClassId) setSelectedClassId(res.data[0].id);
        } catch (err) { console.error("Failed to fetch classes", err); }
    };

    const fetchSubjects = async (classId) => {
        if (!classId) return;
        setSubjectsLoading(true);
        try {
            const res = await axios.get(`/api/academic/subjects?class_id=${classId}`, { headers: { 'X-School-Id': schoolId } });
            setSubjects(res.data || []);
            if (res.data.length > 0) {
                // Keep current if still valid, else pick first
                const exists = res.data.find(s => s.id === selectedSubjectId);
                if (!exists) setSelectedSubjectId(res.data[0].id);
            } else {
                setSelectedSubjectId('');
            }
        } catch (err) { 
            console.error("Failed to fetch subjects", err); 
            setSubjects([]);
        } finally {
            setSubjectsLoading(false);
        }
    };

    const fetchPlanStatus = async () => {
        try {
            const res = await axios.get(`/api/academic-planning/status?school_id=${schoolId}&academic_year_id=${academicYearId}&class_id=${selectedClassId}&subject_id=${selectedSubjectId}`);
            setPlanStatus(res.data.status || 'NONE');
            setPlanVersion(res.data.version || 1);
            setIsBaseline(res.data.is_baseline || false);
            if (res.data.status === 'GENERATED' && res.data.plan_id) {
                fetchPlanPreview(res.data.plan_id);
            }
        } catch (err) {
            console.error("Failed to fetch plan status", err);
            setPlanStatus('NONE');
        }
    };

    const fetchPlanPreview = async (planId) => {
        setPreviewLoading(true);
        try {
            const res = await axios.get(`/api/academic-planning/preview/${planId}`);
            setPlanPreview(res.data);
            
            // Fetch items for editing
            const planRes = await axios.get(`/api/academic-planning/${planId}`);
            setEditableItems(planRes.data.items || []);
        } catch (err) {
            console.error("Failed to fetch plan preview", err);
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleSaveEdit = async () => {
        if (!planPreview?.plan_id) return;
        
        // Safety check before sending update
        if (isBaseline || planStatus !== 'GENERATED') {
            alert(t("Safety Lock: Baseline plans cannot be modified."));
            setIsEditing(false);
            return;
        }

        try {
            await axios.post(`/api/academic-planning/${planPreview.plan_id}/update-items`, 
                editableItems.map(i => ({ id: i.id, planned_date: i.planned_date }))
            );
            setIsEditing(false);
            fetchPlanPreview(planPreview.plan_id);
            alert(t("Plan items updated successfully."));
        } catch (err) {
            console.error("Failed to update plan items", err);
            alert(t("Update failed. Please check date constraints."));
        }
    };

    const generateAcademicPlan = async () => {
        setGenerating(true);
        try {
            await axios.post('/api/academic-planning/generate', {
                school_id: schoolId,
                academic_year_id: academicYearId,
                class_id: selectedClassId,
                subject_id: selectedSubjectId,
                disruption_mode: disruptionMode
            });
            fetchPlanStatus();
        } catch (err) {
            console.error("Generation failed", err);
            alert("Failed to generate plan. Please check if syllabus and exams are configured.");
        } finally {
            setGenerating(false);
        }
    };

    const approveAcademicPlan = async () => {
        setApproving(true);
        try {
            const res = await axios.get(`/api/academic-planning/status?school_id=${schoolId}&academic_year_id=${academicYearId}&class_id=${selectedClassId}&subject_id=${selectedSubjectId}`);
            
            if (res.data.plan_id) {
                await axios.post('/api/academic-planning/approve', { plan_id: res.data.plan_id });
                setShowApproveModal(false);
                fetchPlanStatus();
            } else {
                alert("Plan ID not found. Please regenerate.");
            }
        } catch (err) { 
            console.error("Approval failed", err); 
            alert("Failed to approve plan.");
        } finally { 
            setApproving(false); 
        }
    };

    const fetchDashboardSummary = async () => {
        if (!selectedClassId || !academicYearId) return;
        try {
            const res = await axios.get(`/api/curriculum-orchestrator/dashboard-summary?class_id=${selectedClassId}&academic_year_id=${academicYearId}`);
            setDashboardSummary(res.data || []);
        } catch (err) { console.error("Failed to fetch summary", err); }
    };

    const fetchCalendarSummary = async () => {
        try {
            const month = (viewDate.getMonth() + 1).toString();
            const year = viewDate.getFullYear();
            const res = await axios.get(`/api/curriculum/calendar-summary?schoolId=${schoolId}&month=${month}&year=${year}`);
            setCalendarData(res.data || []);
        } catch (err) { console.error("Failed to fetch calendar summary", err); }
    };

    const fetchDailyMapping = async (dateStr) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/curriculum/daily-drilldown?schoolId=${schoolId}&date=${dateStr}`);
            setDailyMappings(res.data || []);
            setSelectedDate(dateStr);
        } catch (err) { console.error("Failed to fetch daily mapping", err); }
        finally { setLoading(false); }
    };

    const recalculatePlan = async () => {
        if (!selectedClassId || !academicYearId) return;
        setLoading(true);
        try {
            const plansRes = await axios.get(`/api/curriculum-orchestrator/dashboard-summary?class_id=${selectedClassId}&academic_year_id=${academicYearId}`);
            for (const p of plansRes.data) {
                if (p.plan_id) {
                    await axios.post(`/api/curriculum-orchestrator/recalculate`, { plan_id: p.plan_id });
                }
            }
            alert("Execution Plan Automatically Adjusted!");
            fetchCalendarSummary();
            fetchDashboardSummary();
        } catch (err) { console.error("Recalculation failed", err); }
        finally { setLoading(false); }
    };

    // ─── HELPER: Calendar generation ─────────────────────────────────────
    const generateCalendar = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(i);
        return days;
    };

    const getDayData = (day) => {
        if (!day) return null;
        const dateStr = `${viewDate.getFullYear()}-${(viewDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        return calendarData.find(d => d.date?.startsWith(dateStr));
    };

    const todayStr = new Date().toISOString().split('T')[0];

    // ─── HELPER: Determine calendar cell label (NO empty boxes) ──────────
    const getCellInfo = (day) => {
        if (!day) return { label: '', status: 'empty' };
        const dateObj = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        const dateStr = `${viewDate.getFullYear()}-${(viewDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const isSunday = dateObj.getDay() === 0;
        const isFuture = dateStr > todayStr;
        const data = getDayData(day);

        if (isSunday) return { label: '🚫 Holiday', status: 'holiday' };
        if (data) {
            if (data.missed > 0) return { label: `⚠ ${data.missed} missed`, status: 'missed', data };
            if (data.completed > 0 && data.pending === 0) return { label: `✔ ${data.completed} done`, status: 'completed', data };
            if (data.completed > 0 && data.pending > 0) return { label: `✔${data.completed} • ${data.pending}`, status: 'partial', data };
            if (data.pending > 0) return { label: `• ${data.pending} planned`, status: 'pending', data };
        }
        if (isFuture || dateStr === todayStr) return { label: '📭 No class scheduled', status: 'noclass' };
        return { label: '⚠ Data unavailable', status: 'nodata' };
    };

    // ─── HELPER: Generate ACTION suggestion (semi-specific) ──────────────
    const getActionSuggestion = (s) => {
        const suggestions = [];
        const isMissed = s.risk_status === 'MISSED_DEADLINE';
        
        if (s.remaining_days > 0) {
            const pace = s.remaining_topics / s.remaining_days;
            if (pace > 2) {
                suggestions.push({
                    type: 'danger',
                    icon: '🚨',
                    text: `Recovery not feasible without schedule adjustment (Required pace: ${pace.toFixed(1)} topics/day)`
                });
            } else {
                suggestions.push({
                    type: 'overload',
                    icon: '⚡',
                    text: `You need ${pace.toFixed(1)} session${pace > 1 ? 's' : ''} today to complete syllabus on time`
                });
            }
        } else if (s.remaining_topics > 0) {
            suggestions.push({
                type: 'danger',
                icon: '🚨',
                text: isMissed ? "Deadline Missed. Use Recovery Plan below to reschedule." : "Complete in next available session"
            });
        }

        if (s.delayed_topics > 0 && !isMissed) {
            suggestions.push({
                type: 'backlog',
                icon: '🔁',
                text: `Clear ${s.delayed_topics} overdue topic${s.delayed_topics > 1 ? 's' : ''} by adding extra sessions this week`
            });
        }
        
        if (suggestions.length === 0) {
            suggestions.push({ type: 'ok', icon: '✅', text: 'On track — no action needed' });
        }
        return suggestions;
    };

    // ─── HELPER: Urgency line ────────────────────────────────────────────
    const getUrgencyLine = (s) => {
        if (s.risk_status === 'MISSED_DEADLINE') {
            return `🔴 MISSED DEADLINE: ${s.remaining_topics} topic${s.remaining_topics > 1 ? 's' : ''} uncompleted after planned duration`;
        }
        if (s.remaining_topics > s.remaining_days && s.remaining_days > 0) {
            const projectedDelay = s.remaining_topics - s.remaining_days;
            return `At current pace, syllabus will be delayed by ~${projectedDelay} days`;
        }
        return null;
    };

    // ─── HELPER: Right panel — find "next scheduled" from calendarData ───
    const getNextScheduledInfo = () => {
        // From dashboardSummary, find the earliest next_scheduled_date
        const nextDates = dashboardSummary
            .filter(s => s.next_scheduled_date)
            .sort((a, b) => a.next_scheduled_date.localeCompare(b.next_scheduled_date));
        if (nextDates.length > 0) {
            const s = nextDates[0];
            const d = new Date(s.next_scheduled_date);
            return {
                date: d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }),
                subject: s.subject_name,
                raw: s.next_scheduled_date
            };
        }
        return null;
    };

    // ─── HELPER: Total backlog across all subjects ───────────────────────
    const totalBacklog = dashboardSummary.reduce((sum, s) => sum + (s.delayed_topics || 0), 0);

    const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

    // ─────────────────────────────────── RENDER ──────────────────────────
    return (
        <div className="page-content">
            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="page-header">
                <div>
                    <h2>📅 {isTeacher ? t("My Teaching Calendar") : t("Curriculum Intelligence Calendar")}</h2>
                    <p>{t("Visualize and manage lesson distribution across the academic year")}</p>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <select
                        className="form-control"
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        style={{ width: 140, padding: '8px 12px', borderRadius: 8 }}
                    >
                        <option value="">{t("Select Class")}</option>
                        {classes.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.class_name || `Class ${c.grade_level}`} {!c.has_syllabus && `(${t("No Syllabus")})`}
                            </option>
                        ))}
                    </select>
                    <select
                        className="form-control"
                        value={selectedSubjectId}
                        onChange={(e) => setSelectedSubjectId(e.target.value)}
                        disabled={!selectedClassId || subjectsLoading}
                        style={{ width: 160, padding: '8px 12px', borderRadius: 8, opacity: !selectedClassId ? 0.6 : 1 }}
                    >
                        <option value="">{subjectsLoading ? t("Loading...") : t("Select Subject")}</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name || s.subject_name}</option>)}
                    </select>

                    {planStatus !== 'NONE' && (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 12 }}>
                            <span className={`badge badge-${planStatus.toLowerCase()}`} style={{ 
                                padding: '6px 12px', 
                                borderRadius: 20, 
                                fontSize: 12, 
                                fontWeight: 700,
                                backgroundColor: planStatus === 'APPROVED' ? 'var(--success-bg)' : 'var(--warning-bg)',
                                color: planStatus === 'APPROVED' ? 'var(--success)' : 'var(--warning)',
                                border: `1px solid ${planStatus === 'APPROVED' ? 'var(--success)' : 'var(--warning)'}`
                            }}>
                                {planStatus} {isBaseline && '• BASELINE'}
                            </span>
                            <span style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}>
                                v{planVersion}
                            </span>
                        </div>
                    )}

                    {!isTeacher && planStatus === 'APPROVED' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 12, padding: '4px 12px', backgroundColor: disruptionMode ? '#fff5f5' : '#f8f9fa', borderRadius: 8, border: `1px solid ${disruptionMode ? 'var(--danger)' : '#ddd'}` }}>
                            <label style={{ fontSize: 11, fontWeight: 700, color: disruptionMode ? 'var(--danger)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                                <input 
                                    type="checkbox" 
                                    checked={disruptionMode} 
                                    onChange={(e) => setDisruptionMode(e.target.checked)} 
                                />
                                {t("Disruption Mode")}
                            </label>
                        </div>
                    )}
                    <button className="btn btn-secondary" onClick={handlePrevMonth}>&lt;</button>
                    <span style={{ fontWeight: 600, minWidth: 120, textAlign: 'center' }}>
                        {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button className="btn btn-secondary" onClick={handleNextMonth}>&gt;</button>
                    
                    <div className="view-toggle" style={{ display: 'flex', backgroundColor: '#eee', borderRadius: 8, padding: 3, marginLeft: 12 }}>
                        <button 
                            className={`btn btn-sm ${viewMode === 'YEAR' ? 'selected-toggle' : ''}`}
                            onClick={() => setViewMode('YEAR')}
                            style={{ 
                                padding: '4px 12px', 
                                fontSize: 11, 
                                fontWeight: 700,
                                borderRadius: 6,
                                border: 'none',
                                backgroundColor: viewMode === 'YEAR' ? '#fff' : 'transparent',
                                boxShadow: viewMode === 'YEAR' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                                color: viewMode === 'YEAR' ? 'var(--primary)' : 'var(--text-muted)',
                                cursor: 'pointer'
                            }}
                        >
                            {t("Year View")}
                        </button>
                        <button 
                            className={`btn btn-sm ${viewMode === 'MONTH' ? 'selected-toggle' : ''}`}
                            onClick={() => setViewMode('MONTH')}
                            style={{ 
                                padding: '4px 12px', 
                                fontSize: 11, 
                                fontWeight: 700,
                                borderRadius: 6,
                                border: 'none',
                                backgroundColor: viewMode === 'MONTH' ? '#fff' : 'transparent',
                                boxShadow: viewMode === 'MONTH' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                                color: viewMode === 'MONTH' ? 'var(--primary)' : 'var(--text-muted)',
                                cursor: 'pointer'
                            }}
                        >
                            {t("Month View")}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── State Handling UI ──────────────────────────────────── */}
            {planStatus === 'NONE' && (
                <div className="card empty-state" style={{ textAlign: 'center', padding: '60px 20px', margin: '20px 0' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🗓️</div>
                    
                    {selectedClassId && subjects.length === 0 && !subjectsLoading ? (
                        <>
                            <h3>{t("No curriculum configured")}</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
                                {t("Please add syllabus for this class to start planning.")}
                            </p>
                        </>
                    ) : (
                        <>
                            <h3>{t("No academic plan found")}</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
                                {t("You haven't generated an academic plan for this subject yet. Start by generating a syllabus distribution.")}
                            </p>
                            <button 
                                className="btn btn-primary" 
                                onClick={generateAcademicPlan}
                                disabled={generating || !selectedClassId || !selectedSubjectId}
                            >
                                {generating ? t("Generating plan...") : t("Generate Academic Plan")}
                            </button>
                        </>
                    )}
                </div>
            )}

            {planStatus === 'GENERATED' && (
                <div className="card plan-preview-container" style={{ margin: '20px 0', border: '1px solid var(--accent)', padding: 0, overflow: 'hidden' }}>
                    <div style={{ backgroundColor: 'var(--accent-light)', padding: '16px 20px', borderBottom: '1px solid var(--accent)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: 18 }}>{t("Academic Plan Preview")} <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>v{planVersion}</span></h3>
                            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>{t("Review the generated syllabus distribution before locking it as baseline.")}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button className="btn btn-primary" onClick={() => setShowApproveModal(true)} disabled={approving}>
                                {approving ? t("Locking...") : t("Approve & Lock Baseline")}
                            </button>
                            {!isBaseline && (
                                <button className="btn btn-secondary" onClick={() => setIsEditing(!isEditing)}>
                                    {isEditing ? t("Cancel Editing") : t("Edit Distribution")}
                                </button>
                            )}
                            <button className="btn btn-outline" onClick={generateAcademicPlan} disabled={generating}>
                                {t("Regenerate")}
                            </button>
                        </div>
                    </div>

                    {previewLoading ? (
                        <div style={{ padding: 60, textAlign: 'center' }}>
                            <div className="spinner"></div>
                            <p>{t("Calculating distribution analysis...")}</p>
                        </div>
                    ) : (
                        <div style={{ padding: 24 }}>
                            {/* Summary Strip */}
                            <div className="preview-summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 30 }}>
                                <div className="preview-stat-card" style={{ padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t("Total Topics")}</div>
                                    <div style={{ fontSize: 20, fontWeight: 800 }}>{planPreview?.total_topics}</div>
                                </div>
                                <div className="preview-stat-card" style={{ padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t("Allocation")}</div>
                                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--success)' }}>{planPreview?.allocated_topics} / {planPreview?.total_topics}</div>
                                </div>
                                <div className="preview-stat-card" style={{ padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t("Buffer Days")}</div>
                                    <div style={{ fontSize: 20, fontWeight: 800, color: planPreview?.buffer_days < 7 ? 'var(--danger)' : 'var(--primary)' }}>
                                        {planPreview?.buffer_days} {t("days")}
                                    </div>
                                </div>
                                <div className="preview-stat-card" style={{ padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t("Alignment")}</div>
                                    <div style={{ fontSize: 14, fontWeight: 800 }}>
                                        <span className={`badge badge-${planPreview?.exam_alignment_status?.toLowerCase()}`} style={{ padding: '4px 8px' }}>
                                            {planPreview?.exam_alignment_status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                {/* Monthly Distribution OR Editable List */}
                                <div style={{ gridColumn: isEditing ? '1 / span 2' : 'span 1' }}>
                                    {isEditing ? (
                                        <div className="editable-items-list" style={{ border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
                                            <div style={{ backgroundColor: '#f8f9fa', padding: '10px 16px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ fontWeight: 700, fontSize: 13 }}>{t("Edit Planned Dates")}</span>
                                                <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: 12 }} onClick={handleSaveEdit}>
                                                    {t("Save Changes")}
                                                </button>
                                            </div>
                                            <div style={{ maxHeight: 400, overflowY: 'auto', padding: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                                                {editableItems.map((item, idx) => (
                                                    <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 8, border: '1px solid #eee', borderRadius: 4 }}>
                                                        <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>{t("TOPIC")} {item.topic_index}</label>
                                                        <input 
                                                            type="date" 
                                                            value={item.planned_date}
                                                            onChange={(e) => {
                                                                const newItems = [...editableItems];
                                                                newItems[idx].planned_date = e.target.value;
                                                                setEditableItems(newItems);
                                                            }}
                                                            style={{ border: '1px solid #ddd', borderRadius: 4, padding: '4px 8px', fontSize: 12 }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <h4 style={{ fontSize: 13, marginBottom: 12 }}>{t("Monthly Distribution")}</h4>
                                            <div className="month-grid" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                {planPreview?.monthly_distribution?.map((m, idx) => (
                                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#f9f9f9', borderRadius: 6 }}>
                                                        <span style={{ fontWeight: 600, fontSize: 13 }}>{m.month}</span>
                                                        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{m.topic_count} {t("topics")}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>

                                {!isEditing && (
                                    <>
                                    {/* Weekly Preview (First 4 Weeks) */}
                                    <div>
                                        <h4 style={{ fontSize: 13, marginBottom: 12 }}>{t("Weekly Sneak Peek")}</h4>
                                        <div className="week-grid" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                            {planPreview?.weekly_preview?.map((w, idx) => (
                                                <div key={idx} style={{ padding: '10px 14px', border: '1px solid #eee', borderRadius: 6 }}>
                                                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>{t("WEEK")} {w.week}</div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                        {w.topics.map((t, tidx) => (
                                                            <span key={tidx} style={{ fontSize: 11, padding: '2px 8px', backgroundColor: 'var(--accent-light)', borderRadius: 4, color: 'var(--accent)' }}>{t}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    </>
                                )}
                            </div>

                            {/* Pacing Indicator */}
                            {planPreview?.pacing && (
                                <div style={{ 
                                    marginTop: 24, 
                                    padding: '16px 20px', 
                                    borderRadius: 12, 
                                    backgroundColor: planPreview.pacing === 'RISKY' ? '#fff5f5' : planPreview.pacing === 'AGGRESSIVE' ? '#fffaf0' : '#f0f9ff', 
                                    border: `1px solid ${planPreview.pacing === 'RISKY' ? 'var(--danger)' : planPreview.pacing === 'AGGRESSIVE' ? 'var(--warning)' : 'var(--primary)'}` 
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <span style={{ fontSize: 24 }}>{planPreview.pacing === 'RISKY' ? '🚨' : planPreview.pacing === 'AGGRESSIVE' ? '⚡' : '🚀'}</span>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: 14 }}>{t("Pacing Strategy")}: {planPreview.pacing}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                                {planPreview.pacing === 'RISKY' 
                                                    ? t("The current allocation is very tight. High risk of missing deadlines. Consider extra sessions.") 
                                                    : planPreview.pacing === 'AGGRESSIVE'
                                                    ? t("Dense topic distribution detected. Ensure teacher availability for high-load weeks.")
                                                    : t("The distribution is well-paced with sufficient buffer for unexpected holidays.")}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {planStatus === 'INFEASIBLE' && (
                <div className="card empty-state" style={{ textAlign: 'center', padding: '60px 20px', margin: '20px 0', border: '2px solid var(--danger)' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🚨</div>
                    <h3 style={{ color: 'var(--danger)' }}>{t("Plan Infeasible")}</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
                        {t("Insufficient teaching days found to complete the syllabus before exams.")}<br/>
                        {t("Action: Adjust academic calendar, reduce syllabus load, or increase sessions per day.")}
                    </p>
                    <button 
                        className="btn btn-primary" 
                        onClick={generateAcademicPlan}
                        disabled={generating}
                    >
                        {t("Try Regenerating")}
                    </button>
                </div>
            )}

            {planStatus === 'APPROVED' && (
                <>
                {/* Existing Summary Strip */}
            <div className="summary-strip scroll-hide" style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16 }}>
                {dashboardSummary.map((s, idx) => (
                    <div key={idx} className={`card summary-pill ${s.risk_status?.toLowerCase() || 'on_track'}`}
                         style={{ minWidth: 260, flexShrink: 0, padding: 0 }}>
                        {/* WHAT: Subject + completion */}
                        <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 700 }}>{s.subject_name}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.completion_percentage}% {t("Complete")}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div className={`badge ${s.risk_status?.toLowerCase() || 'on_track'}`} style={{ fontSize: 9 }}>{t(s.risk_status || 'ON_TRACK')}</div>
                                {s.delay_days > 0 && <div style={{ fontSize: 10, color: 'var(--danger)', marginTop: 4 }}>{s.delay_days}d {t("delay")}</div>}
                            </div>
                        </div>

                        {/* WHY: Metrics breakdown */}
                        <div style={{ padding: '0 16px 8px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, borderTop: '1px solid var(--border)' }}>
                            <div className="ci-metric">
                                <span className="ci-metric-val">{s.remaining_topics ?? '—'}</span>
                                <span className="ci-metric-lbl">{t("Remaining")}</span>
                            </div>
                            <div className="ci-metric">
                                <span className="ci-metric-val">{s.remaining_days ?? '—'}</span>
                                <span className="ci-metric-lbl">{t("Days Left")}</span>
                            </div>
                            <div className="ci-metric">
                                <span className="ci-metric-val" style={{ color: s.delayed_topics > 0 ? 'var(--danger)' : 'inherit' }}>{s.delayed_topics ?? 0}</span>
                                <span className="ci-metric-lbl">{t("Overdue")}</span>
                            </div>
                        </div>

                        {/* ACTION: Rule-based suggestion */}
                        <div style={{ padding: '6px 16px 12px', borderTop: '1px solid var(--border)' }}>
                            {getActionSuggestion(s).map((a, ai) => (
                                <div key={ai} className={`ci-action ci-action-${a.type}`}>
                                    <span>{a.icon}</span> <span>{a.text}</span>
                                </div>
                            ))}
                            {/* URGENCY LINE */}
                            {getUrgencyLine(s) && (
                                <div className="ci-urgency">⏳ {getUrgencyLine(s)}</div>
                            )}
                        </div>
                    </div>
                ))}
                {!isTeacher && (
                    <div style={{ minWidth: 260, flexShrink: 0, padding: '12px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', border: `2px dashed ${disruptionMode ? 'var(--danger)' : '#ddd'}`, borderRadius: 12, backgroundColor: disruptionMode ? '#fff5f5' : 'transparent', textAlign: 'center' }}>
                        <div style={{ fontSize: 20, marginBottom: 8 }}>{disruptionMode ? '🚨' : '🔒'}</div>
                        <button 
                            className="btn btn-secondary" 
                            onClick={generateAcademicPlan}
                            disabled={generating || !disruptionMode}
                            style={{ width: '100%', fontSize: 13, fontWeight: 700 }}
                        >
                            {generating ? t("Regenerating...") : t("Regenerate Baseline")}
                        </button>
                        {!disruptionMode && (
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8 }}>
                                {t("Baseline is locked for the year.")}<br/>
                                {t("Enable Disruption Mode to override.")}
                            </div>
                        )}
                    </div>
                )}
                {dashboardSummary.length === 0 && (
                    <div className="card" style={{ padding: 16, minWidth: 260, color: 'var(--text-muted)', fontSize: 13 }}>
                        No active curriculum tracking found for this subject.
                    </div>
                )}
            </div>

            {/* ── Calendar Grid (Conditional) ────────────────────────── */}
            {viewMode === 'YEAR' && planPreview?.monthly_distribution_full_year ? (
                <div className="card" style={{ padding: 24, marginBottom: 24 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                        {planPreview.monthly_distribution_full_year.map((m, idx) => {
                            const density = m.topic_count <= 3 ? 'LOW' : m.topic_count <= 6 ? 'MEDIUM' : 'HIGH';
                            const densityColor = m.topic_count === 0 ? '#f8f9fa' : density === 'LOW' ? '#e6fffa' : density === 'MEDIUM' ? '#fffaf0' : '#fff5f5';
                            const borderColor = m.topic_count === 0 ? '#eee' : density === 'LOW' ? '#38b2ac' : density === 'MEDIUM' ? '#ed8936' : '#f56565';
                            
                            return (
                                <div 
                                    key={idx} 
                                    onClick={() => {
                                        const [monthName, yearStr] = m.month.split(' ');
                                        const monthIdx = new Date(`${monthName} 1, ${yearStr}`).getMonth();
                                        setViewDate(new Date(parseInt(yearStr), monthIdx, 1));
                                        setViewMode('MONTH');
                                    }}
                                    style={{ 
                                        padding: 16, 
                                        borderRadius: 12, 
                                        backgroundColor: densityColor, 
                                        border: `1px solid ${borderColor}`,
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s',
                                        position: 'relative'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{m.month}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: 18, fontWeight: 800 }}>{m.topic_count}</span>
                                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.05)' }}>
                                            {density}
                                        </span>
                                    </div>
                                    {/* Visual Density Bar */}
                                    <div style={{ height: 4, width: '100%', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 2, marginTop: 12, overflow: 'hidden' }}>
                                        <div style={{ 
                                            height: '100%', 
                                            width: `${Math.min(100, (m.topic_count / 10) * 100)}%`, 
                                            backgroundColor: borderColor 
                                        }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: selectedDate ? '1fr 380px' : '1fr', gap: 24, transition: 'all 0.3s ease', marginBottom: 24 }}>
                    <div className="card" style={{ padding: 20 }}>
                        <div className="calendar-grid">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                <div key={d} style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)', fontSize: 12, paddingBottom: 12 }}>{t(d)}</div>
                            ))}
                            {generateCalendar().map((day, i) => {
                                const info = getCellInfo(day);
                                const dateStr = day ? `${viewDate.getFullYear()}-${(viewDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}` : null;
                                const isToday = dateStr === todayStr;
                                const isSelected = selectedDate === dateStr;

                                return (
                                    <div
                                        key={i}
                                        onClick={() => day && info.status !== 'holiday' && fetchDailyMapping(dateStr)}
                                        className={`calendar-cell ${!day ? 'empty' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} status-${info.status}`}
                                    >
                                        {day && (
                                            <>
                                                <span className="day-num">{day}</span>
                                                <div className="day-label">{info.label}</div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                            </div>
                        </div>

                {/* ── Right Panel ─────────────────────────────────────── */}
                {selectedDate && (
                    <div className="card slide-in" style={{ padding: 24, background: 'var(--bg-secondary)', borderLeft: '4px solid var(--accent)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                            <h3>{new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}</h3>
                            <button className="btn-close" onClick={() => setSelectedDate(null)}>×</button>
                        </div>

                        {loading ? (
                            <div className="skeleton-loader" style={{ height: 200 }} />
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {/* ── PRIORITY 1: Missed items + Impact ─── */}
                                {dailyMappings.filter(m => m.status === 'MISSED').length > 0 && (
                                    <>
                                        <div className="ci-section-header" style={{ color: 'var(--danger)' }}>⚠ {t("Missed Today")}</div>
                                        {dailyMappings.filter(m => m.status === 'MISSED').map((m, idx) => (
                                            <div key={`missed-${idx}`} className="mapping-item card missed">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div>
                                                        <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>{m.subject?.name}</div>
                                                        <div style={{ fontWeight: 600, fontSize: 14, margin: '4px 0' }}>{m.topic}</div>
                                                    </div>
                                                    <span className="badge missed">{t("MISSED")}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {/* IMPACT MESSAGE */}
                                        <div className="ci-impact">
                                            ⚠ Backlog increased by {dailyMappings.filter(m => m.status === 'MISSED').length} topic{dailyMappings.filter(m => m.status === 'MISSED').length > 1 ? 's' : ''}.
                                            {totalBacklog > 0 && <span> Total backlog: <strong>{totalBacklog} topics</strong></span>}
                                        </div>
                                        {/* Recovery suggestion */}
                                        <div className="ci-action ci-action-backlog" style={{marginTop: 4}}>
                                            🔁 Schedule make-up sessions this week to recover missed ground
                                        </div>
                                    </>
                                )}

                                {/* ── PRIORITY 2: Planned / Completed items ─── */}
                                {dailyMappings.filter(m => m.status !== 'MISSED').length > 0 && (
                                    <>
                                        <div className="ci-section-header" style={{ color: 'var(--accent)' }}>
                                            {dailyMappings.some(m => m.status === 'COMPLETED') ? '✔' : '•'} {t("Planned Today")}
                                        </div>
                                        {dailyMappings.filter(m => m.status !== 'MISSED').map((m, idx) => (
                                            <div key={`planned-${idx}`} className={`mapping-item card ${m.status.toLowerCase()}`}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div>
                                                        <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>{m.subject?.name}</div>
                                                        <div style={{ fontWeight: 600, fontSize: 14, margin: '4px 0' }}>{m.topic}</div>
                                                    </div>
                                                    <span className={`badge ${m.status.toLowerCase()}`}>{t(m.status)}</span>
                                                </div>
                                            </div>
                                        ))}

                                        {/* IMPACT BLOCK */}
                                        <div className="ImpactBlock" style={{ marginTop: 16, padding: 16, border: '1px solid var(--border)', borderRadius: 12, background: 'rgba(239, 68, 68, 0.03)' }}>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--danger)', marginBottom: 8 }}>Impact of Non-Completion Today</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                                                <div>→ Backlog: <strong>{totalBacklog} → {totalBacklog + dailyMappings.filter(m => m.status !== 'COMPLETED').length} topics</strong></div>
                                                <div>→ Syllabus Delay: <strong>+{dailyMappings.filter(m => m.status !== 'COMPLETED').length} day(s)</strong></div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* ── RECOVERY PLAN (Only if Delayed/Missed) ── */}
                                {dashboardSummary.some(s => s.risk_status === 'MISSED_DEADLINE' || s.delayed_topics > 0) && (
                                    <div className="RecoveryPlan" style={{ marginTop: 20, padding: 16, border: '1px solid var(--success)', borderRadius: 12, background: 'rgba(16, 185, 129, 0.03)' }}>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--success)', marginBottom: 12 }}>⚡ Recovery Plan</div>
                                        {dashboardSummary.filter(s => s.risk_status === 'MISSED_DEADLINE' || s.delayed_topics > 0).map((s, idx) => {
                                            const totalToRecover = s.delayed_topics + (s.risk_status === 'MISSED_DEADLINE' ? s.remaining_topics : 0);
                                            const nextDate = s.next_scheduled_date ? new Date(s.next_scheduled_date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }) : 'TBD';
                                            const estDays = Math.ceil(totalToRecover / 1); // Assume 1 topic/day extra
                                            return (
                                                <div key={`rec-${idx}`} style={{ fontSize: 12, marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                                    <div style={{ fontWeight: 600 }}>{s.subject_name}</div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
                                                        <div>• Next session: <strong>{nextDate}</strong></div>
                                                        <div>• Extra topics: <strong>+1/session</strong></div>
                                                        <div>• Est. Recovery: <strong>{estDays} sessions</strong></div>
                                                        <div>• Completion: <strong>{nextDate}</strong></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* ── PRIORITY 3: No mappings → Next scheduled ─── */}
                                {dailyMappings.length === 0 && (
                                    <>
                                        <div className="ci-section-header" style={{ color: 'var(--text-muted)' }}>📭 {t("No lessons scheduled for this day")}</div>
                                        {(() => {
                                            const next = getNextScheduledInfo();
                                            if (next) return (
                                                <div className="card" style={{ padding: 12, background: 'rgba(59,130,246,0.04)', border: '1px solid var(--border)' }}>
                                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Next scheduled class</div>
                                                    <div style={{ fontWeight: 600, fontSize: 14 }}>{next.subject} — {next.date}</div>
                                                </div>
                                            );
                                            return (
                                                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                                    No upcoming classes found. Generate a plan using "Recalculate AI Plan".
                                                </div>
                                            );
                                        })()}
                                        {/* Recovery suggestion if backlog exists */}
                                        {totalBacklog > 0 && (
                                            <div className="ci-action ci-action-backlog" style={{marginTop: 8}}>
                                                🔁 {totalBacklog} topic{totalBacklog > 1 ? 's' : ''} overdue across subjects — consider using this free day for catch-up
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
            )}
            </>
            )}

                {showApproveModal && (
                    <div className="modal-overlay" style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                        backdropFilter: 'blur(4px)'
                    }}>
                        <div className="card" style={{ width: 450, padding: 32, textAlign: 'center' }}>
                            <div style={{ fontSize: 48, marginBottom: 20 }}>🏗️</div>
                            <h3 style={{ marginBottom: 12 }}>{t("Approve Academic Baseline?")}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
                                {t("You are approving this plan as the ")} <strong>{t("Academic Baseline")}</strong> {t(" for tracking. Once approved, the topic sequence and dates will be locked.")}
                                <br/><br/>
                                <span style={{ color: 'var(--danger)', fontWeight: 700 }}>{t("This serves as the official contract for academic execution.")}</span>
                            </p>
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                                <button className="btn btn-primary" onClick={approveAcademicPlan} disabled={approving} style={{ padding: '10px 24px' }}>
                                    {approving ? t("Approving...") : t("Confirm & Lock Baseline")}
                                </button>
                                <button className="btn btn-secondary" onClick={() => setShowApproveModal(false)} style={{ padding: '10px 24px' }}>
                                    {t("Cancel")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Styles ─────────────────────────────────────────────── */}
            <style>{`
                .modal-overlay { animation: fadeIn 0.2s ease-out; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .calendar-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 6px;
                }
                .calendar-cell {
                    min-height: 72px;
                    border: 1px solid var(--border);
                    border-radius: var(--radius-sm);
                    padding: 6px 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }
                .calendar-cell:hover:not(.empty):not(.status-holiday) {
                    background: var(--bg-primary);
                    border-color: var(--accent);
                    transform: translateY(-1px);
                }
                .calendar-cell.empty { border: none; cursor: default; min-height: 0; }
                .calendar-cell.today { border-color: var(--accent); background: rgba(59, 130, 246, 0.06); box-shadow: inset 0 0 0 1px var(--accent); }
                .calendar-cell.selected { background: var(--accent) !important; color: white !important; }
                .calendar-cell.selected .day-label { color: rgba(255,255,255,0.85) !important; }
                .calendar-cell.status-holiday { background: rgba(100,100,100,0.04); border-style: dashed; cursor: default; opacity: 0.6; }
                .calendar-cell.status-missed { background: rgba(239, 68, 68, 0.08); border-color: var(--danger); }
                .calendar-cell.status-completed { background: rgba(16, 185, 129, 0.08); border-color: var(--success); }
                .calendar-cell.status-pending { background: rgba(245, 158, 11, 0.05); }
                .calendar-cell.status-partial { background: rgba(59, 130, 246, 0.05); border-color: var(--accent); }
                .calendar-cell.status-noclass { background: var(--bg-primary); opacity: 0.7; }
                .calendar-cell.status-nodata { background: var(--bg-primary); opacity: 0.5; border-style: dotted; }
                .day-num { font-size: 13px; font-weight: 600; }
                .day-label { font-size: 9px; font-weight: 600; margin-top: 2px; color: var(--text-muted); line-height: 1.2; }
                .status-missed .day-label { color: var(--danger); }
                .status-completed .day-label { color: var(--success); }

                .summary-pill { border-top: 3px solid var(--border); }
                .summary-pill.on_track { border-top-color: var(--success); }
                .summary-pill.at_risk { border-top-color: var(--warning); }
                .summary-pill.delayed { border-top-color: var(--danger); }
                .summary-pill.missed_deadline { border-top-color: #ff0000; box-shadow: 0 4px 12px rgba(255,0,0,0.15); }

                .badge { padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
                .badge.on_track { background: var(--success); color: white; }
                .badge.at_risk { background: var(--warning); color: white; }
                .badge.delayed { background: var(--danger); color: white; }
                .badge.missed_deadline { background: #ff0000; color: white; }
                .badge.missed { background: var(--danger); color: white; }
                .badge.completed { background: var(--success); color: white; }
                .badge.pending { background: var(--text-muted); color: white; }

                .mapping-item { border-left: 3px solid var(--border); padding: 10px 12px !important; }
                .mapping-item.missed { border-left-color: var(--danger); }
                .mapping-item.completed { border-left-color: var(--success); }
                .mapping-item.pending { border-left-color: var(--text-muted); }

                .ci-metric { display: flex; flex-direction: column; align-items: center; padding: 8px 0 4px; }
                .ci-metric-val { font-size: 18px; font-weight: 700; line-height: 1; }
                .ci-metric-lbl { font-size: 9px; color: var(--text-muted); margin-top: 2px; text-transform: uppercase; letter-spacing: 0.5px; }

                .ci-action { font-size: 11px; line-height: 1.4; padding: 6px 8px; border-radius: 6px; display: flex; gap: 6px; align-items: flex-start; }
                .ci-action-overload { background: rgba(245, 158, 11, 0.08); color: var(--warning); }
                .ci-action-danger { background: rgba(239, 68, 68, 0.1); color: #ff0000; font-weight: 600; }
                .ci-action-backlog { background: rgba(239, 68, 68, 0.06); color: var(--danger); }
                .ci-action-ok { background: rgba(16, 185, 129, 0.06); color: var(--success); }

                .ci-urgency { font-size: 10px; color: var(--danger); font-weight: 600; margin-top: 4px; padding: 4px 8px; background: rgba(239,68,68,0.04); border-radius: 4px; }

                .ci-impact { font-size: 12px; padding: 10px 12px; background: rgba(239,68,68,0.06); border: 1px dashed var(--danger); border-radius: 8px; color: var(--danger); font-weight: 500; }

                .ci-section-header { font-size: 13px; font-weight: 700; margin-bottom: 4px; }

                .scroll-hide::-webkit-scrollbar { display: none; }
                .scroll-hide { -ms-overflow-style: none; scrollbar-width: none; }
                .slide-in { animation: slideIn 0.3s ease-out; }
                @keyframes slideIn {
                    from { transform: translateX(20px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .btn-close { background: none; border: none; font-size: 24px; color: var(--text-muted); cursor: pointer; }
            `}</style>
        </div>
    );
}
