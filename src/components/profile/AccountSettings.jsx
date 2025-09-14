import React, { useState } from 'react';

/**
 * AccountSettings - User account preferences and settings
 */
const AccountSettings = ({ user }) => {
  const [settings, setSettings] = useState({
    emailNotifications: user?.preferences?.emailNotifications ?? true,
    learningReminders: user?.preferences?.learningReminders ?? true,
    weeklyProgress: user?.preferences?.weeklyProgress ?? true,
    problemSolutions: user?.preferences?.problemSolutions ?? false,
    communityUpdates: user?.preferences?.communityUpdates ?? true,
    language: user?.preferences?.language || 'en',
    timezone: user?.preferences?.timezone || 'UTC',
    theme: user?.preferences?.theme || 'dark',
    defaultProgrammingLanguage: user?.preferences?.defaultProgrammingLanguage || 'python',
    codeEditor: {
      fontSize: user?.preferences?.codeEditor?.fontSize || 14,
      tabSize: user?.preferences?.codeEditor?.tabSize || 4,
      wordWrap: user?.preferences?.codeEditor?.wordWrap ?? true,
      minimap: user?.preferences?.codeEditor?.minimap ?? true,
      lineNumbers: user?.preferences?.codeEditor?.lineNumbers ?? true
    },
    privacy: {
      profileVisibility: user?.preferences?.privacy?.profileVisibility || 'public',
      showProgress: user?.preferences?.privacy?.showProgress ?? true,
      showActivity: user?.preferences?.privacy?.showActivity ?? true,
      allowMessages: user?.preferences?.privacy?.allowMessages ?? true
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  const handleToggle = (section, setting) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [setting]: !prev[section][setting]
      }
    }));
  };

  const handleSimpleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSelectChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleEditorChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      codeEditor: {
        ...prev.codeEditor,
        [setting]: value
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSavedMessage('Settings saved successfully!');
      setTimeout(() => setSavedMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSavedMessage('Error saving settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const ToggleSwitch = ({ checked, onChange, disabled = false }) => (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-800
        ${checked ? 'bg-blue-600' : 'bg-zinc-600'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium text-zinc-100">Account Settings</h2>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="
            px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg
            transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500
          "
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {savedMessage && (
        <div className={`mb-4 p-3 rounded-lg ${
          savedMessage.includes('Error') ? 'bg-red-900/20 text-red-400 border border-red-700/50' :
          'bg-green-900/20 text-green-400 border border-green-700/50'
        }`}>
          {savedMessage}
        </div>
      )}

      <div className="space-y-8">
        {/* Notification Preferences */}
        <div>
          <h3 className="text-lg font-medium text-zinc-100 mb-4">Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-zinc-300 font-medium">Email Notifications</h4>
                <p className="text-zinc-500 text-sm">Receive important updates via email</p>
              </div>
              <ToggleSwitch
                checked={settings.emailNotifications}
                onChange={() => handleSimpleToggle('emailNotifications')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-zinc-300 font-medium">Learning Reminders</h4>
                <p className="text-zinc-500 text-sm">Get reminders to practice coding</p>
              </div>
              <ToggleSwitch
                checked={settings.learningReminders}
                onChange={() => handleSimpleToggle('learningReminders')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-zinc-300 font-medium">Weekly Progress</h4>
                <p className="text-zinc-500 text-sm">Receive weekly progress summaries</p>
              </div>
              <ToggleSwitch
                checked={settings.weeklyProgress}
                onChange={() => handleSimpleToggle('weeklyProgress')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-zinc-300 font-medium">Solution Discussions</h4>
                <p className="text-zinc-500 text-sm">Notifications about solution discussions</p>
              </div>
              <ToggleSwitch
                checked={settings.problemSolutions}
                onChange={() => handleSimpleToggle('problemSolutions')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-zinc-300 font-medium">Community Updates</h4>
                <p className="text-zinc-500 text-sm">Updates about community features</p>
              </div>
              <ToggleSwitch
                checked={settings.communityUpdates}
                onChange={() => handleSimpleToggle('communityUpdates')}
              />
            </div>
          </div>
        </div>

        {/* General Preferences */}
        <div>
          <h3 className="text-lg font-medium text-zinc-100 mb-4">General Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Language
              </label>
              <select
                value={settings.language}
                onChange={(e) => handleSelectChange('language', e.target.value)}
                className="
                  w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-100
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                "
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="zh">中文</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Timezone
              </label>
              <select
                value={settings.timezone}
                onChange={(e) => handleSelectChange('timezone', e.target.value)}
                className="
                  w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-100
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                "
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Tokyo">Tokyo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Default Programming Language
              </label>
              <select
                value={settings.defaultProgrammingLanguage}
                onChange={(e) => handleSelectChange('defaultProgrammingLanguage', e.target.value)}
                className="
                  w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-100
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                "
              >
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="javascript">JavaScript</option>
                <option value="cpp">C++</option>
                <option value="go">Go</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Theme
              </label>
              <select
                value={settings.theme}
                onChange={(e) => handleSelectChange('theme', e.target.value)}
                className="
                  w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-100
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                "
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="auto">System</option>
              </select>
            </div>
          </div>
        </div>

        {/* Code Editor Preferences */}
        <div>
          <h3 className="text-lg font-medium text-zinc-100 mb-4">Code Editor</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Font Size
              </label>
              <select
                value={settings.codeEditor.fontSize}
                onChange={(e) => handleEditorChange('fontSize', parseInt(e.target.value))}
                className="
                  w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-100
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                "
              >
                <option value={12}>12px</option>
                <option value={14}>14px</option>
                <option value={16}>16px</option>
                <option value={18}>18px</option>
                <option value={20}>20px</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Tab Size
              </label>
              <select
                value={settings.codeEditor.tabSize}
                onChange={(e) => handleEditorChange('tabSize', parseInt(e.target.value))}
                className="
                  w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-100
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                "
              >
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
                <option value={8}>8 spaces</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-zinc-300 font-medium">Word Wrap</h4>
                <p className="text-zinc-500 text-sm">Wrap long lines</p>
              </div>
              <ToggleSwitch
                checked={settings.codeEditor.wordWrap}
                onChange={() => handleToggle('codeEditor', 'wordWrap')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-zinc-300 font-medium">Minimap</h4>
                <p className="text-zinc-500 text-sm">Show code overview</p>
              </div>
              <ToggleSwitch
                checked={settings.codeEditor.minimap}
                onChange={() => handleToggle('codeEditor', 'minimap')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-zinc-300 font-medium">Line Numbers</h4>
                <p className="text-zinc-500 text-sm">Show line numbers</p>
              </div>
              <ToggleSwitch
                checked={settings.codeEditor.lineNumbers}
                onChange={() => handleToggle('codeEditor', 'lineNumbers')}
              />
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div>
          <h3 className="text-lg font-medium text-zinc-100 mb-4">Privacy</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Profile Visibility
              </label>
              <select
                value={settings.privacy.profileVisibility}
                onChange={(e) => handleToggle('privacy', 'profileVisibility')}
                className="
                  w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-100
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                "
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="friends">Friends Only</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-zinc-300 font-medium">Show Progress</h4>
                <p className="text-zinc-500 text-sm">Allow others to see your progress</p>
              </div>
              <ToggleSwitch
                checked={settings.privacy.showProgress}
                onChange={() => handleToggle('privacy', 'showProgress')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-zinc-300 font-medium">Show Activity</h4>
                <p className="text-zinc-500 text-sm">Allow others to see your recent activity</p>
              </div>
              <ToggleSwitch
                checked={settings.privacy.showActivity}
                onChange={() => handleToggle('privacy', 'showActivity')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-zinc-300 font-medium">Allow Messages</h4>
                <p className="text-zinc-500 text-sm">Allow other users to send you messages</p>
              </div>
              <ToggleSwitch
                checked={settings.privacy.allowMessages}
                onChange={() => handleToggle('privacy', 'allowMessages')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;


