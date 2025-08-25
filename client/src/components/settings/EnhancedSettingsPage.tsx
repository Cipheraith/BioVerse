import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Bell, Shield, Palette, Globe, Database, 
  Moon, Sun, Monitor, Smartphone, Mail, Lock,
  Eye, EyeOff, Save, RefreshCw, Download,
  Trash2, AlertTriangle, CheckCircle
} from 'lucide-react';

interface SettingsSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, description, icon, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gradient-to-br from-dark-card/80 to-dark-card/60 backdrop-blur-xl p-6 rounded-2xl border border-primary-500/20 shadow-2xl"
  >
    <div className="flex items-center space-x-4 mb-6">
      <div className="p-3 rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-semibold text-dark-text">{title}</h3>
        <p className="text-dark-muted text-sm">{description}</p>
      </div>
    </div>
    {children}
  </motion.div>
);

const EnhancedSettingsPage: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    healthAlerts: true,
    appointments: true,
    systemUpdates: false
  });
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'private',
    dataSharing: false,
    analytics: true,
    locationTracking: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-background via-slate-900 to-dark-background p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-transparent mb-2">
            Settings
          </h1>
          <p className="text-dark-muted text-lg">Customize your BioVerse experience</p>
        </motion.div>

        <div className="space-y-8">
          {/* Profile Settings */}
          <SettingsSection
            title="Profile Settings"
            description="Manage your personal information and account details"
            icon={<User className="w-6 h-6 text-primary-400" />}
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">Full Name</label>
                <input
                  type="text"
                  defaultValue="Sarah Johnson"
                  className="w-full px-4 py-3 bg-dark-background/50 border border-primary-500/20 rounded-xl text-dark-text placeholder-dark-muted focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">Email Address</label>
                <input
                  type="email"
                  defaultValue="sarah.johnson@bioverse.com"
                  className="w-full px-4 py-3 bg-dark-background/50 border border-primary-500/20 rounded-xl text-dark-text placeholder-dark-muted focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">Phone Number</label>
                <input
                  type="tel"
                  defaultValue="+260 97 123 4567"
                  className="w-full px-4 py-3 bg-dark-background/50 border border-primary-500/20 rounded-xl text-dark-text placeholder-dark-muted focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">Date of Birth</label>
                <input
                  type="date"
                  defaultValue="1990-05-15"
                  className="w-full px-4 py-3 bg-dark-background/50 border border-primary-500/20 rounded-xl text-dark-text placeholder-dark-muted focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
                />
              </div>
            </div>
          </SettingsSection>

          {/* Security Settings */}
          <SettingsSection
            title="Security & Privacy"
            description="Protect your account and control your data"
            icon={<Shield className="w-6 h-6 text-secondary-400" />}
          >
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter current password"
                    className="w-full px-4 py-3 pr-12 bg-dark-background/50 border border-primary-500/20 rounded-xl text-dark-text placeholder-dark-muted focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-muted hover:text-primary-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-dark-text mb-2">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 bg-dark-background/50 border border-primary-500/20 rounded-xl text-dark-text placeholder-dark-muted focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-text mb-2">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 bg-dark-background/50 border border-primary-500/20 rounded-xl text-dark-text placeholder-dark-muted focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-dark-text">Privacy Controls</h4>
                {Object.entries(privacy).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-dark-background/30 rounded-xl border border-primary-500/10">
                    <div>
                      <p className="text-dark-text font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-dark-muted text-sm">
                        {key === 'profileVisibility' && 'Control who can see your profile information'}
                        {key === 'dataSharing' && 'Allow anonymous data sharing for research'}
                        {key === 'analytics' && 'Help improve BioVerse with usage analytics'}
                        {key === 'locationTracking' && 'Enable location-based health services'}
                      </p>
                    </div>
                    {key === 'profileVisibility' ? (
                      <select
                        value={value as string}
                        onChange={(e) => setPrivacy(prev => ({ ...prev, [key]: e.target.value }))}
                        className="px-3 py-2 bg-dark-card border border-primary-500/20 rounded-lg text-dark-text focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                      >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                        <option value="contacts">Contacts Only</option>
                      </select>
                    ) : (
                      <motion.button
                        onClick={() => setPrivacy(prev => ({ ...prev, [key]: !value }))}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                          value ? 'bg-gradient-to-r from-primary-500 to-secondary-500' : 'bg-gray-600'
                        }`}
                        whileTap={{ scale: 0.95 }}
                      >
                        <motion.div
                          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                          animate={{ x: value ? 26 : 2 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      </motion.button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </SettingsSection>

          {/* Notification Settings */}
          <SettingsSection
            title="Notifications"
            description="Choose how you want to be notified"
            icon={<Bell className="w-6 h-6 text-accent-400" />}
          >
            <div className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-dark-background/30 rounded-xl border border-primary-500/10">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-accent-500/20 to-accent-600/20">
                      {key === 'email' && <Mail className="w-4 h-4 text-accent-400" />}
                      {key === 'push' && <Smartphone className="w-4 h-4 text-accent-400" />}
                      {key === 'sms' && <Smartphone className="w-4 h-4 text-accent-400" />}
                      {key === 'healthAlerts' && <AlertTriangle className="w-4 h-4 text-accent-400" />}
                      {key === 'appointments' && <Bell className="w-4 h-4 text-accent-400" />}
                      {key === 'systemUpdates' && <RefreshCw className="w-4 h-4 text-accent-400" />}
                    </div>
                    <div>
                      <p className="text-dark-text font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-dark-muted text-sm">
                        {key === 'email' && 'Receive notifications via email'}
                        {key === 'push' && 'Get push notifications on your devices'}
                        {key === 'sms' && 'Receive SMS notifications'}
                        {key === 'healthAlerts' && 'Critical health alerts and warnings'}
                        {key === 'appointments' && 'Appointment reminders and updates'}
                        {key === 'systemUpdates' && 'System maintenance and feature updates'}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => setNotifications(prev => ({ ...prev, [key]: !value }))}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                      value ? 'bg-gradient-to-r from-primary-500 to-secondary-500' : 'bg-gray-600'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                      animate={{ x: value ? 26 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </motion.button>
                </div>
              ))}
            </div>
          </SettingsSection>

          {/* Appearance Settings */}
          <SettingsSection
            title="Appearance"
            description="Customize the look and feel of BioVerse"
            icon={<Palette className="w-6 h-6 text-purple-400" />}
          >
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-dark-text mb-4">Theme</h4>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: 'light', icon: Sun, label: 'Light' },
                    { value: 'dark', icon: Moon, label: 'Dark' },
                    { value: 'system', icon: Monitor, label: 'System' }
                  ].map(({ value, icon: Icon, label }) => (
                    <motion.button
                      key={value}
                      onClick={() => setTheme(value as any)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        theme === value
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-primary-500/20 bg-dark-background/30 hover:border-primary-500/40'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${
                        theme === value ? 'text-primary-400' : 'text-dark-muted'
                      }`} />
                      <p className={`text-sm font-medium ${
                        theme === value ? 'text-primary-400' : 'text-dark-text'
                      }`}>
                        {label}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </SettingsSection>

          {/* Data Management */}
          <SettingsSection
            title="Data Management"
            description="Control your health data and exports"
            icon={<Database className="w-6 h-6 text-green-400" />}
          >
            <div className="grid md:grid-cols-2 gap-6">
              <motion.button
                className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl hover:border-green-500/40 transition-all duration-300 group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download className="w-8 h-8 text-green-400 mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="text-lg font-semibold text-dark-text mb-2">Export Data</h4>
                <p className="text-dark-muted text-sm">Download all your health data in a secure format</p>
              </motion.button>

              <motion.button
                className="p-6 bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20 rounded-xl hover:border-red-500/40 transition-all duration-300 group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Trash2 className="w-8 h-8 text-red-400 mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="text-lg font-semibold text-dark-text mb-2">Delete Account</h4>
                <p className="text-dark-muted text-sm">Permanently delete your account and all data</p>
              </motion.button>
            </div>
          </SettingsSection>

          {/* Save Button */}
          <motion.div
            className="flex justify-end space-x-4 pt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center space-x-2 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 disabled:opacity-50 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </>
              )}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSettingsPage;