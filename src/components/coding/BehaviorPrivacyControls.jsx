import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * BehaviorPrivacyControls - Privacy settings for behavior tracking
 * Allows users to control data collection and retention
 */
const BehaviorPrivacyControls = ({ 
  isVisible = false, 
  onClose = () => {},
  behaviorTracker = null 
}) => {
  const [settings, setSettings] = useState({
    trackingEnabled: true,
    anonymizeData: true,
    shareForResearch: false,
    dataRetentionDays: 90
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load current settings
  useEffect(() => {
    if (isVisible && behaviorTracker) {
      loadCurrentSettings();
    }
  }, [isVisible, behaviorTracker]);

  const loadCurrentSettings = async () => {
    try {
      setIsLoading(true);
      // In a real implementation, this would load from the backend
      // For now, we'll use default settings
      const defaultSettings = {
        trackingEnabled: true,
        anonymizeData: true,
        shareForResearch: false,
        dataRetentionDays: 90
      };
      setSettings(defaultSettings);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to load privacy settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Update behavior tracker
      if (behaviorTracker) {
        behaviorTracker.updatePrivacySettings(settings);
      }
      
      // In a real implementation, this would save to the backend
      console.log('Privacy settings updated:', settings);
      
      setHasChanges(false);
      onClose();
    } catch (error) {
      console.error('Failed to save privacy settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      loadCurrentSettings(); // Reset to original settings
    }
    onClose();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleCancel}
      >
        <motion.div
          className="bg-zinc-800 border border-zinc-600 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-100">Privacy Controls</h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Manage your behavior tracking data and privacy settings
                </p>
              </div>
              <button
                onClick={handleCancel}
                className="text-zinc-400 hover:text-zinc-200 transition-colors duration-200"
                disabled={isLoading}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Settings */}
          <div className="px-6 py-4 space-y-6">
            {/* Tracking Enabled */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-zinc-100">Enable Behavior Tracking</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Collect keystroke and coding behavior data for analysis
                  </p>
                </div>
                <button
                  onClick={() => handleSettingChange('trackingEnabled', !settings.trackingEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    settings.trackingEnabled ? 'bg-blue-600' : 'bg-zinc-600'
                  }`}
                  disabled={isLoading}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${
                      settings.trackingEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Anonymization */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-zinc-100">Anonymize Data</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Remove personally identifiable information from collected data
                  </p>
                </div>
                <button
                  onClick={() => handleSettingChange('anonymizeData', !settings.anonymizeData)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    settings.anonymizeData ? 'bg-green-600' : 'bg-zinc-600'
                  }`}
                  disabled={isLoading || !settings.trackingEnabled}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${
                      settings.anonymizeData ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Research Participation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-zinc-100">Share for Research</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Allow anonymized data to be used for educational research
                  </p>
                </div>
                <button
                  onClick={() => handleSettingChange('shareForResearch', !settings.shareForResearch)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    settings.shareForResearch ? 'bg-purple-600' : 'bg-zinc-600'
                  }`}
                  disabled={isLoading || !settings.trackingEnabled}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${
                      settings.shareForResearch ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Data Retention */}
            <div className="space-y-2">
              <div>
                <h3 className="text-sm font-medium text-zinc-100">Data Retention Period</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  How long to keep your behavior tracking data
                </p>
              </div>
              <select
                value={settings.dataRetentionDays}
                onChange={(e) => handleSettingChange('dataRetentionDays', parseInt(e.target.value))}
                className="w-full bg-zinc-700 border border-zinc-600 text-zinc-100 text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading || !settings.trackingEnabled}
              >
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
                <option value={90}>90 days</option>
                <option value={180}>6 months</option>
                <option value={365}>1 year</option>
              </select>
            </div>

            {/* Current Status */}
            <div className="bg-zinc-700/50 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-medium text-zinc-100">Current Status</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Tracking Status:</span>
                  <span className={settings.trackingEnabled ? 'text-green-400' : 'text-red-400'}>
                    {settings.trackingEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Data Protection:</span>
                  <span className={settings.anonymizeData ? 'text-green-400' : 'text-yellow-400'}>
                    {settings.anonymizeData ? 'Anonymized' : 'Identifiable'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Retention:</span>
                  <span className="text-zinc-300">{settings.dataRetentionDays} days</span>
                </div>
              </div>
            </div>

            {/* Data Rights */}
            <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-200 mb-2">Your Data Rights</h4>
              <ul className="text-xs text-blue-300 space-y-1">
                <li>• You can export your data at any time</li>
                <li>• You can request data deletion</li>
                <li>• You can modify these settings anytime</li>
                <li>• All data is encrypted and secure</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-zinc-700 flex justify-end space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm text-zinc-300 hover:text-zinc-100 transition-colors duration-200"
              disabled={isLoading}
            >
              Cancel
            </button>
            <motion.button
              onClick={handleSave}
              className={`px-4 py-2 text-sm text-white rounded transition-colors duration-200 ${
                hasChanges 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-zinc-600 cursor-not-allowed'
              }`}
              disabled={isLoading || !hasChanges}
              whileHover={hasChanges ? { scale: 1.05 } : {}}
              whileTap={hasChanges ? { scale: 0.95 } : {}}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                'Save Changes'
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BehaviorPrivacyControls;

