import React, { useState, useEffect } from 'react'
import { Flower2, Trophy, Target, Calendar, Star, TrendingUp } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const Garden = () => {
  const { user, api } = useAuth()
  const [gardenData, setGardenData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGardenData()
  }, [])

  const fetchGardenData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/garden')
      // Ensure we always have an object with default values
      setGardenData({
        plants: [],
        badges: [],
        level: 1,
        points: 0,
        ...(response.data || {})
      })
    } catch (error) {
      console.error('Garden fetch error:', error)
      // Set default garden data on error
      setGardenData({
        plants: [],
        badges: [],
        level: 1,
        points: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const getPlantEmoji = (type, level) => {
    const plants = {
      seedling: ['🌱', '🌿', '🍃'],
      flower: ['🌸', '🌺', '🌻'],
      tree: ['🌳', '🌲', '🎄'],
      fruit: ['🍎', '🍊', '🍇']
    }
    return plants[type]?.[Math.min(level - 1, 2)] || '🌱'
  }

  const getBadgeEmoji = (name) => {
    const badges = {
      'First Steps': '👣',
      'Consistent Tracker': '📅',
      'Week Warrior': '💪',
      'Mood Master': '😊',
      'Chat Champion': '💬',
      'Resource Reader': '📚',
      'Community Helper': '🤝',
      'Wellness Warrior': '🏆'
    }
    return badges[name] || '🏅'
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-900 dark:to-neutral-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-neutral-800 dark:text-neutral-100 mb-2">
            Your Growth Garden 🌱
          </h1>
          <p className="text-neutral-600 dark:text-neutral-300">
            Watch your mental wellness journey bloom into something beautiful
          </p>
        </div>

        {/* Garden Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card-hover text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
              Level {gardenData?.level || 1}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-300">Garden Level</p>
          </div>

          <div className="card-hover text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
              {gardenData?.points || 0}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-300">Growth Points</p>
          </div>

          <div className="card-hover text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
              {gardenData?.streak || 0}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-300">Day Streak</p>
          </div>

          <div className="card-hover text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Flower2 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
              {gardenData?.plants?.length || 0}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-300">Plants Grown</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Garden Visualization */}
          <div className="card-hover">
            <h2 className="text-xl font-semibold text-neutral-800 mb-4 flex items-center gap-2">
              <Flower2 className="w-5 h-5 text-primary-600" />
              Your Garden
            </h2>
            
            <div className="bg-gradient-to-b from-sky-100 to-green-100 rounded-xl p-6 min-h-[300px] relative overflow-hidden">
              {/* Sky and clouds */}
              <div className="absolute top-2 right-4 text-2xl">☀️</div>
              <div className="absolute top-4 left-8 text-xl opacity-70">☁️</div>
              
              {/* Garden ground */}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-green-200 to-transparent rounded-b-xl"></div>
              
              {/* Plants */}
              <div className="absolute bottom-6 left-0 right-0 flex justify-center items-end gap-4 flex-wrap">
                {gardenData?.plants?.length > 0 ? (
                  gardenData.plants.map((plant, index) => (
                    <div key={index} className="text-center">
                      <div className="text-4xl mb-1 animate-bounce-gentle" style={{ animationDelay: `${index * 200}ms` }}>
                        {getPlantEmoji(plant.type, plant.level)}
                      </div>
                      <div className="text-xs text-green-700 font-medium">
                        Lvl {plant.level}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-neutral-500">
                    <div className="text-6xl mb-2">🌱</div>
                    <p className="text-sm">Start your wellness journey to grow your first plant!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Progress to next level */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-neutral-600 mb-1">
                <span>Progress to Level {(gardenData?.level || 1) + 1}</span>
                <span>{gardenData?.points || 0} / {((gardenData?.level || 1) + 1) * 100} points</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(((gardenData?.points || 0) / (((gardenData?.level || 1) + 1) * 100)) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Achievements & Badges */}
          <div className="card-hover">
            <h2 className="text-xl font-semibold text-neutral-800 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              Achievements
            </h2>
            
            <div className="space-y-3">
              {gardenData?.badges?.length > 0 ? (
                gardenData.badges.map((badge, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                    <div className="text-2xl">
                      {getBadgeEmoji(badge.name)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-neutral-800">{badge.name}</h3>
                      <p className="text-sm text-neutral-600">{badge.description}</p>
                      <p className="text-xs text-neutral-500">
                        Earned {new Date(badge.earnedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No badges earned yet</p>
                  <p className="text-sm">Complete wellness activities to earn your first badge!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Wellness Activities */}
        <div className="mt-8 card-hover">
          <h2 className="text-xl font-semibold text-neutral-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Daily Wellness Activities
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">😊</span>
                <span className="text-xs text-blue-600 font-medium">+10 pts</span>
              </div>
              <h3 className="font-medium text-blue-800">Log Your Mood</h3>
              <p className="text-sm text-blue-600">Track how you're feeling today</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">💬</span>
                <span className="text-xs text-green-600 font-medium">+15 pts</span>
              </div>
              <h3 className="font-medium text-green-800">Chat with AI</h3>
              <p className="text-sm text-green-600">Get support when you need it</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">📚</span>
                <span className="text-xs text-purple-600 font-medium">+20 pts</span>
              </div>
              <h3 className="font-medium text-purple-800">Read Resources</h3>
              <p className="text-sm text-purple-600">Learn about mental wellness</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🤝</span>
                <span className="text-xs text-orange-600 font-medium">+25 pts</span>
              </div>
              <h3 className="font-medium text-orange-800">Help Community</h3>
              <p className="text-sm text-orange-600">Support your peers</p>
            </div>
          </div>
        </div>

        {/* Garden Tips */}
        <div className="mt-8 card-hover border-l-4 border-green-500">
          <h3 className="font-semibold text-green-800 mb-2">
            🌱 Garden Growing Tips
          </h3>
          <ul className="text-sm text-neutral-600 space-y-1">
            <li>• Log your mood daily to maintain your streak and earn points</li>
            <li>• Use the AI chat feature when you need support or guidance</li>
            <li>• Read wellness resources to unlock new plants in your garden</li>
            <li>• Participate in the community to help others and earn bonus points</li>
            <li>• Complete weekly challenges to earn special badges</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Garden
