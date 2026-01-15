import React from 'react';

const Input = ({
  type = 'text',
  id,
  name,
  placeholder,
  value,
  onChange,
  className = '',
  min,
  max,
  step,
  disabled = false,
  error = false,
}) => {
  let inputClasses = `h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 ${className}`;

  if (disabled) {
    inputClasses += ` text-gray-500 border-gray-300 opacity-40 bg-gray-100 cursor-not-allowed`;
  } else if (error) {
    inputClasses += ` border-red-500 focus:border-red-300 focus:ring-red-500/20`;
  } else {
    inputClasses += ` bg-transparent text-gray-800 border-gray-300 focus:border-blue-300 focus:ring-blue-500/20`;
  }

  return (
    <input
      type={type}
      id={id}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      className={inputClasses}
    />
  );
};

export default Input;
