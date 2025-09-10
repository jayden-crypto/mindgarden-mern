import React, { useState, useEffect } from 'react'
import { 
  Calendar, 
  Users, 
  Clock, 
  MessageSquare, 
  TrendingUp, 
  CheckCircle,
  AlertTriangle,
  FileText,
  Phone
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const CounselorDashboard = () => {
  const { api } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})
  const [bookings, setBookings] = useState([])
  const [escalations, setEscalations] = useState([])
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, bookingsRes, escalationsRes] = await Promise.all([
        api.get('/bookings/counselor/stats'),
        api.get('/bookings'),
        api.get('/admin/escalations?counselor=true')
      ])
      
      setStats(statsRes.data)
      setBookings(bookingsRes.data)
      setEscalations(escalationsRes.data)
    } catch (error) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleBookingAction = async (bookingId, action) => {
    try {
      await api.patch(`/bookings/${bookingId}`, { status: action })
      toast.success(`Booking ${action} successfully`)
      fetchDashboardData()
    } catch (error) {
      toast.error('Failed to update booking')
    }
  }

  const handleEscalationReview = async (escalationId, notes) => {
    try {
      await api.patch(`/admin/escalations/${escalationId}`, { 
        status: 'in_progress',
        counselorNotes: notes
      })
      toast.success('Escalation reviewed successfully')
      fetchDashboardData()
    } catch (error) {
      toast.error('Failed to review escalation')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50'
      case 'completed': return 'text-blue-600 bg-blue-50'
      case 'rejected': return 'text-red-600 bg-red-50'
      default: return 'text-yellow-600 bg-yellow-50'
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

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-neutral-800 mb-2">
            Counselor Dashboard
          </h1>
          <p className="text-neutral-600">
            Manage your sessions, review escalations, and support students
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total Students</p>
                <p className="text-2xl font-bold text-neutral-800">{stats.totalStudents || 0}</p>
                <p className="text-xs text-green-600">Active clients</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Pending Bookings</p>
                <p className="text-2xl font-bold text-neutral-800">{stats.pendingBookings || 0}</p>
                <p className="text-xs text-orange-600">Need approval</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">This Week's Sessions</p>
                <p className="text-2xl font-bold text-neutral-800">{stats.weekSessions || 0}</p>
                <p className="text-xs text-blue-600">{stats.completedSessions || 0} completed</p>
              </div>
              <Clock className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Escalations</p>
                <p className="text-2xl font-bold text-neutral-800">{stats.activeEscalations || 0}</p>
                <p className="text-xs text-red-600">{stats.criticalEscalations || 0} critical</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="card-hover mb-6">
          <div className="flex space-x-1">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'bookings', label: 'Bookings', icon: Calendar },
              { id: 'escalations', label: 'Escalations', icon: AlertTriangle },
              { id: 'students', label: 'Students', icon: Users }
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
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Today's Schedule</h3>
              <div className="space-y-3">
                {bookings.filter(b => b.status === 'approved').slice(0, 5).map((booking) => (
                  <div key={booking._id} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <div className="flex-1">
                      <p className="font-medium text-neutral-800">{booking.preferredTime}</p>
                      <p className="text-sm text-neutral-600">
                        {booking.student?.name} - {booking.reason}
                      </p>
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-800">
                      Join Session
                    </button>
                  </div>
                )) || (
                  <p className="text-neutral-500 text-center py-4">No sessions scheduled for today</p>
                )}
              </div>
            </div>

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
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="card-hover">
            <h3 className="text-lg font-semibold text-neutral-800 mb-6">Session Bookings</h3>
            
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <p className="text-center text-neutral-500 py-8">No bookings available</p>
              ) : (
                bookings.map((booking) => (
                  <div key={booking._id} className="border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                        <p className="font-medium text-neutral-800">{booking.student?.name}</p>
                        <p className="text-sm text-neutral-600">
                          {new Date(booking.preferredDate).toLocaleDateString()} at {booking.preferredTime}
                        </p>
                      </div>
                      
                      {booking.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleBookingAction(booking._id, 'approved')}
                            className="btn-primary text-sm px-4 py-2"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleBookingAction(booking._id, 'rejected')}
                            className="btn-outline text-sm px-4 py-2"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-neutral-700 mb-2">
                      <strong>Reason:</strong> {booking.reason}
                    </p>
                    
                    {booking.notes && (
                      <p className="text-sm text-neutral-600 bg-neutral-50 p-3 rounded">
                        <strong>Notes:</strong> {booking.notes}
                      </p>
                    )}

                    {booking.status === 'approved' && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-neutral-100">
                        <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
                          <Phone className="w-4 h-4" />
                          Start Video Call
                        </button>
                        <button className="flex items-center gap-2 text-sm text-green-600 hover:text-green-800">
                          <CheckCircle className="w-4 h-4" />
                          Mark Complete
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'escalations' && (
          <div className="card-hover">
            <h3 className="text-lg font-semibold text-neutral-800 mb-6">Crisis Escalations</h3>
            
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
                        </div>
                        <p className="font-medium text-neutral-800">{escalation.type} Escalation</p>
                        <p className="text-sm text-neutral-600">
                          Student: {escalation.user?.name || 'Anonymous'} | 
                          Created: {new Date(escalation.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      {escalation.status === 'pending' && (
                        <button
                          onClick={() => handleEscalationReview(escalation._id, 'Reviewed by counselor')}
                          className="btn-primary text-sm px-4 py-2"
                        >
                          Review
                        </button>
                      )}
                    </div>
                    
                    <p className="text-sm text-neutral-700 mb-2">
                      <strong>Reason:</strong> {escalation.reason}
                    </p>
                    
                    {escalation.content && (
                      <p className="text-sm text-neutral-600 bg-neutral-50 p-3 rounded mb-3">
                        {escalation.content}
                      </p>
                    )}

                    {escalation.counselorNotes && (
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm font-medium text-blue-800 mb-1">Counselor Notes:</p>
                        <p className="text-sm text-blue-700">{escalation.counselorNotes}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="card-hover">
            <h3 className="text-lg font-semibold text-neutral-800 mb-6">My Students</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.students?.map((student) => (
                <div key={student._id} className="border border-neutral-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-800">{student.name}</p>
                      <p className="text-sm text-neutral-600">{student.profile?.course || 'Student'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-neutral-600">
                    <div className="flex justify-between">
                      <span>Sessions:</span>
                      <span className="font-medium">{student.sessionCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Session:</span>
                      <span className="font-medium">
                        {student.lastSession ? new Date(student.lastSession).toLocaleDateString() : 'None'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Progress:</span>
                      <span className="font-medium text-green-600">Good</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-3 border-t border-neutral-100">
                    <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
                      <MessageSquare className="w-4 h-4" />
                      Message
                    </button>
                    <button className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800">
                      <FileText className="w-4 h-4" />
                      Notes
                    </button>
                  </div>
                </div>
              )) || (
                <div className="col-span-full text-center text-neutral-500 py-8">
                  No students assigned yet
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 card-hover border-l-4 border-blue-500">
          <h3 className="font-semibold text-blue-800 mb-2">
            📋 Counselor Resources
          </h3>
          <ul className="text-sm text-neutral-600 space-y-1">
            <li>• Review pending session requests in the Bookings tab</li>
            <li>• Monitor crisis escalations for immediate attention</li>
            <li>• Keep session notes and track student progress</li>
            <li>• Use video calling for remote sessions</li>
            <li>• Contact admin for urgent cases or technical support</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default CounselorDashboard
