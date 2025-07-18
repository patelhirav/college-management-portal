import React from 'react';
import '../styles/LoadingSpinner.css';

const LoadingSpinner = ({ 
  type = 'default', 
  size = 'medium', 
  color = 'primary',
  text = null,
  overlay = false,
  className = ''
}) => {
  const spinnerClasses = [
    'spinner',
    type !== 'default' && type,
    size !== 'medium' && size,
    color !== 'primary' && color,
    className
  ].filter(Boolean).join(' ');

  const containerClasses = [
    'loading-spinner',
    overlay && 'loading-overlay'
  ].filter(Boolean).join(' ');

  if (overlay) {
    return (
      <div className={containerClasses}>
        <div className={spinnerClasses}></div>
        {text && <div className="loading-text">{text}</div>}
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <div className={spinnerClasses}></div>
      {text && <div className="loading-text">{text}</div>}
    </div>
  );
};

export default LoadingSpinner;