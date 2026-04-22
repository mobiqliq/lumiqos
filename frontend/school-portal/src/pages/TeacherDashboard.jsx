import { useState, useEffect } from 'react';
import KPICard from '../components/common/KPICard';

const API_BASE = '/api/intelligence-graph';

const getHeaders = () => {
  const token = localStorage.getItem('school_token');
  const schoolId = localStorage.getItem('school_id') || '11111111-1111-1111-1111-111111111111';
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
    'x-school-id': schoolId,
  };
};

const fetchHeatmap = async (classId) => {
  const res = await fetch(`${API_BASE}/class/${classId}/heatmap`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch heatmap');
  return res.json();
};

const fetchStrugglingStudents = async (classId) => {
  const res = await fetch(`${API_BASE}/class/${classId}/struggling-students`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch struggling students');
  const data = await res.json();
  // Extract the array from the response object
  return data.strugglingStudents || [];
};

const fetchStudentRadar = async (studentId) => {
  const res = await fetch(`${API_BASE}/student/${studentId}/radar`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch radar data');
  return res.json();
};

export default function TeacherDashboard() {
  const [selectedClassId, setSelectedClassId] = useState('33333333-3333-3333-3333-333333333333');
  const [heatmapData, setHeatmapData] = useState(null);
  const [strugglingStudents, setStrugglingStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudentRadar, setSelectedStudentRadar] = useState(null);
  const [radarLoading, setRadarLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [heatmap, struggling] = await Promise.all([
          fetchHeatmap(selectedClassId),
          fetchStrugglingStudents(selectedClassId)
        ]);
        setHeatmapData(heatmap);
        setStrugglingStudents(struggling);
      } catch (err) {
        console.error('API error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [selectedClassId]);

  const handleViewRadar = async (studentId) => {
    setRadarLoading(true);
    try {
      const radar = await fetchStudentRadar(studentId);
      setSelectedStudentRadar(radar);
    } catch (err) {
      console.error('Radar fetch error:', err);
      alert('Could not load radar data');
    } finally {
      setRadarLoading(false);
    }
  };

  const getMasteryColor = (mastery) => {
    const val = parseFloat(mastery);
    if (val >= 80) return 'var(--positive)';
    if (val >= 60) return 'var(--warning)';
    return 'var(--danger)';
  };

  if (loading) {
    return (
      <div style={{ padding: 'var(--sp-6)' }}>
        <div style={{ marginBottom: 'var(--sp-6)' }}>
          <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xl)', fontWeight: 400, color: 'var(--text-primary)', margin: 0 }}>
            Teacher Dashboard
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            Loading analytics...
          </p>
        </div>
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
          Fetching student performance data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 'var(--sp-6)' }}>
        <div style={{ marginBottom: 'var(--sp-6)' }}>
          <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xl)', fontWeight: 400, color: 'var(--text-primary)', margin: 0 }}>
            Teacher Dashboard
          </h1>
        </div>
        <div style={{
          background: 'var(--danger-muted)',
          border: '1px solid var(--danger)',
          borderRadius: 'var(--r-lg)',
          padding: 20,
          color: 'var(--danger)'
        }}>
          Error loading data: {error}
          <button
            onClick={() => window.location.reload()}
            style={{
              marginLeft: 16,
              background: 'var(--danger)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--r-md)',
              padding: '6px 12px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const studentCount = heatmapData?.heatmap?.length || 0;
  const strugglingCount = strugglingStudents?.length || 0;

  return (
    <div style={{ padding: 'var(--sp-6)' }}>
      <div style={{ marginBottom: 'var(--sp-6)' }}>
        <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xl)', fontWeight: 400, color: 'var(--text-primary)', margin: 0 }}>
          Teacher Dashboard
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          Class 10 • {studentCount} Students
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
        <KPICard label="Today's Attendance" value="38/42" delta="4 absent" deltaType="warning" />
        <KPICard label="Assignments Due" value="3" delta="By Friday" deltaType="neutral" />
        <KPICard label="Avg Class Score" value="74.3%" delta="+3.2%" deltaType="success" />
        <KPICard label="Student Alerts" value={strugglingCount.toString()} delta="Need attention" deltaType={strugglingCount > 0 ? 'warning' : 'neutral'} />
      </div>

      <div style={{ marginBottom: 'var(--sp-4)' }}>
        <select
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--r-md)',
            border: '1px solid var(--border)',
            background: 'var(--bg-surface)',
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-base)',
            color: 'var(--text-primary)',
            cursor: 'pointer'
          }}
        >
          <option value="33333333-3333-3333-3333-333333333333">Class 10 (Test Data)</option>
          <option value="e1a402ea-c1d0-49ff-a44b-a9a094d41a6e">Class 9 (Test Data)</option>
        </select>
      </div>

      {heatmapData && (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
          padding: '20px',
          marginBottom: 'var(--sp-6)',
          overflowX: 'auto'
        }}>
          <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)', fontWeight: 500, color: 'var(--text-primary)', marginTop: 0, marginBottom: 16 }}>
            Skill Mastery Heatmap
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid var(--border)' }}>Student</th>
                {heatmapData.skills.slice(0, 6).map(skill => (
                  <th key={skill.id} style={{ padding: 8, borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    {skill.name.replace('Topic: ', '')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heatmapData.heatmap.map(student => (
                <tr key={student.studentId}>
                  <td style={{ padding: 8, borderBottom: '1px solid var(--border)', fontWeight: 500 }}>
                    {student.name}
                  </td>
                  {student.skills.slice(0, 6).map(skill => (
                    <td key={skill.skillId} style={{
                      padding: 8,
                      borderBottom: '1px solid var(--border)',
                      color: getMasteryColor(skill.mastery),
                      fontWeight: 500
                    }}>
                      {skill.mastery}%
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
          padding: '20px'
        }}>
          <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)', fontWeight: 500, color: 'var(--text-primary)', marginTop: 0, marginBottom: 16 }}>
            Students Needing Attention
          </h3>
          {strugglingStudents.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No struggling students identified.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {strugglingStudents.map(student => (
                <div key={student.studentId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{student.name}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      Avg Mastery: {student.averageMastery}%
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewRadar(student.studentId)}
                    disabled={radarLoading}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--r-md)',
                      padding: '4px 12px',
                      fontSize: 'var(--text-xs)',
                      cursor: 'pointer',
                      color: 'var(--text-muted)'
                    }}
                  >
                    View Radar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{
          background: 'var(--accent-muted)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
          padding: '16px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '8.5px',
            fontWeight: 600,
            letterSpacing: '0.13em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            🧠 AI Insight
            <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 300, lineHeight: 1.65, color: 'var(--text-muted)', margin: 0 }}>
            {strugglingCount > 0
              ? `${strugglingCount} student${strugglingCount > 1 ? 's' : ''} showing mastery below 70%. Consider targeted intervention.`
              : 'All students are performing at or above expectations. Keep up the great work!'}
          </p>
        </div>
      </div>

      {selectedStudentRadar && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001
        }} onClick={() => setSelectedStudentRadar(null)}>
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--r-lg)',
            padding: 24,
            maxWidth: 500,
            width: '100%'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-sans)', marginTop: 0 }}>
              {selectedStudentRadar.studentName} - Domain Mastery
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {selectedStudentRadar.domains.map(domain => (
                <div key={domain.domain}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span>{domain.domain}</span>
                    <span style={{ color: getMasteryColor(domain.mastery) }}>{domain.mastery}%</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--bg-raised)', borderRadius: 2 }}>
                    <div style={{
                      width: `${domain.mastery}%`,
                      height: 4,
                      background: 'var(--accent)',
                      borderRadius: 2
                    }} />
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setSelectedStudentRadar(null)}
              style={{
                marginTop: 20,
                padding: '8px 16px',
                background: 'var(--accent)',
                border: 'none',
                borderRadius: 'var(--r-pill)',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
