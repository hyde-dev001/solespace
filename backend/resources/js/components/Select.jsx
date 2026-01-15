import React from 'react';

const Select = ({ value = '', options = [], onChange, placeholder = 'Select an option', className = '' }) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  const baseClasses = 'h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-11 text-sm shadow-sm focus:outline-none focus:ring-2';
  const lightMode = 'border-gray-300 bg-transparent text-gray-800 placeholder:text-gray-400 focus:border-blue-300 focus:ring-blue-500/20';

  const textColor = value ? 'text-gray-800' : 'text-gray-400';

  return (
    <select
      aria-label={placeholder}
      className={`${baseClasses} ${lightMode} ${textColor} ${className}`}
      value={value}
      onChange={handleChange}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
};

export default Select;
