const API_BASE = '/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('xceliq_token');
  const headers = {
    'Content-Type': 'application/json',
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

  // Admin — platform
  getAdminOverview:    () => apiRequest('/admin/overview'),
  getAdminSchools:     () => apiRequest('/admin/schools'),
  getUsageMetrics:     () => apiRequest('/admin/analytics/usage'),
  getEngagement:       () => apiRequest('/admin/analytics/engagement'),
  getFinanceOverview:  () => apiRequest('/admin/finance/overview'),
  getSystemHealth:     () => apiRequest('/admin/system/health'),
};
