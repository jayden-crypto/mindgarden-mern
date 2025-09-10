import React, { useState, useEffect } from 'react';
import { Heart, TrendingUp, Calendar, Plus, BarChart3 } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import api from '../utils/api';

const MoodTracker = () => {
  const [moods, setMoods] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showMoodForm, setShowMoodForm] = useState(false)
  const [formData, setFormData] = useState({
    mood: '',
    intensity: 5,
    notes: '',
    triggers: [],
    activities: [],
    sleepHours: ''
  })

  const moodOptions = [
    { value: 'very_happy', label: 'Very Happy', emoji: '😄', color: 'bg-green-500' },
    { value: 'happy', label: 'Happy', emoji: '😊', color: 'bg-green-400' },
    { value: 'neutral', label: 'Neutral', emoji: '😐', color: 'bg-yellow-400' },
    { value: 'sad', label: 'Sad', emoji: '😢', color: 'bg-orange-400' },
    { value: 'very_sad', label: 'Very Sad', emoji: '😭', color: 'bg-red-400' },
    { value: 'anxious', label: 'Anxious', emoji: '😰', color: 'bg-purple-400' },
    { value: 'stressed', label: 'Stressed', emoji: '😤', color: 'bg-red-500' },
    { value: 'angry', label: 'Angry', emoji: '😠', color: 'bg-red-600' }
  ]

  const triggerOptions = [
    'Work/Studies', 'Relationships', 'Health', 'Finances', 'Family', 'Social Media', 'Weather', 'Sleep', 'Other'
  ]

  const activityOptions = [
    'Exercise', 'Meditation', 'Reading', 'Music', 'Friends', 'Nature', 'Gaming', 'Cooking', 'Art', 'Sleep'
  ]

  useEffect(() => {
    fetchMoodData()
  }, [])

  const fetchMoodData = async () => {
    try {
      setLoading(true);
      const [moodsResponse, analyticsResponse] = await Promise.all([
        api.get('/moods'),
        api.get('/moods/analytics')
      ]);
      setMoods(moodsResponse.data.moods || []);
      setAnalytics(analyticsResponse.data);
    } catch (error) {
      console.error('Failed to fetch mood data:', error);
      // Error is already handled by the interceptor
      setMoods([]);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.mood) {
      toast.error('Please select a mood');
      return;
    }

    try {
      await api.post('/moods', formData);
      toast.success('Mood logged successfully! 🌱');
      setShowMoodForm(false);
      setFormData({
        mood: '',
        intensity: 5,
        notes: '',
        triggers: [],
        activities: [],
        sleepHours: ''
      });
      await fetchMoodData();
    } catch (error) {
      console.error('Failed to log mood:', error);
      // Error is already handled by the interceptor
    }
  }

  const getMoodOption = (moodValue) => {
    return moodOptions.find(option => option.value === moodValue) || moodOptions[2]
  }

  if (loading) {
    return <LoadingSpinner text="Loading your mood data..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-900 dark:to-neutral-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-neutral-800 dark:text-neutral-100 mb-2">
              Mood Tracker
            </h1>
            <p className="text-neutral-600 dark:text-neutral-300">
              Track your emotions and discover patterns in your mental wellness journey
            </p>
          </div>
          <button
            onClick={() => setShowMoodForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Log Mood</span>
          </button>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card text-center">
              <div className="text-2xl font-bold text-primary-600 mb-1">
                {analytics.totalEntries}
              </div>
              <div className="text-sm text-neutral-600">Total Entries</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-secondary-600 mb-1">
                {analytics.averageIntensity?.toFixed(1) || 0}
              </div>
              <div className="text-sm text-neutral-600">Avg Intensity</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-accent-600 mb-1">
                {analytics.weeklyTrends?.length || 0}
              </div>
              <div className="text-sm text-neutral-600">Weeks Tracked</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {Object.keys(analytics.commonTriggers || {}).length}
              </div>
              <div className="text-sm text-neutral-600">Triggers Identified</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">

          {/* Mood Distribution */}
          <div className="space-y-6">
            {analytics?.moodDistribution && (
              <div className="card">
                <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-primary-600" />
                  Mood Distribution
                </h3>
                <div className="space-y-3">
                  {Object.entries(analytics.moodDistribution).map(([mood, count]) => {
                    const moodOption = getMoodOption(mood)
                    const percentage = (count / analytics.totalEntries * 100).toFixed(1)
                    return (
                      <div key={mood} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{moodOption.emoji}</span>
                          <span className="text-sm text-neutral-700">{moodOption.label}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-neutral-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${moodOption.color}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-neutral-600 w-12">{percentage}%</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {analytics?.commonTriggers && Object.keys(analytics.commonTriggers).length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                  Common Triggers
                </h3>
                <div className="space-y-2">
                  {Object.entries(analytics.commonTriggers)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([trigger, count]) => (
                      <div key={trigger} className="flex items-center justify-between p-2 bg-neutral-50 rounded">
                        <span className="text-sm text-neutral-700">{trigger}</span>
                        <span className="text-sm font-medium text-neutral-600">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mood Logging Modal */}
        {showMoodForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-display font-bold text-neutral-800 mb-6">
                  How are you feeling?
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Mood Selection */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-3">
                      Select your mood
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {moodOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, mood: option.value }))}
                          className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center h-28 ${
                            formData.mood === option.value
                              ? 'border-primary-500 bg-primary-50 scale-105 shadow-md'
                              : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                          }`}
                        >
                          <div className="text-3xl mb-2">{option.emoji}</div>
                          <div className="text-sm font-semibold text-center">{option.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Intensity */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Intensity: {formData.intensity}/10
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.intensity}
                      onChange={(e) => setFormData(prev => ({ ...prev, intensity: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Notes (optional)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      className="input-field h-24 resize-none"
                      placeholder="What's on your mind? How are you feeling?"
                    />
                  </div>

                  {/* Triggers */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      What triggered this mood? (optional)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {triggerOptions.map((trigger) => (
                        <button
                          key={trigger}
                          type="button"
                          onClick={() => {
                            const triggers = formData.triggers.includes(trigger)
                              ? formData.triggers.filter(t => t !== trigger)
                              : [...formData.triggers, trigger]
                            setFormData(prev => ({ ...prev, triggers }))
                          }}
                          className={`px-3 py-1 text-sm rounded-full border transition-colors duration-200 ${
                            formData.triggers.includes(trigger)
                              ? 'bg-primary-100 border-primary-300 text-primary-700'
                              : 'bg-neutral-100 border-neutral-300 text-neutral-700 hover:bg-neutral-200'
                          }`}
                        >
                          {trigger}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Activities */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      What activities helped? (optional)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {activityOptions.map((activity) => (
                        <button
                          key={activity}
                          type="button"
                          onClick={() => {
                            const activities = formData.activities.includes(activity)
                              ? formData.activities.filter(a => a !== activity)
                              : [...formData.activities, activity]
                            setFormData(prev => ({ ...prev, activities }))
                          }}
                          className={`px-3 py-1 text-sm rounded-full border transition-colors duration-200 ${
                            formData.activities.includes(activity)
                              ? 'bg-secondary-100 border-secondary-300 text-secondary-700'
                              : 'bg-neutral-100 border-neutral-300 text-neutral-700 hover:bg-neutral-200'
                          }`}
                        >
                          {activity}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sleep Hours */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Hours of sleep last night (optional)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      value={formData.sleepHours}
                      onChange={(e) => setFormData(prev => ({ ...prev, sleepHours: e.target.value }))}
                      className="input-field w-32"
                      placeholder="8"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowMoodForm(false)}
                      className="flex-1 btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 btn-primary"
                    >
                      Log Mood
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MoodTracker
