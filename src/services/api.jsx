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

  const isFormData = options.body instanceof FormData;

  const config = {
    headers: {
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers, // allow explicit override if needed
    },
    ...options,
  };

  if (options.body && !isFormData) {
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

   async forgotPassword(data) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: data,
    });
  }

  async verifyOtp(data) {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: data,
    });
  }

  async resetPassword(data) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: data,
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
  async getSuperAdminProfile() {
    return this.request('/super-admin/profile');
  }

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

  async getAdminProfile() {
    return this.request('/admin/profile');
  }

  async addAdminBio(data) {
    return this.request('/admin/bio', {
      method: 'POST',
      body: data,
    });
  }

  async updateAdminBio(data) {
    return this.request('/admin/bio', {
      method: 'PUT',
      body: data,
    });
  }

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

  async getSubAdminProfile() {
    return this.request('/sub-admin/profile');
  }


  async addSubAdminBio(data) {
    return this.request('/sub-admin/bio', {
      method: 'POST',
      body: data,
    });
  }

  async updateSubAdminBio(data) {
    return this.request('/sub-admin/bio', {
      method: 'PUT',
      body: data,
    });
  }

  async getAssignedSubjects() {
    return this.request('/sub-admin/subjects');
  }

  async createTask(formData) {
    return this.request('/sub-admin/create-task', {
      method: 'POST',
      body: formData, // Remove Content-Type for FormData
    });
  }

  async updateTask(taskId, formData) {
  return this.request(`/sub-admin/tasks/${taskId}`, {
    method: 'PUT',
    body: formData,
  });
}

  async getTasks() {
    return this.request('/sub-admin/tasks');
  }

  async getTaskStatus(taskId) {
    return this.request(`/sub-admin/task-status/${taskId}`);
  }

  // Student endpoints


  async getStudentProfile() {
    return this.request('/student/profile');
  }

  async addStudentProfile(data) {
    return this.request('/student/info', {
      method: 'POST',
      body: data,
    });
  }

  async updateStudentProfile(formData) {
    return this.request('/student/profile', {
      method: 'PUT',
      body: formData,
    });
  }

  async updateStudentProfilePhoto(formData) {
    console.log("Updating student profile photo");
    console.log("FormData:", formData);
    return this.request('/student/profile/photo', {
      method: 'PUT',
      body: formData,
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
    });
  }
}

export default new ApiService();