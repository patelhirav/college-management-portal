const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    if (options.body && !(options.body instanceof FormData)) {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: credentials,
    });
  }

  async studentSignup(data) {
    return this.request('/auth/student-signup', {
      method: 'POST',
      body: data,
    });
  }

  async getDepartments() {
    return this.request('/auth/departments');
  }

  // Super Admin endpoints
  async getHods() {
    return this.request('/super-admin/hods');
  }

  async createHod(data) {
    return this.request('/super-admin/create-hod', {
      method: 'POST',
      body: data,
    });
  }

  async getSuperAdminDepartments() {
    return this.request('/super-admin/departments');
  }

  // Admin endpoints
  async getDepartmentInfo() {
    return this.request('/admin/department');
  }

  async createProfessor(data) {
    return this.request('/admin/create-professor', {
      method: 'POST',
      body: data,
    });
  }

  async createSubject(data) {
    return this.request('/admin/create-subject', {
      method: 'POST',
      body: data,
    });
  }

  async assignProfessorToSubject(data) {
    return this.request('/admin/assign-professor', {
      method: 'POST',
      body: data,
    });
  }

  // Sub Admin endpoints
  async getAssignedSubjects() {
    return this.request('/sub-admin/subjects');
  }

  async createTask(formData) {
    return this.request('/sub-admin/create-task', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type for FormData
    });
  }

  async getTasks() {
    return this.request('/sub-admin/tasks');
  }

  async getTaskStatus(taskId) {
    return this.request(`/sub-admin/task-status/${taskId}`);
  }

  // Student endpoints
  async getProfile() {
    return this.request('/student/profile');
  }

  async updateProfile(formData) {
    return this.request('/student/profile', {
      method: 'PUT',
      body: formData,
      headers: {},
    });
  }

  async getSubjects() {
    return this.request('/student/subjects');
  }

  async getStudentTasks() {
    return this.request('/student/tasks');
  }

  async updateTaskStatus(taskId, formData) {
    return this.request(`/student/task-status/${taskId}`, {
      method: 'PUT',
      body: formData,
      headers: {},
    });
  }
}

export default new ApiService();