import React, { useState } from 'react';
import { Settings, Bell, Lock, Eye, Moon, Globe, ChevronRight } from 'lucide-react';

const PatientSettings = ({ user }) => {
  const [settings, setSettings] = useState({
    privacy: false,
    notifications: true,
    darkTheme: true,
    emailReminders: true,
    smsAlerts: false,
    dataSharing: false,
    twoFactor: false
  });

  const handleSettingToggle = (setting) => {
    setSettings(prev => ({ ...prev, [setting]: !prev[setting] }));
  };

  const settingsGroups = [
    {
      title: 'Privacy & Security',
      icon: Lock,
      color: 'blue',
      settings: [
        { key: 'privacy', label: 'Private Profile', description: 'Control who can see your health data' },
        { key: 'twoFactor', label: 'Two-Factor Authentication', description: 'Add extra security to your account' },
        { key: 'dataSharing', label: 'Data Sharing', description: 'Allow anonymized data for research' }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      color: 'green',
      settings: [
        { key: 'notifications', label: 'Push Notifications', description: 'Get alerts for appointments and medications' },
        { key: 'emailReminders', label: 'Email Reminders', description: 'Receive email notifications for important updates' },
        { key: 'smsAlerts', label: 'SMS Alerts', description: 'Get text messages for urgent notifications' }
      ]
    },
    {
      title: 'Appearance',
      icon: Eye,
      color: 'purple',
      settings: [
        { key: 'darkTheme', label: 'Dark Theme', description: 'Switch between light and dark theme' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <h3 className="text-2xl font-bold mb-6">Settings</h3>
        
        {/* Profile Settings */}
        <div className="bg-white/5 rounded-xl p-6 mb-6">
          <h4 className="font-semibold text-white mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-blue-400" />
            Profile Settings
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
              <input
                type="text"
                value={user?.firstName || ''}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
              <input
                type="text"
                value={user?.lastName || ''}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                readOnly
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Settings Groups */}
        <div className="space-y-6">
          {settingsGroups.map((group) => {
            const Icon = group.icon;
            return (
              <div key={group.title} className="bg-white/5 rounded-xl p-6">
                <h4 className="font-semibold text-white mb-4 flex items-center">
                  <Icon className={`w-5 h-5 mr-2 text-${group.color}-400`} />
                  {group.title}
                </h4>
                <div className="space-y-4">
                  {group.settings.map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between py-3 border-b border-white/10 last:border-b-0">
                      <div className="flex-1">
                        <span className="text-white font-medium">{setting.label}</span>
                        <p className="text-sm text-gray-400 mt-1">{setting.description}</p>
                      </div>
                      <button
                        onClick={() => handleSettingToggle(setting.key)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings[setting.key] 
                            ? `bg-gradient-to-r from-${group.color}-400 to-${group.color}-600` 
                            : 'bg-white/20'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings[setting.key] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Account Actions */}
        <div className="bg-white/5 rounded-xl p-6 mt-6">
          <h4 className="font-semibold text-white mb-4">Account Actions</h4>
          <div className="space-y-3">
            <button className="w-full text-left bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-white">Change Password</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>
            <button className="w-full text-left bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-white">Download My Data</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>
            <button className="w-full text-left bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-white">Privacy Policy</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>
            <button className="w-full text-left bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-white">Terms of Service</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mt-6">
          <h4 className="font-semibold text-red-400 mb-4">Danger Zone</h4>
          <div className="space-y-3">
            <button className="w-full text-left bg-red-500/10 rounded-lg p-3 hover:bg-red-500/20 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-red-400 font-medium">Delete Account</span>
                  <p className="text-sm text-red-400/70 mt-1">Permanently delete your account and all data</p>
                </div>
                <ChevronRight className="w-4 h-4 text-red-400" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientSettings;