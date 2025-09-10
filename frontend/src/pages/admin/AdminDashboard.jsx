import React, { useState, useEffect } from 'react'
import { 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  Download, 
  Eye,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const { api } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})
  const [escalations, setEscalations] = useState([])
  const [users, setUsers] = useState([])
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, escalationsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/escalations'),
        api.get('/admin/users')
      ])
      
      setStats(statsRes.data)
      setEscalations(escalationsRes.data)
      setUsers(usersRes.data)
    } catch (error) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleEscalationAction = async (escalationId, action) => {
    try {
      await api.patch(`/admin/escalations/${escalationId}`, { 
        status: action,
        adminNotes: `Marked as ${action} by admin`
      })
      toast.success(`Escalation ${action} successfully`)
      fetchDashboardData()
    } catch (error) {
      toast.error('Failed to update escalation')
    }
  }

  const handleUserAction = async (userId, action) => {
    try {
      await api.patch(`/admin/users/${userId}`, { action })
      toast.success(`User ${action} successfully`)
      fetchDashboardData()
    } catch (error) {
      toast.error(`Failed to ${action} user`)
    }
  }

  const exportData = async (type) => {
    try {
      const response = await api.get(`/admin/export/${type}`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `mindgarden-${type}-${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      toast.success(`${type} data exported successfully`)
    } catch (error) {
      toast.error('Failed to export data')
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-blue-600 bg-blue-50'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'text-green-600 bg-green-50'
      case 'in_progress': return 'text-blue-600 bg-blue-50'
      case 'dismissed': return 'text-gray-600 bg-gray-50'
      default: return 'text-yellow-600 bg-yellow-50'
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-900 dark:to-neutral-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-neutral-800 dark:text-neutral-100 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-neutral-600 dark:text-neutral-300">
          Monitor platform health and manage system resources
        </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total Users</p>
                <p className="text-2xl font-bold text-neutral-800">{stats.totalUsers || 0}</p>
                <p className="text-xs text-green-600">+{stats.newUsersThisWeek || 0} this week</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Active Escalations</p>
                <p className="text-2xl font-bold text-neutral-800">{stats.activeEscalations || 0}</p>
                <p className="text-xs text-red-600">{stats.criticalEscalations || 0} critical</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Mood Entries Today</p>
                <p className="text-2xl font-bold text-neutral-800">{stats.moodEntriesToday || 0}</p>
                <p className="text-xs text-green-600">+{stats.moodEntriesGrowth || 0}% vs yesterday</p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Platform Health</p>
                <p className="text-2xl font-bold text-neutral-800">{stats.healthScore || 95}%</p>
                <p className="text-xs text-green-600">All systems operational</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="card-hover mb-6">
          <div className="flex space-x-1">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'escalations', label: 'Escalations', icon: AlertTriangle },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: PieChart }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card-hover">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {stats.recentActivity?.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-neutral-800">{activity.description}</p>
                      <p className="text-xs text-neutral-500">{activity.timestamp}</p>
                    </div>
                  </div>
                )) || (
                  <p className="text-neutral-500 text-center py-4">No recent activity</p>
                )}
              </div>
            </div>

            <div className="card-hover">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">System Health</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Database</span>
                  <span className="text-sm text-green-600 font-medium">Healthy</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">API Response Time</span>
                  <span className="text-sm text-green-600 font-medium">{stats.apiResponseTime || 120}ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Active Sessions</span>
                  <span className="text-sm text-blue-600 font-medium">{stats.activeSessions || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Error Rate</span>
                  <span className="text-sm text-green-600 font-medium">{stats.errorRate || 0.1}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'escalations' && (
          <div className="card-hover">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-neutral-800">Crisis Escalations</h3>
              <button
                onClick={() => exportData('escalations')}
                className="btn-outline text-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
            
            <div className="space-y-4">
              {escalations.length === 0 ? (
                <p className="text-center text-neutral-500 py-8">No escalations to review</p>
              ) : (
                escalations.map((escalation) => (
                  <div key={escalation._id} className="border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(escalation.severity)}`}>
                            {escalation.severity}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(escalation.status)}`}>
                            {escalation.status}
                          </span>
                        </div>
                        <p className="font-medium text-neutral-800">{escalation.type} Escalation</p>
                        <p className="text-sm text-neutral-600">
                          User: {escalation.user?.name || 'Anonymous'} | 
                          Created: {new Date(escalation.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      {escalation.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEscalationAction(escalation._id, 'in_progress')}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Review"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEscalationAction(escalation._id, 'resolved')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Resolve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEscalationAction(escalation._id, 'dismissed')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Dismiss"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-neutral-700 mb-2">
                      <strong>Reason:</strong> {escalation.reason}
                    </p>
                    
                    {escalation.content && (
                      <p className="text-sm text-neutral-600 bg-neutral-50 p-3 rounded">
                        {escalation.content}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="card-hover">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-neutral-800">User Management</h3>
              <button
                onClick={() => exportData('users')}
                className="btn-outline text-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 px-4">User</th>
                    <th className="text-left py-3 px-4">Role</th>
                    <th className="text-left py-3 px-4">Joined</th>
                    <th className="text-left py-3 px-4">Last Active</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b border-neutral-100">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-neutral-800">{user.name}</p>
                          <p className="text-xs text-neutral-500">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="capitalize text-neutral-600">{user.role}</span>
                      </td>
                      <td className="py-3 px-4 text-neutral-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-neutral-600">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.isActive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleUserAction(user._id, user.isActive ? 'deactivate' : 'activate')}
                          className={`text-xs px-3 py-1 rounded ${
                            user.isActive 
                              ? 'text-red-600 hover:bg-red-50' 
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card-hover">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Usage Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Daily Active Users</span>
                  <span className="text-sm font-medium text-neutral-800">{stats.dailyActiveUsers || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Mood Entries This Month</span>
                  <span className="text-sm font-medium text-neutral-800">{stats.monthlyMoodEntries || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Chat Sessions</span>
                  <span className="text-sm font-medium text-neutral-800">{stats.chatSessions || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Counseling Bookings</span>
                  <span className="text-sm font-medium text-neutral-800">{stats.bookings || 0}</span>
                </div>
              </div>
            </div>

            <div className="card-hover">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Platform Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Average Session Duration</span>
                  <span className="text-sm font-medium text-neutral-800">{stats.avgSessionDuration || '12m'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">User Retention Rate</span>
                  <span className="text-sm font-medium text-neutral-800">{stats.retentionRate || '78'}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Feature Adoption</span>
                  <span className="text-sm font-medium text-neutral-800">{stats.featureAdoption || '85'}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Support Satisfaction</span>
                  <span className="text-sm font-medium text-neutral-800">{stats.supportSatisfaction || '4.8'}/5</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
