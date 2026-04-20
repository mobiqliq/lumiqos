const API_BASE = '/api';

// Dev mock login - bypasses real auth for frontend development
const MOCK_LOGIN_RESPONSE = {
    access_token: 'dev-mock-token',
    user: {
        id: 'dev-user',
        email: 'teacher@school.lumiqos.dev',
        role: 'teacher',
        name: 'Dev Teacher',
        school_id: '11111111-1111-1111-1111-111111111111',
    }
};

export async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('school_token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        'x-school-id': localStorage.getItem('school_id') || '11111111-1111-1111-1111-111111111111',
        ...options.headers,
    };

    // Mock login for development
    if (endpoint.includes('/auth/login') && options.method === 'POST') {
        console.log('🔧 Dev mock login activated');
        return MOCK_LOGIN_RESPONSE;
    }

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
        if (!res.ok) {
            const error = await res.json().catch(() => ({ message: 'Request failed' }));
            throw { status: res.status, ...error };
        }
        return res.json();
    } catch (err) {
        if (err.status) throw err;
        throw { status: 0, message: 'Network error — is the API gateway running?' };
    }
}

export const api = {
    login: (email, password) =>
        apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

    getHealthServices: () => apiRequest('/health/services').catch(() => []),

    getSchools: () => apiRequest('/schools').catch(() => []),

    getStudents: () => apiRequest('/students').catch(() => []),

    getDashboard: () => apiRequest('/dashboard/overview').catch(() => null),
};

// Initialize demo data (mock)
export const demoData = {
    insights: {
        teacher: {
            title: 'AI Insight',
            message: '3 students need attention. Reyansh Singh\'s mastery is below 70%.'
        }
    },
    students: [
        { id: '1', name: 'Aarav Sharma', class_name: 'Class 10' },
        { id: '2', name: 'Ishita Patel', class_name: 'Class 10' },
        { id: '3', name: 'Reyansh Singh', class_name: 'Class 10' },
    ]
};

export const initializeDemoData = async () => {
    // No-op for now
};
