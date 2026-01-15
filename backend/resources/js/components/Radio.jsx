import React from 'react';

const Radio = ({
  id,
  name,
  value,
  checked,
  label,
  onChange,
  className = '',
  disabled = false,
}) => {
  return (
    <label
      htmlFor={id}
      className={`relative flex cursor-pointer select-none items-center gap-3 text-sm font-medium ${
        disabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700'
      } ${className}`}
    >
      <input
        id={id}
        name={name}
        type="radio"
        value={value}
        checked={checked}
        onChange={() => !disabled && onChange(value)}
        className="sr-only"
        disabled={disabled}
      />
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full border-[1.25px] ${
          checked
            ? 'border-blue-500 bg-blue-500'
            : 'bg-transparent border-gray-300'
        } ${disabled ? 'bg-gray-100 border-gray-200' : ''}`}
      >
        {checked && (
          <span className="h-2 w-2 rounded-full bg-white" />
        )}
      </span>
      <span>{label}</span>
    </label>
  );
};

export default Radio;
