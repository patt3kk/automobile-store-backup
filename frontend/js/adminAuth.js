// Admin authentication functions

const API_BASE_URL = 'https://automobile-store-backup.onrender.com/api/v1';

// Login admin function
async function loginAdmin(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error('Network error. Please check your connection.');
    }
}

// Get auth headers with token
function getAuthHeaders() {
    const token = localStorage.getItem('adminToken');
    if (token) {
        return {
            'Authorization': `Bearer ${token}`,
        };
    }
    return {};
}