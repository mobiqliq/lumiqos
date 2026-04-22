const API_BASE = '/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('school_token');
  const schoolId = localStorage.getItem('school_id') || '11111111-1111-1111-1111-111111111111';

  const headers = {
    'Content-Type': 'application/json',
    'x-school-id': schoolId,
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw { status: res.status, ...data };
  return data;
}

export const api = {
  // Auth
  login: (email, password) =>
    apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  // Dashboard
  getDashboard: () => apiRequest('/dashboard/overview'),

  // Finance
  getFinanceOverview: () => apiRequest('/finance/overview'),

  // HR
  getHrOverview: () => apiRequest('/hr/overview'),

  // Parent
  getParentSummary: (studentId) => apiRequest(`/parent/summary/${studentId}`),

  // Intelligence Graph
  getClassHeatmap: (classId) => apiRequest(`/intelligence-graph/class/${classId}/heatmap`),
  getStudentRadar: (studentId) => apiRequest(`/intelligence-graph/student/${studentId}/radar`),

  // Substitution
  getAbsences: () => apiRequest('/substitution/absences'),

  // Exams
  getExams: () => apiRequest('/exams'),

  // Homework
  getHomework: () => apiRequest('/homework/class'),

  // Report Cards
  getReportCards: (examId, classId) =>
    apiRequest(`/report-cards/class?exam_id=${examId}&class_id=${classId}`),

  // Timetable
  getTimetable: () => apiRequest('/timetable'),
};
