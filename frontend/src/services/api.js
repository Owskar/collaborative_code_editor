import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication if needed
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    console.log("Token iss",token)
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      // Redirect to login if needed
    }
    return Promise.reject(error);
  }
);

// export const documentService = {
//   async getDocuments() {
//     const response = await api.get('/documents/');
//     return response.data;
//   },

//   async getDocument(id) {
//     const response = await api.get('/documents//');
//     return response.data;
//   },

//   async createDocument(data) {
//     const response = await api.post('/documents/', data);
//     return response.data;
//   },

//   async updateDocument(id, data) {
//     const response = await api.patch('/documents//', data);
//     return response.data;
//   },

//   async deleteDocument(id) {
//     await api.delete('/documents//');
//   },

//   async addCollaborator(documentId, username, permission = 'write') {
//     const response = await api.post('/documents//add_collaborator/', {
//       username,
//       permission,
//     });
//     return response.data;
//   },
// };

export const documentService = {
  async getDocuments() {
    const response = await api.get('/documents/');
    return response.data;
  },

  async getDocument(id) {
    const response = await api.get(`/documents/${id}/`);
    return response.data;
  },

  async createDocument(data) {
    const response = await api.post('/documents/', data);
    return response.data;
  },

  async updateDocument(id, data) {
    const response = await api.patch(`/documents/${id}/`, data);
    return response.data;
  },

  async deleteDocument(id) {
    await api.delete(`/documents/${id}/`);
  },

  async addCollaborator(documentId, username, permission = 'write') {
    const response = await api.post(`/documents/${documentId}/add_collaborator/`, {
      username,
      permission,
    });
    return response.data;
  },
};


export default api;
