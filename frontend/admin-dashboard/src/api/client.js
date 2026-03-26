const API_BASE = '/api';

export async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('lumiq_token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
        const data = await res.json();
        if (!res.ok) throw { status: res.status, ...data };
        return data;
    } catch (err) {
        if (err.status) throw err;
        throw { status: 0, message: 'Network error — is the API gateway running?' };
    }
}

export const api = {
    login: (email, password) =>
        apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

    register: (email, password) =>
        apiRequest('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }),

    getHealthServices: () => apiRequest('/health/services'),

    getSchools: () => apiRequest('/schools').catch(() => []),

    getStudents: () => apiRequest('/students').catch(() => []),

    getDashboard: () => apiRequest('/dashboard/overview').catch(() => null),

    onboardTenant: (payload) =>
        apiRequest('/saas/tenants/onboard', { method: 'POST', body: JSON.stringify(payload) }),
};
