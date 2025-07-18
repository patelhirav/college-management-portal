import React from 'react';
import PropTypes from 'prop-types';
import '../styles/Card.css';

const Card = ({ 
  title, 
  children, 
  className = '', 
  variant = 'default',
  hoverEffect = true,
  headerAction,
  footer,
  image,
  imageAlt = '',
  shadow = 'medium',
  border = false
}) => {
  return (
    <div 
      className={`card 
        ${variant} 
        ${className} 
        ${hoverEffect ? 'hover-effect' : ''} 
        shadow-${shadow} 
        ${border ? 'with-border' : ''}
      `}
    >
      {image && (
        <div className="card-image-container">
          <img src={image} alt={imageAlt} className="card-image" />
        </div>
      )}
      
      {(title || headerAction) && (
        <div className="card-header">
          {title && <h2 className="card-title">{title}</h2>}
          {headerAction && <div className="card-header-action">{headerAction}</div>}
        </div>
      )}
      
      <div className="card-content">
        {children}
      </div>
      
      {footer && (
        <div className="card-footer">
          {footer}
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf([
    'default', 
    'primary', 
    'secondary', 
    'success', 
    'warning', 
    'danger', 
    'info',
    'stats',
    'department',
    'professor',
    'subject',
    'task',
    'student'
  ]),
  hoverEffect: PropTypes.bool,
  headerAction: PropTypes.node,
  footer: PropTypes.node,
  image: PropTypes.string,
  imageAlt: PropTypes.string,
  shadow: PropTypes.oneOf(['none', 'small', 'medium', 'large', 'xl']),
  border: PropTypes.bool
};

export default Card;