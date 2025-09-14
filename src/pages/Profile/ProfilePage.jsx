import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Navigation from '../../components/Navigation';
import { selectCurrentUser } from '../../store/userSlice';
import ProfileInfo from '../../components/profile/ProfileInfo';
import AccountSettings from '../../components/profile/AccountSettings';
import SecuritySettings from '../../components/profile/SecuritySettings';

/**
 * ProfilePage - User profile settings and account management
 */
const ProfilePage = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const currentUser = useSelector(selectCurrentUser);

  const sections = [
    { id: 'profile', label: 'Profile', icon: 'user' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
    { id: 'security', label: 'Security', icon: 'shield' }
  ];

  const getIcon = (iconType) => {
    const iconClasses = "w-5 h-5";
    
    switch (iconType) {
      case 'user':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'settings':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'shield':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileInfo user={currentUser} />;
      case 'settings':
        return <AccountSettings user={currentUser} />;
      case 'security':
        return <SecuritySettings user={currentUser} />;
      default:
        return <ProfileInfo user={currentUser} />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Navigation */}
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-thin text-zinc-100 mb-2">Profile Settings</h1>
          <p className="text-zinc-400">Manage your account information, preferences, and security settings</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden">
              <div className="p-4 border-b border-zinc-700">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-lg">
                    {currentUser?.profile?.firstName?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="text-zinc-100 font-medium">
                      {currentUser?.profile?.firstName ? 
                        `${currentUser.profile.firstName} ${currentUser.profile.lastName || ''}`.trim() : 
                        'User'
                      }
                    </h3>
                    <p className="text-zinc-400 text-sm">{currentUser?.email}</p>
                  </div>
                </div>
              </div>
              
              <nav className="p-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`
                      w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200
                      ${activeSection === section.id
                        ? 'bg-zinc-700 text-zinc-100 border border-zinc-600'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50'
                      }
                    `}
                  >
                    {getIcon(section.icon)}
                    <span className="font-medium">{section.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-zinc-800 rounded-lg border border-zinc-700 min-h-[600px]">
              {renderSection()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
