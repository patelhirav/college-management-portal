import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser } from 'react-icons/fi';
import '../styles/Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-background-overlay"></div>
      </div>
      
      <div className="login-box">
        <div className="login-header">
          <div className="login-logo">
            <FiUser className="logo-icon" />
          </div>
          <h1>Academic Vault</h1>
          <p>Access your academic works</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
             <FiMail className="input-icon" />
            <div className="input-container">
             
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={credentials.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            
             <FiLock className="input-icon" />
            <div className="input-container">
             
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={handleChange}
                required
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>
          
          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="/forgot-password" className="forgot-password">Forgot password?</a>
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
            className="login-button"
            aria-busy={loading}
          >
            {loading ? (
              <>
                <LoadingSpinner />
                <span>Authenticating...</span>
              </>
            ) : 'Login'}
          </button>
          
          
          
        </form>
        
        <div className="auth-footer">
          Don't have an account? <a href="/student-signup">Register here</a>
        </div>
      </div>
    </div>
  );
};

export default Login;