import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { 
  Heart, 
  MessageCircle, 
  Calendar, 
  BookOpen, 
  Users, 
  Flower2, 
  TrendingUp,
  Award,
  Clock,
  AlertTriangle,
  Plus
} from 'lucide-react'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentMoods, setRecentMoods] = useState([])
  const [upcomingBookings, setUpcomingBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [moodResponse, bookingResponse, gardenResponse] = await Promise.all([
        axios.get('/api/moods?limit=5'),
        axios.get('/api/bookings?limit=3'),
        axios.get('/api/garden')
      ])

      setRecentMoods(moodResponse.data.moods)
      setUpcomingBookings(bookingResponse.data.bookings.filter(b => 
        b.status === 'approved' && new Date(b.sessionDate) > new Date()
      ))
      setStats({
        garden: gardenResponse.data.garden,
        totalMoods: moodResponse.data.total,
        totalBookings: bookingResponse.data.total
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMoodEmoji = (mood) => {
    const emojiMap = {
      very_happy: '😄',
      happy: '😊',
      neutral: '😐',
      sad: '😢',
      very_sad: '😭',
      anxious: '😰',
      stressed: '😤',
      angry: '😠'
    }
    return emojiMap[mood] || '😐'
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) {
    return <LoadingSpinner text="Loading your dashboard..." />
  }

  const quickActions = [
    {
      title: 'Log Mood',
      description: 'Track how you\'re feeling today',
      icon: Heart,
      color: 'bg-red-500',
      link: '/mood',
      action: 'Log Now'
    },
    {
      title: 'Chat with AI',
      description: 'Get instant support and guidance',
      icon: MessageCircle,
      color: 'bg-blue-500',
      link: '/chat',
      action: 'Start Chat'
    },
    {
      title: 'Book Session',
      description: 'Schedule with a counselor',
      icon: Calendar,
      color: 'bg-green-500',
      link: '/bookings',
      action: 'Book Now'
    },
    {
      title: 'Explore Resources',
      description: 'Find helpful articles and tools',
      icon: BookOpen,
      color: 'bg-purple-500',
      link: '/resources',
      action: 'Explore'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-900 dark:to-neutral-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-neutral-800 dark:text-neutral-100 mb-2">
            {getGreeting()}, {user?.name}! 👋
          </h1>
          <p className="text-neutral-600 dark:text-neutral-300">
            Welcome to your wellness dashboard. How are you feeling today?
          </p>
        </div>

        {/* Garden Stats */}
        {stats?.garden && (
          <div className="card mb-8 bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2 flex items-center">
                  <Flower2 className="w-6 h-6 mr-2" />
                  Your Wellness Garden
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-2xl font-bold">{stats.garden.level}</div>
                    <div className="text-primary-100 text-sm">Level</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.garden.points}</div>
                    <div className="text-primary-100 text-sm">Points</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.garden.streak}</div>
                    <div className="text-primary-100 text-sm">Day Streak</div>
                  </div>
                </div>
              </div>
              <div className="text-6xl opacity-20">
                🌱
              </div>
            </div>
            <Link 
              to="/garden" 
              className="inline-block mt-4 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors duration-200"
            >
              View Garden
            </Link>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <Link
                key={index}
                to={action.link}
                className="card-hover group"
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-800 mb-1">
                      {action.title}
                    </h3>
                    <p className="text-sm text-neutral-600 mb-3">
                      {action.description}
                    </p>
                    <span className="text-sm font-medium text-primary-600 group-hover:text-primary-700">
                      {action.action} →
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Moods */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-neutral-800 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
                Recent Moods
              </h2>
              <Link 
                to="/mood" 
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View All
              </Link>
            </div>

            {recentMoods.length > 0 ? (
              <div className="space-y-3">
                {recentMoods.map((mood, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getMoodEmoji(mood.mood)}</span>
                      <div>
                        <div className="font-medium text-neutral-800 capitalize">
                          {mood.mood.replace('_', ' ')}
                        </div>
                        <div className="text-sm text-neutral-600">
                          Intensity: {mood.intensity}/10
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-neutral-500">
                      {new Date(mood.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 px-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 rounded-lg border border-red-100 dark:border-red-800/30">
                <Heart className="w-10 h-10 text-red-400 dark:text-red-500 mx-auto mb-3" />
                <h3 className="font-medium text-neutral-800 dark:text-neutral-100 mb-2">No mood entries yet</h3>
                <p className="text-neutral-600 dark:text-neutral-300 text-sm mb-4">Start tracking your mood to see patterns and insights</p>
                <Link 
                  to="/mood" 
                  className="inline-flex items-center justify-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Log Your First Mood
                </Link>
              </div>
            )}
          </div>

          {/* Upcoming Bookings */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-neutral-800 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-secondary-600" />
                Upcoming Sessions
              </h2>
              <Link 
                to="/bookings" 
                className="text-sm text-secondary-600 hover:text-secondary-700 font-medium"
              >
                View All
              </Link>
            </div>

            {upcomingBookings.length > 0 ? (
              <div className="space-y-3">
                {upcomingBookings.map((booking, index) => (
                  <div key={index} className="p-4 border border-neutral-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-neutral-800">
                          Session with {booking.counselor?.name}
                        </div>
                        <div className="text-sm text-neutral-600 mt-1">
                          {new Date(booking.sessionDate).toLocaleDateString()} at {booking.sessionTime}
                        </div>
                        <div className="text-sm text-neutral-500 mt-1">
                          {booking.type} • {booking.mode}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-green-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">Confirmed</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 px-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 rounded-lg border border-green-100 dark:border-green-800/30">
                <Calendar className="w-10 h-10 text-green-400 dark:text-green-500 mx-auto mb-3" />
                <h3 className="font-medium text-neutral-800 dark:text-neutral-100 mb-2">No upcoming sessions</h3>
                <p className="text-neutral-600 dark:text-neutral-300 text-sm mb-4">Book a session with one of our professional counselors</p>
                <Link 
                  to="/bookings" 
                  className="inline-flex items-center justify-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Book a Session
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Community */}
          <Link to="/community" className="card-hover">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-800 mb-1">
                  Join the Community
                </h3>
                <p className="text-sm text-neutral-600">
                  Connect with peers and share your journey anonymously
                </p>
              </div>
            </div>
          </Link>

          {/* Resources */}
          <Link to="/resources" className="card-hover">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-800 mb-1">
                  Wellness Resources
                </h3>
                <p className="text-sm text-neutral-600">
                  Explore articles, videos, and tools for mental health
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Emergency Banner */}
        <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-800 mb-1">Need Immediate Help?</h3>
              <p className="text-sm text-red-700 mb-3">
                If you're experiencing a mental health emergency, please reach out for immediate support.
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <a href="tel:988" className="text-red-800 font-medium hover:underline">
                  🆘 Suicide Prevention: 988
                </a>
                <a href="tel:911" className="text-red-800 font-medium hover:underline">
                  🚨 Emergency: 911
                </a>
                <a href="sms:741741" className="text-red-800 font-medium hover:underline">
                  💬 Crisis Text: 741741
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
