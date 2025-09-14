import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import FormInput from '../../components/FormInput';
import NotificationContainer from '../../components/NotificationContainer';
import useNotification from '../../hooks/useNotification';
import { validateEmail } from '../../utils/validation';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  
  const { login, loading, error, clearError } = useAuth();
  const { 
    notifications, 
    removeNotification, 
    showSuccess, 
    showError 
  } = useNotification();

  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        return validateEmail(value);
      case 'password':
        return value ? { isValid: true, error: null } : { isValid: false, error: 'Password is required' };
      default:
        return { isValid: true, error: null };
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });

    // Real-time validation for touched fields
    if (touchedFields[name]) {
      const validation = validateField(name, value);
      setFieldErrors(prev => ({
        ...prev,
        [name]: validation.isValid ? null : validation.error
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    
    const validation = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: validation.isValid ? null : validation.error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear any previous auth errors
    clearError();
    
    // Validate all fields
    const validations = {
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
    };

    // Check if any field has errors
    const hasErrors = Object.values(validations).some(validation => !validation.isValid);
    
    if (hasErrors) {
      // Set all field errors and mark all fields as touched
      const errors = {};
      Object.entries(validations).forEach(([field, validation]) => {
        if (!validation.isValid) {
          errors[field] = validation.error;
        }
      });
      
      setFieldErrors(errors);
      setTouchedFields({
        email: true,
        password: true,
      });
      
      showError('Please fix the form errors and try again.');
      return;
    }
    
    try {
      await login(formData);
      showSuccess('Welcome back! Redirecting to your dashboard...');
    } catch (error) {
      console.error('Login failed:', error);
      // Error is already handled by the useAuth hook and displayed via Redux
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center px-6">
      <NotificationContainer 
        notifications={notifications} 
        onRemoveNotification={removeNotification} 
      />
      
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <Link to="/" className="text-2xl font-thin text-zinc-100 tracking-tight">
            IntelliCode
          </Link>
          <h1 className="text-3xl font-thin text-zinc-100 mt-8 mb-2">
            Welcome back
          </h1>
          <p className="text-zinc-400 font-light">
            Sign in to continue your learning journey
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormInput
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter your email"
            error={fieldErrors.email}
            required
            autoComplete="email"
          />

          <FormInput
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter your password"
            error={fieldErrors.password}
            required
            autoComplete="current-password"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-zinc-100 text-zinc-900 font-medium rounded-lg hover:bg-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-zinc-400 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-zinc-100 hover:text-white transition-colors duration-200">
              Sign up
            </Link>
          </p>
          
          <div className="mt-6">
            <Link to="/" className="text-zinc-500 text-sm hover:text-zinc-400 transition-colors duration-200">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
