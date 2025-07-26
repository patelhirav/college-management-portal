import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiMail, FiLock, FiKey } from 'react-icons/fi';
import apiService from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/ForgotPassword.css';

const ForgotPassword = () => {
  const [step, setStep] = useState('email');
  const [resetToken, setResetToken] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  const onEmailSubmit = async (data) => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await apiService.forgotPassword({ email: data.email });
      setResetToken(res.resetToken);
      setMessage(res.message);
      setEmail(data.email);
      setStep('otp');
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const onOtpSubmit = async (data) => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await apiService.verifyOtp({ otp: data.otp, resetToken });
      setMessage(res.message);
      setOtp(data.otp);
      setStep('reset');
    } catch (err) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const onResetSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await apiService.resetPassword({ 
        resetToken, 
        otp, 
        newPassword: data.newPassword 
      });
      setMessage(res.message);
      setStep('done');
    } catch (err) {
      setError(err.message || 'Failed to reset password');
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
    <div className="forgot-password-container">
      <div className="forgot-password-background">
        <div className="background-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>
      
      <div className="forgot-password-content">
        <div className="forgot-password-box">
          <div className="forgot-password-header">
            <h1 className="forgot-password-title">Reset Password</h1>
            <p className="forgot-password-subtitle">
              {step === 'email' && 'Enter your email to receive an OTP'}
              {step === 'otp' && 'Enter the OTP sent to your email'}
              {step === 'reset' && 'Enter your new password'}
              {step === 'done' && 'Password reset complete'}
            </p>
          </div>

          {message && (
            <div className="success-message" role="alert">
              {message}
            </div>
          )}
          {error && (
            <div className="error-message" role="alert">
              <div className="error-icon">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <span>{error}</span>
            </div>
          )}

          {step === 'email' && (
            <form onSubmit={handleSubmit(onEmailSubmit)} className="forgot-password-form">
              <div className={`form-group ${focusedField === 'email' ? 'focused' : ''} ${watch('email') ? 'filled' : ''}`}>
                <div className="input-wrapper">
                  <FiMail className="input-icon" />
                  <input
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    placeholder="Email Address"
                    onFocus={() => handleFocus('email')}
                    onBlur={handleBlur}
                  />
                </div>
                {errors.email && <p className="form-error">{errors.email.message}</p>}
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className={`forgot-password-button ${loading ? 'disabled' : ''}`}
              >
                <span className="button-content">
                  {loading ? (
                    <>
                      <LoadingSpinner />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <span>Send OTP</span>
                  )}
                </span>
                <div className="button-glow"></div>
              </button>
              <div className="auth-footer">
                <p> <a href="/" className="auth">Back to Login</a></p>
              </div>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleSubmit(onOtpSubmit)} className="forgot-password-form">
              <div className={`form-group ${focusedField === 'otp' ? 'focused' : ''} ${watch('otp') ? 'filled' : ''}`}>
                <div className="input-wrapper">
                  <FiKey className="input-icon" />
                  <input
                    {...register('otp', { 
                      required: 'OTP is required',
                      pattern: {
                        value: /^\d{6}$/,
                        message: 'OTP must be 6 digits'
                      }
                    })}
                    placeholder="Enter 6-digit OTP"
                    onFocus={() => handleFocus('otp')}
                    onBlur={handleBlur}
                  />
                </div>
                {errors.otp && <p className="form-error">{errors.otp.message}</p>}
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className={`forgot-password-button ${loading ? 'disabled' : ''}`}
              >
                <span className="button-content">
                  {loading ? (
                    <>
                      <LoadingSpinner />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Verify OTP</span>
                  )}
                </span>
                <div className="button-glow"></div>
              </button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleSubmit(onResetSubmit)} className="forgot-password-form">
              <div className={`form-group ${focusedField === 'newPassword' ? 'focused' : ''} ${watch('newPassword') ? 'filled' : ''}`}>
                <div className="input-wrapper">
                  <FiLock className="input-icon" />
                  <input
                    {...register('newPassword', { 
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters'
                      }
                    })}
                    type="password"
                    placeholder="New Password"
                    onFocus={() => handleFocus('newPassword')}
                    onBlur={handleBlur}
                  />
                </div>
                {errors.newPassword && <p className="form-error">{errors.newPassword.message}</p>}
              </div>

              <div className={`form-group ${focusedField === 'confirmPassword' ? 'focused' : ''} ${watch('confirmPassword') ? 'filled' : ''}`}>
                <div className="input-wrapper">
                  <FiLock className="input-icon" />
                  <input
                    {...register('confirmPassword', { 
                      required: 'Please confirm your password',
                      validate: (value) =>
                        value === watch('newPassword') || 'Passwords do not match'
                    })}
                    type="password"
                    placeholder="Confirm Password"
                    onFocus={() => handleFocus('confirmPassword')}
                    onBlur={handleBlur}
                  />
                </div>
                {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className={`forgot-password-button ${loading ? 'disabled' : ''}`}
              >
                <span className="button-content">
                  {loading ? (
                    <>
                      <LoadingSpinner />
                      <span>Resetting Password...</span>
                    </>
                  ) : (
                    <span>Reset Password</span>
                  )}
                </span>
                <div className="button-glow"></div>
              </button>
            </form>
          )}

          {step === 'done' && (
            <div className="auth-footer">
              <p>Your password has been reset successfully!</p>
              <a href="/login" className="auth-footer">
                Return to Login
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;