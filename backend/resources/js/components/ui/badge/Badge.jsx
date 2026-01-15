import React from 'react';

const Badge = ({ className = '', variant = 'default', ...props }) => {
  const baseStyles = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors';
  
  const variants = {
    default: 'border border-transparent bg-primary text-primary-foreground',
    secondary: 'border border-transparent bg-secondary text-secondary-foreground',
    destructive: 'border border-transparent bg-destructive text-destructive-foreground',
    outline: 'text-foreground'
  };

  return (
    <div
      className={`${baseStyles} ${variants[variant] || variants.default} ${className}`}
      {...props}
    />
  );
};

export default Badge;
