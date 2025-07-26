import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiMail, FiUser, FiBook, FiLock, FiChevronDown } from 'react-icons/fi';
import '../styles/StudentSignup.css';

const StudentSignup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    semester: '',
    departmentId: '',
  });
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const data = await apiService.getDepartments();
      setDepartments(data);
    } catch (error) {
      setError('Failed to load departments');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiService.studentSignup({
        ...formData,
        semester: parseInt(formData.semester),
      });

      apiService.setToken(response.token);
      await login({
        email: formData.email,
        password: formData.password,
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-background"></div>

      <div className="signup-box">
        <div className="signup-header">
          <h1>Student Registration</h1>
          <p>Create your Academic Vault account</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <FiMail className="input-icon" />
            <input
              type="email"
              id="email"
              name="email"
              placeholder="student@college.edu"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <FiUser className="input-icon" />
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <FiBook className="input-icon" />
            
              <div className="select-wrapper">
                <select
                  id="semester"
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="select-arrow" />
              </div>
            </div>

            <div className="form-group">
              <FiBook className="input-icon" />
          
              <div className="select-wrapper">
                <select
                  id="departmentId"
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="select-arrow" />
              </div>
            </div>
          </div>

          <div className="form-group">
            <FiLock className="input-icon" />
          
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <div className="password-hint">
              Must be at least 8 characters
            </div>
          </div>

          {error && (
            <div className="error-message" role="alert">
              <svg className="error-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="signup-button"
            aria-busy={loading}
          >
            {loading ? (
              <>
                <LoadingSpinner />
                <span>Creating Account...</span>
              </>
            ) : 'Register'}
          </button>

          <div className="auth-footer">
            Already have an account? <a href="/">Login here</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentSignup;