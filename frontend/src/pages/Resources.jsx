import React, { useState, useEffect } from 'react'
import { Search, BookOpen, Video, FileText, Heart, Filter, Star } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const Resources = () => {
  const { api } = useAuth()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'anxiety', label: 'Anxiety' },
    { value: 'depression', label: 'Depression' },
    { value: 'stress', label: 'Stress Management' },
    { value: 'mindfulness', label: 'Mindfulness' },
    { value: 'relationships', label: 'Relationships' },
    { value: 'academic', label: 'Academic Support' },
    { value: 'self-care', label: 'Self Care' }
  ]

  const types = [
    { value: 'all', label: 'All Types' },
    { value: 'article', label: 'Articles' },
    { value: 'video', label: 'Videos' },
    { value: 'exercise', label: 'Exercises' },
    { value: 'guide', label: 'Guides' }
  ]

  useEffect(() => {
    fetchResources()
  }, [searchTerm, selectedCategory, selectedType])

  const fetchResources = async () => {
    try {
      setLoading(true)
      console.log('Fetching resources...')
      
      // Make the API request with detailed logging
      const response = await api.get('/api/resources')
      console.log('Raw resources response:', response)
      console.log('Response data:', response.data)
      console.log('Response data type:', typeof response.data)
      
      // Handle different response formats
      let resourcesData = [];
      if (Array.isArray(response.data)) {
        resourcesData = response.data;
      } else if (response.data && Array.isArray(response.data.resources)) {
        resourcesData = response.data.resources;
      } else if (response.data && Array.isArray(response.data.data)) {
        resourcesData = response.data.data;
      }
      
      console.log(`Processed ${resourcesData.length} resources`)
      setResources(resourcesData)
    } catch (error) {
      console.error('Resources fetch error:', error)
      console.log('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      toast.error('Failed to load resources. Please try again.')
      setResources([])
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (resourceId) => {
    try {
      await api.post(`/resources/${resourceId}/like`)
      fetchResources()
    } catch (error) {
      toast.error('Failed to like resource')
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5" />
      case 'exercise': return <Heart className="w-5 h-5" />
      case 'guide': return <FileText className="w-5 h-5" />
      default: return <BookOpen className="w-5 h-5" />
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-50'
      case 'intermediate': return 'text-yellow-600 bg-yellow-50'
      case 'advanced': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-900 dark:to-neutral-800 py-8 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-900 dark:to-neutral-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-neutral-800 dark:text-neutral-100 mb-2">
            Wellness Resources
          </h1>
          <p className="text-neutral-600 dark:text-neutral-300">
            Discover helpful articles, videos, and tools for your mental health journey
          </p>
        </div>

        {/* Search and Filters */}
        <div className="card-hover mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="input-field"
              >
                {types.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        {resources.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-600 mb-2">
              No resources found
            </h3>
            <p className="text-neutral-500 mb-4">
              Try adjusting your search or filters
            </p>
            <button 
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
                setSelectedType('all')
              }}
              className="btn-secondary"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <div key={resource._id} className="card-hover group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 text-primary-600">
                    {getTypeIcon(resource.type)}
                    <span className="text-sm font-medium capitalize">
                      {resource.type}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(resource.difficulty)}`}>
                    {resource.difficulty}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-neutral-800 mb-2 group-hover:text-primary-600 transition-colors">
                  {resource.title}
                </h3>

                <p className="text-neutral-600 text-sm mb-4 line-clamp-3">
                  {resource.description}
                </p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {resource.tags?.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-secondary-100 text-secondary-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                  <div className="flex items-center gap-4 text-sm text-neutral-500">
                    <span>{resource.readTime || '5'} min read</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      <span>{resource.likes?.length || 0}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLike(resource._id)}
                      className="p-2 text-neutral-400 hover:text-red-500 transition-colors"
                      title="Like this resource"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                    
                    {resource.url ? (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary text-sm px-4 py-2"
                      >
                        View Resource
                      </a>
                    ) : (
                      <button className="btn-primary text-sm px-4 py-2">
                        Read More
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Featured Resources Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-display font-bold text-neutral-800 mb-6">
            Crisis Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card-hover border-l-4 border-red-500">
              <h3 className="font-semibold text-red-800 mb-2">Emergency Help</h3>
              <p className="text-sm text-neutral-600 mb-3">
                If you're in immediate danger or having thoughts of self-harm
              </p>
              <a href="tel:911" className="text-red-600 font-medium">
                Call 911
              </a>
            </div>

            <div className="card-hover border-l-4 border-blue-500">
              <h3 className="font-semibold text-blue-800 mb-2">Suicide Prevention</h3>
              <p className="text-sm text-neutral-600 mb-3">
                24/7 confidential support for people in suicidal crisis
              </p>
              <a href="tel:988" className="text-blue-600 font-medium">
                Call 988
              </a>
            </div>

            <div className="card-hover border-l-4 border-green-500">
              <h3 className="font-semibold text-green-800 mb-2">Crisis Text Line</h3>
              <p className="text-sm text-neutral-600 mb-3">
                Text-based crisis support available 24/7
              </p>
              <a href="sms:741741" className="text-green-600 font-medium">
                Text 741741
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Resources
