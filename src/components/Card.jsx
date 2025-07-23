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
      className={`card-ui 
        ${variant} 
        ${hoverEffect ? 'hover-effect' : ''} 
        shadow-${shadow} 
        ${border ? 'with-border' : ''} 
        ${className}`}
    >
      {image && (
        <div className="card-ui-image-container">
          <img src={image} alt={imageAlt} className="card-ui-image" />
        </div>
      )}

      {(title || headerAction) && (
        <div className="card-ui-header">
          {title && <h2 className="card-ui-title">{title}</h2>}
          {headerAction && <div className="card-ui-header-action">{headerAction}</div>}
        </div>
      )}

      <div className="card-ui-content">
        {children}
      </div>

      {footer && <div className="card-ui-footer">{footer}</div>}
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
    'stats'
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
