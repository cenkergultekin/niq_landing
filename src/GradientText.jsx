import React from 'react';
import './GradientText.css';

const GradientText = ({ 
  text, 
  className = '',
  gradient = 'default',
  animate = true 
}) => {
  return (
    <span className={`gradient-text gradient-${gradient} ${animate ? 'animate' : ''} ${className}`}>
      {text}
    </span>
  );
};

export default GradientText;

