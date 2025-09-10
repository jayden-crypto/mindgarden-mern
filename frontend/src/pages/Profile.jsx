import React, { useState, useEffect } from 'react'
import { User, Mail, Lock, Settings, Bell, Shield, Trash2, Save } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, api, logout } = useAuth()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    profile: {
      age: '',
      gender: '',
      university: '',
      course: '',
      year: ''
    }
  })
  const [preferences, setPreferences] = useState({
    notifications: true,
    privacy: 'private',
    theme: 'light'
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        profile: {
          age: user.profile?.age || '',
          gender: user.profile?.gender || '',
          university: user.profile?.university || '',
          course: user.profile?.course || '',
          year: user.profile?.year || ''
        }
      })
      setPreferences({
        notifications: user.preferences?.notifications ?? true,
        privacy: user.preferences?.privacy || 'private',
        theme: user.preferences?.theme || 'light'
      })
    }
  }, [user])

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.put('/users/profile', profileData)
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePreferencesUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.put('/users/preferences', preferences)
      toast.success('Preferences updated successfully!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update preferences')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    setLoading(true)
    try {
      await api.put('/users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      toast.success('Password changed successfully!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await api.delete('/users/account')
        toast.success('Account deleted successfully')
        logout()
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete account')
      }
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'privacy', label: 'Privacy', icon: Shield }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-900 dark:to-neutral-800 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-neutral-800 dark:text-neutral-100 mb-2">
            Profile Settings
          </h1>
          <p className="text-neutral-600 dark:text-neutral-300">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card-hover">
              <div className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary-600 text-white'
                          : 'text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="card-hover">
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-semibold text-neutral-800 mb-6">
                    Profile Information
                  </h2>
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                          className="input-field"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          className="input-field"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Age
                        </label>
                        <input
                          type="number"
                          value={profileData.profile.age}
                          onChange={(e) => setProfileData({
                            ...profileData, 
                            profile: {...profileData.profile, age: e.target.value}
                          })}
                          className="input-field"
                          min="13"
                          max="100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Gender
                        </label>
                        <select
                          value={profileData.profile.gender}
                          onChange={(e) => setProfileData({
                            ...profileData, 
                            profile: {...profileData.profile, gender: e.target.value}
                          })}
                          className="input-field"
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="non-binary">Non-binary</option>
                          <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          University
                        </label>
                        <input
                          type="text"
                          value={profileData.profile.university}
                          onChange={(e) => setProfileData({
                            ...profileData, 
                            profile: {...profileData.profile, university: e.target.value}
                          })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Course/Major
                        </label>
                        <input
                          type="text"
                          value={profileData.profile.course}
                          onChange={(e) => setProfileData({
                            ...profileData, 
                            profile: {...profileData.profile, course: e.target.value}
                          })}
                          className="input-field"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div>
                  <h2 className="text-xl font-semibold text-neutral-800 mb-6">
                    Preferences
                  </h2>
                  <form onSubmit={handlePreferencesUpdate} className="space-y-6">
                    <div>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={preferences.notifications}
                          onChange={(e) => setPreferences({...preferences, notifications: e.target.checked})}
                          className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                        />
                        <div>
                          <span className="font-medium text-neutral-800">Email Notifications</span>
                          <p className="text-sm text-neutral-600">Receive updates about your wellness journey</p>
                        </div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Privacy Level
                      </label>
                      <select
                        value={preferences.privacy}
                        onChange={(e) => setPreferences({...preferences, privacy: e.target.value})}
                        className="input-field"
                      >
                        <option value="private">Private (Recommended)</option>
                        <option value="public">Public</option>
                      </select>
                      <p className="text-sm text-neutral-500 mt-1">
                        Private mode keeps your garden and progress visible only to you
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Theme
                      </label>
                      <select
                        value={preferences.theme}
                        onChange={(e) => setPreferences({...preferences, theme: e.target.value})}
                        className="input-field"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h2 className="text-xl font-semibold text-neutral-800 mb-6">
                    Security Settings
                  </h2>
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="input-field"
                        minLength="6"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="input-field"
                        minLength="6"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      {loading ? 'Updating...' : 'Change Password'}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div>
                  <h2 className="text-xl font-semibold text-neutral-800 mb-6">
                    Privacy & Data
                  </h2>
                  <div className="space-y-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-medium text-blue-800 mb-2">Data Protection</h3>
                      <p className="text-sm text-blue-700">
                        Your mood entries and personal information are encrypted and stored securely. 
                        We never share your personal data with third parties.
                      </p>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <h3 className="font-medium text-green-800 mb-2">Anonymous Community</h3>
                      <p className="text-sm text-green-700">
                        When participating in the community, you can choose to post anonymously. 
                        Your identity is never revealed without your explicit consent.
                      </p>
                    </div>

                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <h3 className="font-medium text-red-800 mb-2">Delete Account</h3>
                      <p className="text-sm text-red-700 mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <button
                        onClick={handleDeleteAccount}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
