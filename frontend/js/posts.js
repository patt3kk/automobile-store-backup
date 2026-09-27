// Posts management functions

const API_BASE_URL = 'https://automobile-store-backup.onrender.com/api/v1';
// const API_BASE_URL = 'http://localhost:8001/api/v1';

// Create a new post
async function createPost(formData) {
    try {
        const token = localStorage.getItem('adminToken');
        
        const response = await fetch(`${API_BASE_URL}/posts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error('Network error. Please check your connection.');
    }
}

// Get all posts
async function getAllPosts() {
    try {
        const response = await fetch(`${API_BASE_URL}/posts`);
        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error('Network error. Please check your connection.');
    }
}

// Get a single post by ID
async function getPostById(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/posts/${id}`);
        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error('Network error. Please check your connection.');
    }
}

// Update a post
async function updatePost(id, formData) {
    try {
        const token = localStorage.getItem('adminToken');
        
        const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error('Network error. Please check your connection.');
    }
}

// Delete a post
async function deletePost(id) {
    try {
        const token = localStorage.getItem('adminToken');
        
        const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error('Network error. Please check your connection.');
    }
}