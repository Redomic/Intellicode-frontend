import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import FormInput from '../../components/FormInput';
import NotificationContainer from '../../components/NotificationContainer';
import useNotification from '../../hooks/useNotification';
import { 
  validatePassword, 
  validateEmail, 
  validateName, 
  validateConfirmPassword 
} from '../../utils/validation';
import { LoadingButton } from '../../components/ui/InlineLoading';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  
  const { register, loading, error, clearError } = useAuth();
  const { 
    notifications, 
    removeNotification, 
    showSuccess, 
    showError 
  } = useNotification();

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return validateName(value);
      case 'email':
        return validateEmail(value);
      case 'password':
        return validatePassword(value);
      case 'confirmPassword':
        return validateConfirmPassword(formData.password, value);
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
        [name]: validation.isValid ? null : validation.error || validation.errors?.[0]
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    
    const validation = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: validation.isValid ? null : validation.error || validation.errors?.[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear any previous auth errors
    clearError();
    
    // Validate all fields
    const validations = {
      name: validateField('name', formData.name),
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
      confirmPassword: validateField('confirmPassword', formData.confirmPassword),
    };

    // Check if any field has errors
    const hasErrors = Object.values(validations).some(validation => !validation.isValid);
    
    if (hasErrors) {
      // Set all field errors and mark all fields as touched
      const errors = {};
      Object.entries(validations).forEach(([field, validation]) => {
        if (!validation.isValid) {
          errors[field] = validation.error || validation.errors?.[0];
        }
      });
      
      setFieldErrors(errors);
      setTouchedFields({
        name: true,
        email: true,
        password: true,
        confirmPassword: true,
      });
      
      showError('Please fix the form errors and try again.');
      return;
    }

    try {
      const { confirmPassword, ...userData } = formData;
      await register(userData);
      showSuccess('Account created successfully! Welcome to IntelliCode!');
    } catch (error) {
      console.error('Registration failed:', error);
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
            Create account
          </h1>
          <p className="text-zinc-400 font-light">
            Start your DSA learning journey today
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormInput
            label="Full Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter your full name"
            error={fieldErrors.name}
            required
            autoComplete="name"
          />

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
            placeholder="Create a password"
            error={fieldErrors.password}
            showPasswordStrength={true}
            required
            autoComplete="new-password"
          />

          <FormInput
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Confirm your password"
            error={fieldErrors.confirmPassword}
            required
            autoComplete="new-password"
          />

          <LoadingButton
            type="submit"
            isLoading={loading}
            loadingText="Creating Account..."
            variant="primary"
            size="md"
            className="w-full"
          >
            Create Account
          </LoadingButton>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-zinc-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-zinc-100 hover:text-white transition-colors duration-200">
              Sign in
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

export default RegisterPage;
