import React, { useState, useEffect } from 'react'
import { Calendar, Clock, User, CheckCircle, XCircle, MessageSquare } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const Bookings = () => {
  const { user, api } = useAuth()
  const [bookings, setBookings] = useState([])
  const [counselors, setCounselors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [formData, setFormData] = useState({
    counselor: '',
    preferredDate: '',
    preferredTime: '',
    reason: '',
    notes: ''
  })

  useEffect(() => {
    console.log('User in Bookings:', user)
    console.log('Auth token:', localStorage.getItem('token'))
    
    fetchBookings()
    if (user?.role === 'student') {
      console.log('Fetching counselors...')
      fetchCounselors()
    } else {
      console.log('User is not a student, not fetching counselors')
    }
  }, [user])

  const fetchBookings = async () => {
    try {
      // Add /api prefix to match the backend route
      const response = await api.get('/api/bookings')
      // Handle both response formats: response.data.bookings and response.data directly
      const bookingsData = response.data.bookings || response.data || []
      setBookings(Array.isArray(bookingsData) ? bookingsData : [])
    } catch (error) {
      console.error('Bookings fetch error:', error)
      setBookings([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const fetchCounselors = async () => {
    try {
      console.log('Fetching counselors...')
      // Add /api prefix to match the backend route
      const response = await api.get('/api/bookings/counselors')
      console.log('Raw API response:', response)
      console.log('Response data:', response.data)
      console.log('Response data type:', typeof response.data)
      console.log('Response data keys:', Object.keys(response.data))
      
      // Check if we have a counselors array in the response
      let counselorsList = [];
      if (Array.isArray(response.data)) {
        counselorsList = response.data;
      } else if (response.data && Array.isArray(response.data.counselors)) {
        counselorsList = response.data.counselors;
      }
      
      console.log('Processed counselors list:', counselorsList)
      setCounselors(counselorsList)
    } catch (error) {
      console.error('Counselors fetch error:', error)
      // Only show error if it's a real error, not empty data
      if (error.response?.status !== 404) {
        toast.error('Failed to load counselors')
      }
    }
  }

  const validateForm = () => {
    if (!formData.counselor) {
      toast.error('Please select a counselor')
      return false
    }
    if (!formData.preferredDate) {
      toast.error('Please select a date')
      return false
    }
    if (!formData.preferredTime) {
      toast.error('Please select a time')
      return false
    }
    if (!formData.reason) {
      toast.error('Please select a reason for the session')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form before submission
    if (!validateForm()) {
      return
    }

    try {
      // Map form data to match backend expectations
      const bookingData = {
        counselor: formData.counselor,
        sessionDate: formData.preferredDate,
        sessionTime: formData.preferredTime,
        reason: formData.reason,
        notes: formData.notes || '',
        urgency: 'medium',
        type: 'individual'
      }
      
      await api.post('/bookings', bookingData)
      toast.success('Booking request submitted successfully!')
      setShowBookingForm(false)
      setFormData({
        counselor: '',
        preferredDate: '',
        preferredTime: '',
        reason: '',
        notes: ''
      })
      fetchBookings()
    } catch (error) {
      console.error('Booking error:', error)
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         'Failed to create booking. Please try again.'
      toast.error(errorMessage)
    }
  }

  const handleStatusUpdate = async (bookingId, status) => {
    try {
      await api.patch(`/bookings/${bookingId}`, { status })
      toast.success(`Booking ${status.toLowerCase()} successfully`)
      fetchBookings()
    } catch (error) {
      toast.error('Failed to update booking status')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50'
      case 'rejected': return 'text-red-600 bg-red-50'
      case 'completed': return 'text-blue-600 bg-blue-50'
      default: return 'text-yellow-600 bg-yellow-50'
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-900 dark:to-neutral-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-neutral-800 dark:text-neutral-100 mb-2">
              Counseling Sessions
            </h1>
            <p className="text-neutral-600 dark:text-neutral-300">
              {user?.role === 'student' ? 'Book and manage your counseling appointments' : 'Manage your counseling schedule'}
            </p>
          </div>
          
          {user?.role === 'student' && (
            <button
              onClick={() => setShowBookingForm(true)}
              className="btn-primary"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book Session
            </button>
          )}
        </div>

        {/* Booking Form Modal */}
        {showBookingForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Book a Session</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Counselor
                  </label>
                  <select
                    value={formData.counselor}
                    onChange={(e) => setFormData({...formData, counselor: e.target.value})}
                    className="input-field"
                    required
                  >
                    <option value="">Select a counselor</option>
                    {counselors.map(counselor => (
                      <option key={counselor._id} value={counselor._id}>
                        {counselor.name} - {counselor.profile?.specialization || 'General Counseling'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({...formData, preferredDate: e.target.value})}
                    className="input-field"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Preferred Time
                  </label>
                  <select
                    value={formData.preferredTime}
                    onChange={(e) => setFormData({...formData, preferredTime: e.target.value})}
                    className="input-field"
                    required
                  >
                    <option value="">Select time</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Reason for Session
                  </label>
                  <select
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    className="input-field"
                    required
                  >
                    <option value="">Select reason</option>
                    <option value="anxiety">Anxiety Support</option>
                    <option value="depression">Depression Support</option>
                    <option value="stress">Stress Management</option>
                    <option value="academic">Academic Pressure</option>
                    <option value="relationships">Relationship Issues</option>
                    <option value="general">General Counseling</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="input-field"
                    rows="3"
                    placeholder="Any specific topics you'd like to discuss..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="btn-outline flex-1"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    Book Session
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bookings List */}
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-600 mb-2">
                No bookings yet
              </h3>
              <p className="text-neutral-500">
                {user?.role === 'student' 
                  ? 'Book your first counseling session to get started'
                  : 'No sessions scheduled at the moment'
                }
              </p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div key={booking._id} className="card-hover">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <User className="w-5 h-5 text-neutral-500" />
                      <span className="font-medium">
                        {user?.role === 'student' 
                          ? booking.counselor?.name 
                          : booking.student?.name
                        }
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-neutral-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(booking.preferredDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {booking.preferredTime}
                      </div>
                    </div>

                    <p className="text-sm text-neutral-600 mb-1">
                      <strong>Reason:</strong> {booking.reason}
                    </p>
                    
                    {booking.notes && (
                      <p className="text-sm text-neutral-600">
                        <strong>Notes:</strong> {booking.notes}
                      </p>
                    )}
                  </div>

                  {user?.role === 'Counselor' && booking.status === 'pending' && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleStatusUpdate(booking._id, 'approved')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Approve"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(booking._id, 'rejected')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Reject"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                {booking.feedback && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Session Feedback</span>
                    </div>
                    <p className="text-sm text-blue-700">{booking.feedback}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Bookings
