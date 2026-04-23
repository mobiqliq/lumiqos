import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SchoolSettings = () => {
  const [activeTab, setActiveTab] = useState('schedule'); // 'schedule' or 'assignments'
  
  // Schedule State
  const [periods, setPeriods] = useState([
    { label: 'Period 1', startTime: '08:00', endTime: '08:45', type: 'period' },
    { label: 'Period 2', startTime: '08:45', endTime: '09:30', type: 'period' },
    { label: 'Break', startTime: '09:30', endTime: '09:45', type: 'break' },
    { label: 'Period 3', startTime: '09:45', endTime: '10:30', type: 'period' },
  ]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Assignments State
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  
  const [newAssignment, setNewAssignment] = useState({
    teacher_id: '',
    subject_id: '',
    class_id: '',
    section_id: '',
    periods_per_day: 1
  });

  // Handover State
  const [handoverForm, setHandoverForm] = useState({
    from_teacher_id: '',
    to_teacher_id: '',
    class_id: '',
    section_id: '',
    subject_id: ''
  });
  const [handoverReport, setHandoverReport] = useState(null);

  // --- Onboarding Tab State ---
  const [onboardingForm, setOnboardingForm] = useState({
      board: 'CBSE',
      year_id: 'AYMAX-001'
  });
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchSummary, setLaunchSummary] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:3000/api/periods-config');
        if (res.data && res.data.config) {
          setPeriods(res.data.config);
        }
      } catch (err) {
        console.error('Failed to fetch period config', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
    fetchAssignmentData();
  }, []);

  const schoolId = localStorage.getItem('schoolId') || 'f2efb39f-304b-4841-8faf-7bda14454aac';

  const fetchAssignmentData = async () => {
    try {
      const headers = { 'X-School-Id': schoolId, 'Authorization': `Bearer ${localStorage.getItem('school_token') || ''}` };
      const [assnRes, tRes, sRes, cRes, secRes] = await Promise.all([
        axios.get('/api/academic/teacher-subjects', { headers }),
        axios.get('/api/users/teachers', { headers }),
        axios.get('/api/academic/subjects', { headers }), // We might need to handle this per class if subjects are class-specific, but fetch all for now
        axios.get('/api/academic/classes', { headers }),
        axios.get('/api/academic/sections', { headers })
      ]);
      setAssignments(assnRes.data || []);
      setTeachers(tRes.data || []);
      setSubjects(sRes.data || []);
      setClasses(cRes.data || []);
      setSections(secRes.data || []);
    } catch (err) {
      console.error('Failed to fetch assignment data', err);
    }
  };

  const handleAddAssignment = async () => {
    try {
      setSaving(true);
      const headers = { 'X-School-Id': schoolId, 'Authorization': `Bearer ${localStorage.getItem('school_token') || ''}` };
      await axios.post('/api/academic/assign-teacher', newAssignment, { headers });
      setMessage({ type: 'success', text: 'Assignment added successfully!' });
      fetchAssignmentData();
      setNewAssignment({ teacher_id: '', subject_id: '', class_id: '', section_id: '', periods_per_day: 1 });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to add assignment.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAssignment = async (id) => {
    try {
      const headers = { 'X-School-Id': schoolId, 'Authorization': `Bearer ${localStorage.getItem('school_token') || ''}` };
      await axios.delete(`http://localhost:3001/api/academic/teacher-subjects/${id}`, { headers });
      setAssignments(assignments.filter(a => a.id !== id));
      setMessage({ type: 'success', text: 'Assignment removed' });
    } catch (error) {
      console.error('Error removing assignment:', error);
      setMessage({ type: 'error', text: 'Failed to remove assignment' });
    }
  };

  const handleAdd = () => {
    const last = periods[periods.length - 1];
    const nextStart = last ? last.endTime : '08:00';
    const [h, m] = nextStart.split(':').map(Number);
    const endH = m + 45 >= 60 ? h + 1 : h;
    const endM = (m + 45) % 60;
    const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
    
    setPeriods([...periods, { label: `Period ${periods.filter(p => p.type === 'period').length + 1}`, startTime: nextStart, endTime, type: 'period' }]);
  };

  const handleRemove = (index) => {
    setPeriods(periods.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, value) => {
    const next = [...periods];
    next[index][field] = value;
    setPeriods(next);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await axios.post('http://localhost:3000/api/periods-config', { config: periods });
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleExecuteHandover = async () => {
    setSaving(true);
    setMessage(null);
    setHandoverReport(null);
    try {
      const headers = { 'X-School-Id': schoolId, 'Authorization': `Bearer ${localStorage.getItem('school_token') || ''}` };
      const res = await axios.post(`http://localhost:3001/api/academic/execute-handover`, handoverForm, { headers });
      setHandoverReport(res.data);
      setMessage({ type: 'success', text: res.data.message });
      // Refresh assignments
      const assnRes = await axios.get(`/api/academic/teacher-subjects`, { headers });
      setAssignments(assnRes.data);
    } catch (error) {
      console.error('Error executing handover:', error);
      setMessage({ type: 'error', text: 'Failed to execute handover' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text)', margin: 0 }}>School Operational Settings</h1>
          <p style={{ color: 'var(--text-light)', marginTop: '0.5rem' }}>Configure your school's daily schedule and period durations.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="premium-button"
          style={{ 
            background: 'var(--accent)', 
            color: 'white', 
            padding: '0.75rem 1.5rem', 
            borderRadius: '12px', 
            border: 'none', 
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </header>

      {message && (
        <div style={{ 
          padding: '1rem', 
          borderRadius: '12px', 
          marginBottom: '2rem', 
          backgroundColor: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: message.type === 'success' ? '#166534' : '#991b1b',
          border: `1px solid ${message.type === 'success' ? '#22c55e' : '#ef4444'}`
        }}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem' }}>
        <button 
          onClick={() => setActiveTab('schedule')}
          style={{ 
            background: 'none', border: 'none', fontSize: '1.1rem', fontWeight: activeTab === 'schedule' ? '700' : '500', 
            color: activeTab === 'schedule' ? 'var(--primary)' : 'var(--text-light)', cursor: 'pointer',
            borderBottom: activeTab === 'schedule' ? '3px solid var(--primary)' : 'none', paddingBottom: '0.5rem', marginBottom: '-1.2rem'
          }}
        >
          Daily Schedule Framework
        </button>
        <button 
          onClick={() => setActiveTab('assignments')}
          style={{ 
            background: 'none', border: 'none', fontSize: '1.1rem', fontWeight: activeTab === 'assignments' ? '700' : '500', 
            color: activeTab === 'assignments' ? 'var(--primary)' : 'var(--text-light)', cursor: 'pointer',
            borderBottom: activeTab === 'assignments' ? '3px solid var(--primary)' : 'none', paddingBottom: '0.5rem', marginBottom: '-1.2rem'
          }}
        >
          Primary Assignments (Source of Truth)
        </button>
        <button 
          onClick={() => setActiveTab('handover')}
          style={{ 
            background: 'none', border: 'none', fontSize: '1.1rem', fontWeight: activeTab === 'handover' ? '700' : '500', 
            color: activeTab === 'handover' ? 'var(--primary)' : 'var(--text-light)', cursor: 'pointer',
            borderBottom: activeTab === 'handover' ? '3px solid var(--primary)' : 'none', paddingBottom: '0.5rem', marginBottom: '-1.2rem',
            marginLeft: 'auto'
          }}
        >
          🔄 Teacher Handover Tool
        </button>
        <button 
          onClick={() => setActiveTab('onboarding')}
          style={{ 
            background: 'none', border: 'none', fontSize: '1.1rem', fontWeight: activeTab === 'onboarding' ? '700' : '500', 
            color: activeTab === 'onboarding' ? 'var(--danger)' : 'var(--danger)', cursor: 'pointer',
            borderBottom: activeTab === 'onboarding' ? '3px solid var(--danger)' : 'none', paddingBottom: '0.5rem', marginBottom: '-1.2rem'
          }}
        >
          🚀 Launch Engine
        </button>
      </div>

      {activeTab === 'schedule' && (
        <>
          <div className="glass-card" style={{ padding: '2rem', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem' }}>Daily Schedule Framework</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {periods.map((period, index) => (
            <div key={index} style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 120px 120px 150px 50px', 
              gap: '1rem', 
              alignItems: 'center',
              padding: '1rem',
              borderRadius: '16px',
              background: period.type === 'break' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.5)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}>
              <input 
                type="text" 
                value={period.label} 
                onChange={(e) => handleChange(index, 'label', e.target.value)}
                placeholder="Label"
                style={{ background: 'transparent', border: 'none', fontWeight: '600', fontSize: '1rem', color: 'var(--text)' }}
              />
              <input 
                type="time" 
                value={period.startTime} 
                onChange={(e) => handleChange(index, 'startTime', e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ddd' }}
              />
              <input 
                type="time" 
                value={period.endTime} 
                onChange={(e) => handleChange(index, 'endTime', e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ddd' }}
              />
              <select 
                value={period.type} 
                onChange={(e) => handleChange(index, 'type', e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ddd' }}
              >
                <option value="period">Academic Period</option>
                <option value="break">Break / Recess</option>
              </select>
              <button 
                onClick={() => handleRemove(index)}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.25rem' }}
              >
                &times;
              </button>
            </div>
          ))}
        </div>

        <button 
          onClick={handleAdd}
          style={{ 
            marginTop: '2rem', 
            width: '100%', 
            padding: '1rem', 
            borderRadius: '16px', 
            border: '2px dashed #cbd5e1', 
            background: 'transparent',
            color: 'var(--text-light)',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          + Add Multi-Period Block or Break
        </button>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>Timeline Visualization</h2>
        <div style={{ 
          height: '60px', 
          width: '100%', 
          background: '#f1f5f9', 
          borderRadius: '30px', 
          display: 'flex',
          overflow: 'hidden',
          border: '4px solid white',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
        }}>
          {periods.map((p, i) => (
            <div key={i} style={{ 
              flex: 1, 
              background: p.type === 'break' ? 'var(--warning-light)' : 'var(--accent)', 
              opacity: p.type === 'break' ? 0.6 : 0.8,
              borderRight: '1px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: '700'
            }}>
              {p.label}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 1rem', color: 'var(--text-light)', fontSize: '0.85rem' }}>
          <span>{periods[0]?.startTime || '08:00 AM'}</span>
          <span>{periods[periods.length-1]?.endTime || '04:00 PM'}</span>
        </div>
      </div>
      </>
      )}

      {activeTab === 'assignments' && (
        <div className="glass-card" style={{ padding: '2rem', borderRadius: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem' }}>Master Assignment Table</h2>
          
          {/* Add New Assignment Form */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 1fr) minmax(150px, 1fr) 100px 100px 80px auto', gap: '1rem', marginBottom: '2rem', alignItems: 'end', background: '#f8fafc', padding: '1.5rem', borderRadius: '16px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-light)', marginBottom: '0.5rem', display: 'block' }}>Teacher</label>
              <select className="form-control" value={newAssignment.teacher_id} onChange={e => setNewAssignment({...newAssignment, teacher_id: e.target.value})}>
                <option value="">Select...</option>
                {teachers.map(t => <option key={t.user_id} value={t.user_id}>{t.first_name} {t.last_name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-light)', marginBottom: '0.5rem', display: 'block' }}>Subject</label>
              <select className="form-control" value={newAssignment.subject_id} onChange={e => setNewAssignment({...newAssignment, subject_id: e.target.value})}>
                <option value="">Select...</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name || s.subject_name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-light)', marginBottom: '0.5rem', display: 'block' }}>Class</label>
              <select className="form-control" value={newAssignment.class_id} onChange={e => setNewAssignment({...newAssignment, class_id: e.target.value})}>
                <option value="">Select...</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name || c.class_name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-light)', marginBottom: '0.5rem', display: 'block' }}>Section</label>
              <select className="form-control" value={newAssignment.section_id} onChange={e => setNewAssignment({...newAssignment, section_id: e.target.value})}>
                <option value="">Select...</option>
                {sections.filter(s => !newAssignment.class_id || s.class_id === newAssignment.class_id).map(s => <option key={s.id} value={s.id}>{s.name || s.section_name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-light)', marginBottom: '0.5rem', display: 'block' }}>Periods/Day</label>
              <input type="number" min="1" max="5" className="form-control" value={newAssignment.periods_per_day} onChange={e => setNewAssignment({...newAssignment, periods_per_day: parseInt(e.target.value)})} />
            </div>
            <button onClick={handleAddAssignment} className="btn btn-primary" style={{ padding: '0.65rem 1rem' }} disabled={!newAssignment.teacher_id || !newAssignment.subject_id || !newAssignment.class_id}>
              {saving ? 'Adding...' : '+ Assign'}
            </button>
          </div>

          {/* Assignments List */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <tr>
                  <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-light)' }}>Teacher</th>
                  <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-light)' }}>Subject</th>
                  <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-light)' }}>Class & Section</th>
                  <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-light)' }}>Periods/Day</th>
                  <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-light)', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map(assn => (
                  <tr key={assn.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{assn.teacher?.first_name} {assn.teacher?.last_name}</td>
                    <td style={{ padding: '1rem' }}>{assn.subject?.name || assn.subject?.subject_name}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 8px', borderRadius: '4px', fontWeight: 600, fontSize: '0.8rem' }}>
                        {assn.class?.class_name || assn.class?.name} {assn.section?.section_name ? `- ${assn.section.section_name}` : ''}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>{assn.periods_per_day}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button onClick={() => handleDeleteAssignment(assn.id)} style={{ background: 'var(--danger-light)', color: 'var(--danger)', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {assignments.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No assignments found. Add one above.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'handover' && (
        <div className="glass-card" style={{ padding: '2rem', borderRadius: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
             Teacher Transition Logic
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Execute a "One-Click Handover" when a teacher leaves mid-term. This hot-swaps all future scheduled periods and generates a Briefing Report.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) minmax(200px, 1fr) 150px auto', gap: '1rem', marginBottom: '2rem', alignItems: 'end', background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-light)', marginBottom: '0.5rem', display: 'block' }}>Outgoing Teacher</label>
              <select className="form-control" value={handoverForm.outgoing_teacher_id} onChange={e => setHandoverForm({...handoverForm, outgoing_teacher_id: e.target.value})}>
                <option value="">Select...</option>
                {teachers.map(t => <option key={`out-${t.user_id}`} value={t.user_id}>{t.first_name} {t.last_name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-light)', marginBottom: '0.5rem', display: 'block' }}>Incoming Teacher</label>
              <select className="form-control" value={handoverForm.incoming_teacher_id} onChange={e => setHandoverForm({...handoverForm, incoming_teacher_id: e.target.value})}>
                <option value="">Select...</option>
                {teachers.filter(t => t.user_id !== handoverForm.outgoing_teacher_id).map(t => <option key={`in-${t.user_id}`} value={t.user_id}>{t.first_name} {t.last_name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-light)', marginBottom: '0.5rem', display: 'block' }}>Effective Date</label>
              <input type="date" className="form-control" value={handoverForm.effective_date} onChange={e => setHandoverForm({...handoverForm, effective_date: e.target.value})} />
            </div>
            <button onClick={handleExecuteHandover} className="btn" style={{ padding: '0.65rem 1.5rem', background: 'var(--warning)', color: '#fff', fontWeight: 'bold' }} disabled={!handoverForm.outgoing_teacher_id || !handoverForm.incoming_teacher_id || saving}>
              {saving ? 'Processing...' : '⚡ Execute Hot-Swap'}
            </button>
          </div>

          {handoverReport && (
            <div style={{ marginTop: '2rem', animation: 'fadeIn 0.3s ease-in-out' }}>
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)' }}>
                📋 Administrator Handover Briefing Report
              </h3>
              
              <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: '#f1f5f9' }}>
                    <tr>
                      <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Class & Section</th>
                      <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Subject</th>
                      <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Last Completed Topic</th>
                      <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Completion Date</th>
                      <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Velocity Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {handoverReport.handover_report.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '1rem', fontWeight: 500 }}>
                           <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>{item.class_name}</span>
                        </td>
                        <td style={{ padding: '1rem' }}>{item.subject_name}</td>
                        <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>{item.last_completed_lesson}</td>
                        <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{item.completion_date || 'N/A'}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ 
                            fontWeight: 'bold', 
                            color: item.velocity_score > 0.95 ? 'var(--success)' : (item.velocity_score > 0.85 ? 'var(--warning)' : 'var(--danger)') 
                           }}>
                            {item.velocity_score.toFixed(2)}v
                          </span>
                        </td>
                      </tr>
                    ))}
                    {handoverReport.handover_report.length === 0 && (
                      <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No historical schedule data found for these sections. Handover complete.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ONBOARDING TAB */}
      {activeTab === 'onboarding' && (
          <div className="glass-card" style={{ padding: '2rem', borderRadius: '24px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '8px', color: 'var(--danger)' }}>🚀 System Initializer (The Big Bang)</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                  Upload your master assignments, select the board, and let XceliQOS auto-generate the 52-week calendar curriculum grid.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                  <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>Master Assignment Data (CSV/JSON)</label>
                      <div style={{ padding: '20px', border: '2px dashed var(--border)', borderRadius: '12px', textAlign: 'center', background: '#f8fafc', color: 'var(--text-muted)' }}>
                          Click to upload <code>master_assignments_2026.csv</code>
                          <br/><span style={{ fontSize: '12px' }}>(Simulated payload is loaded for demo)</span>
                      </div>
                  </div>
                  <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>Curriculum Board</label>
                      <select 
                          className="form-control" 
                          value={onboardingForm.board}
                          onChange={(e) => setOnboardingForm({...onboardingForm, board: e.target.value})}
                          style={{ marginBottom: '16px' }}
                      >
                          <option value="CBSE">CBSE (India)</option>
                          <option value="ICSE">ICSE</option>
                          <option value="IGCSE">Cambridge IGCSE</option>
                      </select>

                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>Academic Year Target</label>
                      <select 
                          className="form-control" 
                          value={onboardingForm.year_id}
                          onChange={(e) => setOnboardingForm({...onboardingForm, year_id: e.target.value})}
                      >
                          <option value="AYMAX-001">2026-27 (Upcoming)</option>
                          <option value="AYMAX-002">2027-28</option>
                      </select>
                  </div>
              </div>

              <button 
                  onClick={async () => {
                      setIsLaunching(true);
                      setLaunchSummary(null);
                      try {
                          // Mocking the parsed CSV assignment data
                          const mockAssignments = [
                              { teacher_id: 'TCH-001', class_id: 'CLS-10', section_id: 'A', subject_id: 'SUB-MATH', periods_per_day: 1 },
                              { teacher_id: 'TCH-002', class_id: 'CLS-10', section_id: 'B', subject_id: 'SUB-SCI', periods_per_day: 1 },
                              { teacher_id: 'TCH-003', class_id: 'CLS-10', section_id: 'C', subject_id: 'SUB-ENG', periods_per_day: 1 }
                          ];
                          
                          const payload = {
                              school_id: 'SCH-001',
                              year_id: onboardingForm.year_id,
                              board: onboardingForm.board,
                              teacher_assignments: mockAssignments
                          };

                          const headers = { 'X-School-Id': 'SCH-001', 'Authorization': `Bearer ${localStorage.getItem('school_token') || ''}` };
                          const res = await axios.post(`http://localhost:3001/api/academic/onboarding/launch`, payload, { headers });
                          
                          setLaunchSummary(res.data.stats);
                      } catch (error) {
                          console.error("ONBOARDING ERROR:", error);
                          alert("Failed to launch system.");
                      } finally {
                          setIsLaunching(false);
                      }
                  }}
                  disabled={isLaunching}
                  style={{ width: '100%', padding: '16px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '800', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}
              >
                  {isLaunching ? '⚙️ Synthesizing Curriculum...' : '💥 INITIALIZE LUMIQ OS ENGINE'}
              </button>

              {launchSummary && (
                  <div style={{ marginTop: '32px', padding: '24px', background: 'rgba(34, 197, 94, 0.1)', border: '2px solid var(--success)', borderRadius: '16px', animation: 'fadeIn 0.5s ease-out' }}>
                      <h4 style={{ color: 'var(--success)', marginBottom: '16px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          ✅ System Initialized Successfully
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                          <div style={{ background: 'white', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                              <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>{launchSummary.teachers_assigned}</div>
                              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Mappings Established</div>
                          </div>
                          <div style={{ background: 'white', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                              <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>{launchSummary.topics_seeded}</div>
                              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>NCERT Topics Seeded ({launchSummary.board})</div>
                          </div>
                          <div style={{ background: 'white', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                              <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>{launchSummary.schedules_generated}</div>
                              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Schedules Auto-Generated</div>
                          </div>
                      </div>
                      <p style={{ marginTop: '16px', textAlign: 'center', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                          The 52-week calendar for {launchSummary.year} is now live and populated with the official curriculum.
                      </p>
                  </div>
              )}
          </div>
      )}

    </div>
  );
}

export default SchoolSettings;
