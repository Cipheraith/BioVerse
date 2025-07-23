import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Bell,
  Moon,
  Sun,
  Shield,
  Database,
  Smartphone,
  Mail,
  Save,
  Eye,
  EyeOff,
  Settings as SettingsIcon
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  language: string;
  timezone: string;
}

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Profile settings
  const [profile, setProfile] = useState<UserProfile>({
    name: user?.name || 'Admin User',
    email: user?.email || 'admin@bioverse.com',
    phone: '+260-123-456789',
    language: 'en',
    timezone: 'Africa/Lusaka'
  });
  
  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsAlerts: false,
    appointmentReminders: true,
    emergencyAlerts: true,
    weeklyReports: true,
    marketingEmails: false
  });
  
  // Appearance settings
  const [appearance, setAppearance] = useState({
    darkMode: false,
    fontSize: 'medium',
    compactMode: false,
    animations: true
  });
  
  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    dataSharing: false,
    analyticsOptIn: true,
    locationTracking: true
  });
  
  // Security settings
  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: 30,
    dataEncryption: true
  });
  
  const [showPassword, setShowPassword] = useState(false);
  
  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  
  const ToggleSwitch: React.FC<{ enabled: boolean; onToggle: () => void; disabled?: boolean }> = ({ 
    enabled, 
    onToggle, 
    disabled = false 
  }) => (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
        enabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
  
  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: appearance.darkMode ? Moon : Sun },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'security', label: 'Security', icon: Database }
  ];
  
  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 p-4 bg-background dark:bg-dark-background rounded-lg">
        <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-bold">
          {profile.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-text dark:text-dark-text">{profile.name}</h3>
          <p className="text-muted dark:text-dark-muted">{user?.role || 'Administrator'}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text dark:text-dark-text mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({...profile, name: e.target.value})}
            className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-lg bg-background dark:bg-dark-background text-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text dark:text-dark-text mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({...profile, email: e.target.value})}
            className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-lg bg-background dark:bg-dark-background text-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text dark:text-dark-text mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => setProfile({...profile, phone: e.target.value})}
            className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-lg bg-background dark:bg-dark-background text-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text dark:text-dark-text mb-2">
            Language
          </label>
          <select
            value={profile.language}
            onChange={(e) => setProfile({...profile, language: e.target.value})}
            className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-lg bg-background dark:bg-dark-background text-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="en">English</option>
            <option value="bem">Bemba</option>
            <option value="ny">Nyanja</option>
            <option value="loz">Lozi</option>
          </select>
        </div>
      </div>
    </div>
  );
  
  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text dark:text-dark-text flex items-center">
          <Mail className="mr-2" size={20} />
          Email Notifications
        </h3>
        
        <div className="space-y-3 pl-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text dark:text-dark-text">Email notifications</p>
              <p className="text-sm text-muted dark:text-dark-muted">Receive updates via email</p>
            </div>
            <ToggleSwitch
              enabled={notifications.emailNotifications}
              onToggle={() => setNotifications({...notifications, emailNotifications: !notifications.emailNotifications})}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text dark:text-dark-text">Weekly reports</p>
              <p className="text-sm text-muted dark:text-dark-muted">Get weekly health system summaries</p>
            </div>
            <ToggleSwitch
              enabled={notifications.weeklyReports}
              onToggle={() => setNotifications({...notifications, weeklyReports: !notifications.weeklyReports})}
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text dark:text-dark-text flex items-center">
          <Smartphone className="mr-2" size={20} />
          Push Notifications
        </h3>
        
        <div className="space-y-3 pl-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text dark:text-dark-text">Push notifications</p>
              <p className="text-sm text-muted dark:text-dark-muted">Browser notifications for urgent updates</p>
            </div>
            <ToggleSwitch
              enabled={notifications.pushNotifications}
              onToggle={() => setNotifications({...notifications, pushNotifications: !notifications.pushNotifications})}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text dark:text-dark-text">Emergency alerts</p>
              <p className="text-sm text-muted dark:text-dark-muted">Critical health system alerts</p>
            </div>
            <ToggleSwitch
              enabled={notifications.emergencyAlerts}
              onToggle={() => setNotifications({...notifications, emergencyAlerts: !notifications.emergencyAlerts})}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text dark:text-dark-text">Appointment reminders</p>
              <p className="text-sm text-muted dark:text-dark-muted">Remind about upcoming appointments</p>
            </div>
            <ToggleSwitch
              enabled={notifications.appointmentReminders}
              onToggle={() => setNotifications({...notifications, appointmentReminders: !notifications.appointmentReminders})}
            />
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-background dark:bg-dark-background rounded-lg">
        <div className="flex items-center space-x-3">
          {appearance.darkMode ? <Moon size={20} /> : <Sun size={20} />}
          <div>
            <p className="font-medium text-text dark:text-dark-text">Dark Mode</p>
            <p className="text-sm text-muted dark:text-dark-muted">Switch between light and dark themes</p>
          </div>
        </div>
        <ToggleSwitch
          enabled={appearance.darkMode}
          onToggle={() => setAppearance({...appearance, darkMode: !appearance.darkMode})}
        />
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text dark:text-dark-text mb-2">
            Font Size
          </label>
          <select
            value={appearance.fontSize}
            onChange={(e) => setAppearance({...appearance, fontSize: e.target.value})}
            className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-lg bg-background dark:bg-dark-background text-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-text dark:text-dark-text">Compact Mode</p>
            <p className="text-sm text-muted dark:text-dark-muted">Reduce spacing for more content</p>
          </div>
          <ToggleSwitch
            enabled={appearance.compactMode}
            onToggle={() => setAppearance({...appearance, compactMode: !appearance.compactMode})}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-text dark:text-dark-text">Animations</p>
            <p className="text-sm text-muted dark:text-dark-muted">Enable interface animations</p>
          </div>
          <ToggleSwitch
            enabled={appearance.animations}
            onToggle={() => setAppearance({...appearance, animations: !appearance.animations})}
          />
        </div>
      </div>
    </div>
  );
  
  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-text dark:text-dark-text">Profile Visibility</p>
            <p className="text-sm text-muted dark:text-dark-muted">Allow others to see your profile</p>
          </div>
          <ToggleSwitch
            enabled={privacy.profileVisible}
            onToggle={() => setPrivacy({...privacy, profileVisible: !privacy.profileVisible})}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-text dark:text-dark-text">Data Sharing</p>
            <p className="text-sm text-muted dark:text-dark-muted">Share anonymized data for research</p>
          </div>
          <ToggleSwitch
            enabled={privacy.dataSharing}
            onToggle={() => setPrivacy({...privacy, dataSharing: !privacy.dataSharing})}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-text dark:text-dark-text">Analytics</p>
            <p className="text-sm text-muted dark:text-dark-muted">Help improve the platform</p>
          </div>
          <ToggleSwitch
            enabled={privacy.analyticsOptIn}
            onToggle={() => setPrivacy({...privacy, analyticsOptIn: !privacy.analyticsOptIn})}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-text dark:text-dark-text">Location Tracking</p>
            <p className="text-sm text-muted dark:text-dark-muted">Allow location-based features</p>
          </div>
          <ToggleSwitch
            enabled={privacy.locationTracking}
            onToggle={() => setPrivacy({...privacy, locationTracking: !privacy.locationTracking})}
          />
        </div>
      </div>
    </div>
  );
  
  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-text dark:text-dark-text">Two-Factor Authentication</p>
            <p className="text-sm text-muted dark:text-dark-muted">Add extra security to your account</p>
          </div>
          <ToggleSwitch
            enabled={security.twoFactorAuth}
            onToggle={() => setSecurity({...security, twoFactorAuth: !security.twoFactorAuth})}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-text dark:text-dark-text">Login Alerts</p>
            <p className="text-sm text-muted dark:text-dark-muted">Get notified of new logins</p>
          </div>
          <ToggleSwitch
            enabled={security.loginAlerts}
            onToggle={() => setSecurity({...security, loginAlerts: !security.loginAlerts})}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text dark:text-dark-text mb-2">
            Session Timeout (minutes)
          </label>
          <input
            type="number"
            value={security.sessionTimeout}
            onChange={(e) => setSecurity({...security, sessionTimeout: parseInt(e.target.value)})}
            min="5"
            max="120"
            className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-lg bg-background dark:bg-dark-background text-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        
        <div className="p-4 bg-background dark:bg-dark-background rounded-lg">
          <h4 className="font-medium text-text dark:text-dark-text mb-2">Change Password</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-muted dark:text-dark-muted mb-1">Current Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-lg bg-card dark:bg-dark-card text-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-500 pr-10"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted dark:text-dark-muted"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-muted dark:text-dark-muted mb-1">New Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-lg bg-card dark:bg-dark-card text-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-sm text-muted dark:text-dark-muted mb-1">Confirm Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-lg bg-card dark:bg-dark-card text-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Confirm new password"
              />
            </div>
            <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-6xl mx-auto w-full"
    >
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-text dark:text-dark-text mb-2 flex flex-col sm:flex-row items-start sm:items-center">
          <SettingsIcon className="mb-2 sm:mb-0 sm:mr-3" size={28} />
          <span className="break-words">Settings</span>
        </h1>
        <p className="text-sm sm:text-base text-muted dark:text-dark-muted">Manage your account preferences and system settings</p>
      </div>
      
      <div className="bg-card dark:bg-dark-card rounded-xl shadow-lg border border-border dark:border-dark-border overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-border dark:border-dark-border">
          <nav className="flex space-x-0 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600 bg-primary-50 dark:bg-primary-950'
                      : 'border-transparent text-muted dark:text-dark-muted hover:text-text dark:hover:text-dark-text hover:border-border dark:hover:border-dark-border'
                  }`}
                >
                  <Icon className="mr-1 sm:mr-2" size={14} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.substring(0, 4)}</span>
                </button>
              );
            })}
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="p-6 sm:p-8">
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'notifications' && renderNotificationsTab()}
          {activeTab === 'appearance' && renderAppearanceTab()}
          {activeTab === 'privacy' && renderPrivacyTab()}
          {activeTab === 'security' && renderSecurityTab()}
        </div>
        
        {/* Save Button */}
        <div className="border-t border-border dark:border-dark-border px-6 sm:px-8 py-4 bg-background dark:bg-dark-background">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted dark:text-dark-muted">
              Changes will be saved automatically
            </p>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center px-6 py-2 rounded-lg font-medium transition-all ${
                saved
                  ? 'bg-green-600 text-white'
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
              } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Save className="mr-2" size={16} />
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPage;
