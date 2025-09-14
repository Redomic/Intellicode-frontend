/**
 * Form validation utilities
 */

/**
 * Password validation requirements
 */
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: false, // Keep it user-friendly
};

/**
 * Validate password against requirements
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with isValid and errors
 */
export const validatePassword = (password) => {
  const errors = [];
  const requirements = PASSWORD_REQUIREMENTS;

  if (!password) {
    return { isValid: false, errors: ['Password is required'] };
  }

  if (password.length < requirements.minLength) {
    errors.push(`Password must be at least ${requirements.minLength} characters long`);
  }

  if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (requirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (requirements.requireNumber && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (requirements.requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Calculate password strength score (0-100)
 * @param {string} password - Password to analyze
 * @returns {Object} - Strength score and level
 */
export const getPasswordStrength = (password) => {
  if (!password) {
    return { score: 0, level: 'none', color: 'gray' };
  }

  let score = 0;
  const checks = {
    length: password.length >= 8,
    longLength: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    noRepeat: !/(.)\1{2,}/.test(password),
    mixedCase: /[A-Z]/.test(password) && /[a-z]/.test(password),
  };

  // Basic requirements
  if (checks.length) score += 20;
  if (checks.uppercase) score += 15;
  if (checks.lowercase) score += 15;
  if (checks.number) score += 15;

  // Bonus points
  if (checks.longLength) score += 10;
  if (checks.specialChar) score += 15;
  if (checks.noRepeat) score += 5;
  if (checks.mixedCase) score += 5;

  // Determine strength level and color
  let level, color;
  if (score < 30) {
    level = 'weak';
    color = 'red';
  } else if (score < 60) {
    level = 'fair';
    color = 'yellow';
  } else if (score < 80) {
    level = 'good';
    color = 'blue';
  } else {
    level = 'strong';
    color = 'green';
  }

  return { score: Math.min(score, 100), level, color };
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {Object} - Validation result
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate name format
 * @param {string} name - Name to validate
 * @returns {Object} - Validation result
 */
export const validateName = (name) => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Name is required' };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }
  
  if (name.trim().length > 50) {
    return { isValid: false, error: 'Name must be less than 50 characters' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate confirm password
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {Object} - Validation result
 */
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password' };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }
  
  return { isValid: true, error: null };
};
