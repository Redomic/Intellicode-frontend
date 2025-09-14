import React, { useState } from 'react';
import { getPasswordStrength } from '../utils/validation';

/**
 * FormInput component with validation and feedback
 * @param {Object} props - Component props
 */
const FormInput = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error = null,
  showPasswordStrength = false,
  disabled = false,
  autoComplete,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const isPasswordType = type === 'password';
  const inputType = isPasswordType && showPassword ? 'text' : type;
  
  // Get password strength if it's a password field and has value
  const passwordStrength = isPasswordType && showPasswordStrength && value 
    ? getPasswordStrength(value) 
    : null;

  const baseInputClasses = `
    w-full px-4 py-3 bg-zinc-800 border rounded-lg text-zinc-100 placeholder-zinc-500 
    focus:outline-none transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
    ${error 
      ? 'border-red-600 focus:border-red-500' 
      : focused 
        ? 'border-zinc-500' 
        : 'border-zinc-700 focus:border-zinc-600'
    }
    ${className}
  `;

  const getStrengthColor = (color) => {
    const colors = {
      red: 'bg-red-500',
      yellow: 'bg-yellow-500', 
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      gray: 'bg-zinc-600',
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      {label && (
        <label className="block text-zinc-300 text-sm font-light">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      {/* Input container */}
      <div className="relative">
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          className={baseInputClasses}
          {...props}
        />

        {/* Password visibility toggle */}
        {isPasswordType && value && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-300 transition-colors duration-200"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464m1.414 1.414L18.536 18.536M6.464 6.464l-1.414-1.414" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Password strength indicator */}
      {passwordStrength && showPasswordStrength && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-zinc-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength.color)}`}
                style={{ width: `${passwordStrength.score}%` }}
              />
            </div>
            <span className="text-xs text-zinc-400 capitalize min-w-[3.5rem]">
              {passwordStrength.level}
            </span>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-red-400 text-sm flex items-center space-x-1">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export default FormInput;
