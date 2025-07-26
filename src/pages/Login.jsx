import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiBookOpen } from 'react-icons/fi';
import '../styles/Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const { login } = useAuth();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(credentials);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField('');
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="background-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>
      
      <div className="login-content">
        <div className="login-box">
          <div className="login-header">
            <div className="login-logo">
              <FiBookOpen className="logo-icon" />
              <div className="logo-glow"></div>
            </div>
            <h1 className="login-title">Academic Vault</h1>
            <p className="login-subtitle">Access your academic works securely</p>
          </div>
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className={`form-group ${focusedField === 'email' ? 'focused' : ''} ${credentials.email ? 'filled' : ''}`}>
              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleChange}
                  onFocus={() => handleFocus('email')}
                 onBlur={handleBlur}
                  required
                  autoComplete="email"
                />
                <label htmlFor="email" className="input-label">Email Address</label>
              </div>
            </div>
            
            <div className={`form-group ${focusedField === 'password' ? 'focused' : ''} ${credentials.password ? 'filled' : ''}`}>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  onFocus={() => handleFocus('password')}
                  onBlur={handleBlur}
                  required
                  autoComplete="current-password"
                />
                <label htmlFor="password" className="input-label">Password</label>
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex="-1"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            
            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" id="remember" />
                <span className="checkmark"></span>
                <span className="checkbox-label">Remember me</span>
              </label>
              <a href="/forgot-password" className="forgot-password" >
                Forgot password?
              </a>
            </div>
            
            {error && (
              <div className="error-message" role="alert">
                <div className="error-icon">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="error-text">{error}</span>
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={loading} 
              className={`login-button ${loading ? 'loading' : ''}`}
              aria-busy={loading}
            >
              <span className="button-content">
                {loading ? (
                  <>
                    <LoadingSpinner />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <div className="button-arrow">→</div>
                  </>
                )}
              </span>
              <div className="button-glow"></div>
            </button>
          </form>
          
          <div className="auth-footer">
            <p>Don't have an account? 
              <a href="/student-signup" className="register-link">Create one here</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;