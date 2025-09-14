import React, { useState } from 'react';
import FormInput from '../FormInput';
import { validatePassword } from '../../utils/validation';

/**
 * SecuritySettings - Security and password management
 */
const SecuritySettings = ({ user }) => {
  const [activeSection, setActiveSection] = useState('password');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.security?.twoFactorEnabled || false);
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);
  const [backupCodes] = useState([
    'abc123def456',
    'ghi789jkl012',
    'mno345pqr678',
    'stu901vwx234',
    'yz567abc890'
  ]);
  const [sessions] = useState([
    {
      id: 1,
      device: 'MacBook Pro',
      browser: 'Chrome',
      location: 'San Francisco, CA',
      lastActive: '2024-01-15 10:30 AM',
      current: true
    },
    {
      id: 2,
      device: 'iPhone 15',
      browser: 'Safari',
      location: 'San Francisco, CA',
      lastActive: '2024-01-14 08:45 PM',
      current: false
    },
    {
      id: 3,
      device: 'Windows PC',
      browser: 'Edge',
      location: 'New York, NY',
      lastActive: '2024-01-12 02:15 PM',
      current: false
    }
  ]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePasswordBlur = (e) => {
    const { name } = e.target;
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));

    validatePasswordField(name, passwordForm[name]);
  };

  const validatePasswordField = (fieldName, value) => {
    let error = '';

    switch (fieldName) {
      case 'currentPassword':
        if (!value) error = 'Current password is required';
        break;
      case 'newPassword':
        error = validatePassword(value);
        break;
      case 'confirmPassword':
        if (!value) {
          error = 'Please confirm your password';
        } else if (value !== passwordForm.newPassword) {
          error = 'Passwords do not match';
        }
        break;
      default:
        break;
    }

    setPasswordErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));

    return error;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsChangingPassword(true);

    // Validate all fields
    const fieldErrors = {};
    Object.keys(passwordForm).forEach(field => {
      const error = validatePasswordField(field, passwordForm[field]);
      if (error) fieldErrors[field] = error;
    });

    if (Object.keys(fieldErrors).length > 0) {
      setPasswordErrors(fieldErrors);
      setIsChangingPassword(false);
      return;
    }

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Reset form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordErrors({});
      setTouchedFields({});
      
      // Show success message (you could add a state for this)
      alert('Password changed successfully!');
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleEnable2FA = async () => {
    setIsEnabling2FA(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTwoFactorEnabled(!twoFactorEnabled);
    } catch (error) {
      console.error('Error toggling 2FA:', error);
    } finally {
      setIsEnabling2FA(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      alert('Session revoked successfully!');
    } catch (error) {
      console.error('Error revoking session:', error);
    }
  };

  const sections = [
    { id: 'password', label: 'Password' },
    { id: '2fa', label: 'Two-Factor Authentication' },
    { id: 'sessions', label: 'Active Sessions' },
    { id: 'backup', label: 'Backup Codes' }
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-medium text-zinc-100 mb-6">Security Settings</h2>

      {/* Section Navigation */}
      <div className="flex space-x-1 mb-6 bg-zinc-700/30 rounded-lg p-1">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`
              px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200
              ${activeSection === section.id
                ? 'bg-zinc-600 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50'
              }
            `}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Password Section */}
      {activeSection === 'password' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-zinc-100 mb-4">Change Password</h3>
            <p className="text-zinc-400 text-sm mb-6">
              Choose a strong password with at least 8 characters, including uppercase, lowercase, numbers, and symbols.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
            <FormInput
              label="Current Password"
              type="password"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              onBlur={handlePasswordBlur}
              error={touchedFields.currentPassword ? passwordErrors.currentPassword : ''}
              required
              autoComplete="current-password"
            />

            <FormInput
              label="New Password"
              type="password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              onBlur={handlePasswordBlur}
              error={touchedFields.newPassword ? passwordErrors.newPassword : ''}
              required
              showPasswordStrength
              autoComplete="new-password"
            />

            <FormInput
              label="Confirm New Password"
              type="password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              onBlur={handlePasswordBlur}
              error={touchedFields.confirmPassword ? passwordErrors.confirmPassword : ''}
              required
              autoComplete="new-password"
            />

            <button
              type="submit"
              disabled={isChangingPassword}
              className="
                w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg
                transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            >
              {isChangingPassword ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}

      {/* Two-Factor Authentication Section */}
      {activeSection === '2fa' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-zinc-100 mb-4">Two-Factor Authentication</h3>
            <p className="text-zinc-400 text-sm mb-6">
              Add an extra layer of security to your account by requiring a second form of authentication.
            </p>
          </div>

          <div className="bg-zinc-700/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-zinc-100 font-medium">Authentication App</h4>
                <p className="text-zinc-400 text-sm">
                  Use an authenticator app like Google Authenticator or Authy
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`text-sm ${twoFactorEnabled ? 'text-green-400' : 'text-zinc-400'}`}>
                  {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </span>
                <button
                  onClick={handleEnable2FA}
                  disabled={isEnabling2FA}
                  className={`
                    px-4 py-2 rounded-lg text-white transition-colors duration-200
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800
                    ${twoFactorEnabled 
                      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                      : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    }
                    disabled:opacity-50
                  `}
                >
                  {isEnabling2FA ? 'Processing...' : (twoFactorEnabled ? 'Disable' : 'Enable')}
                </button>
              </div>
            </div>

            {twoFactorEnabled && (
              <div className="mt-4 p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-green-400 font-medium">Two-factor authentication is active</span>
                </div>
                <p className="text-green-300 text-sm mt-2">
                  Your account is protected with two-factor authentication. Make sure to keep your backup codes safe.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Sessions Section */}
      {activeSection === 'sessions' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-zinc-100 mb-4">Active Sessions</h3>
            <p className="text-zinc-400 text-sm mb-6">
              Monitor and manage devices that are currently logged into your account.
            </p>
          </div>

          <div className="space-y-4">
            {sessions.map(session => (
              <div key={session.id} className="bg-zinc-700/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-zinc-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-zinc-100 font-medium">{session.device}</h4>
                        {session.current && (
                          <span className="px-2 py-1 bg-green-400/20 text-green-400 text-xs rounded">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-400 text-sm">
                        {session.browser} • {session.location}
                      </p>
                      <p className="text-zinc-500 text-xs">
                        Last active: {session.lastActive}
                      </p>
                    </div>
                  </div>
                  {!session.current && (
                    <button
                      onClick={() => handleRevokeSession(session.id)}
                      className="
                        px-3 py-1 text-red-400 hover:text-red-300 border border-red-700 hover:border-red-600
                        rounded transition-colors duration-200 text-sm
                        focus:outline-none focus:ring-2 focus:ring-red-500
                      "
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button className="
            w-full px-4 py-2 border border-red-700 text-red-400 hover:text-red-300 hover:border-red-600
            rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500
          ">
            Revoke All Other Sessions
          </button>
        </div>
      )}

      {/* Backup Codes Section */}
      {activeSection === 'backup' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-zinc-100 mb-4">Backup Codes</h3>
            <p className="text-zinc-400 text-sm mb-6">
              Backup codes can be used to access your account if you lose your phone. Keep them safe!
            </p>
          </div>

          {twoFactorEnabled ? (
            <div className="space-y-4">
              <div className="bg-zinc-700/30 rounded-lg p-6">
                <h4 className="text-zinc-100 font-medium mb-4">Your Backup Codes</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="font-mono text-zinc-300 bg-zinc-800 p-2 rounded">
                      {code}
                    </div>
                  ))}
                </div>
                <div className="flex space-x-3">
                  <button className="
                    px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg
                    transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500
                  ">
                    Download Codes
                  </button>
                  <button className="
                    px-4 py-2 border border-zinc-600 text-zinc-300 hover:text-zinc-100 hover:border-zinc-500
                    rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-zinc-500
                  ">
                    Generate New Codes
                  </button>
                </div>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.633 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-yellow-400 font-medium">Important</span>
                </div>
                <p className="text-yellow-300 text-sm mt-2">
                  Each backup code can only be used once. Store them securely and generate new ones if you run out.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-700/30 rounded-lg p-6 text-center">
              <svg className="w-12 h-12 text-zinc-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h4 className="text-zinc-300 font-medium mb-2">Enable Two-Factor Authentication</h4>
              <p className="text-zinc-500 text-sm">
                You need to enable two-factor authentication before you can generate backup codes.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SecuritySettings;


