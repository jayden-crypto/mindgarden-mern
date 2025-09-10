import React, { useState, useEffect } from 'react'
import { MessageSquare, Heart, Flag, Plus, Filter, Users, ThumbsUp } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const Community = () => {
  const { api } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'general',
    isAnonymous: true
  })

  const categories = [
    { value: 'all', label: 'All Posts' },
    { value: 'general', label: 'General Discussion' },
    { value: 'anxiety', label: 'Anxiety Support' },
    { value: 'depression', label: 'Depression Support' },
    { value: 'stress', label: 'Stress Management' },
    { value: 'academic', label: 'Academic Pressure' },
    { value: 'relationships', label: 'Relationships' },
    { value: 'success', label: 'Success Stories' }
  ]

  useEffect(() => {
    fetchPosts()
  }, [selectedCategory])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await api.get('/posts')
      // Handle both response formats: response.data.posts and response.data directly
      const postsData = response.data.posts || response.data || []
      setPosts(Array.isArray(postsData) ? postsData : [])
    } catch (error) {
      console.error('Posts fetch error:', error)
      // Don't show error toast for empty data or 404s
      // The API interceptor already handles these cases
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = async (e) => {
    e.preventDefault()
    try {
      await api.post('/posts', newPost)
      toast.success('Post created successfully!')
      setShowCreatePost(false)
      setNewPost({
        title: '',
        content: '',
        category: 'general',
        isAnonymous: true
      })
      fetchPosts()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create post')
    }
  }

  const handleLike = async (postId) => {
    try {
      await api.post(`/posts/${postId}/like`)
      fetchPosts()
    } catch (error) {
      toast.error('Failed to like post')
    }
  }

  const handleFlag = async (postId) => {
    try {
      await api.post(`/posts/${postId}/flag`, {
        reason: 'inappropriate_content'
      })
      toast.success('Post flagged for review')
    } catch (error) {
      toast.error('Failed to flag post')
    }
  }

  const formatTimeAgo = (date) => {
    const now = new Date()
    const postDate = new Date(date)
    const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return postDate.toLocaleDateString()
  }

  const getCategoryColor = (category) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800',
      anxiety: 'bg-purple-100 text-purple-800',
      depression: 'bg-indigo-100 text-indigo-800',
      stress: 'bg-orange-100 text-orange-800',
      academic: 'bg-green-100 text-green-800',
      relationships: 'bg-pink-100 text-pink-800',
      success: 'bg-yellow-100 text-yellow-800'
    }
    return colors[category] || colors.general
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-900 dark:to-neutral-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-neutral-800 dark:text-neutral-100 mb-2">
              Community Support
            </h1>
            <p className="text-neutral-600 dark:text-neutral-300">
              Connect with peers in a safe, anonymous environment
            </p>
          </div>
          
          <button
            onClick={() => setShowCreatePost(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </button>
        </div>

        {/* Category Filter */}
        <div className="card-hover mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-neutral-500" />
            <span className="font-medium text-neutral-700">Filter by category</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Create Post Modal */}
        {showCreatePost && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 w-full max-w-lg">
              <h2 className="text-xl font-semibold mb-4 text-neutral-800 dark:text-neutral-100">Share with the Community</h2>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                    className="input-field"
                    placeholder="What's on your mind?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newPost.category}
                    onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                    className="input-field"
                  >
                    {categories.slice(1).map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Content
                  </label>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                    className="input-field"
                    rows="4"
                    placeholder="Share your thoughts, experiences, or ask for support..."
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={newPost.isAnonymous}
                    onChange={(e) => setNewPost({...newPost, isAnonymous: e.target.checked})}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="anonymous" className="text-sm text-neutral-700 dark:text-neutral-300">
                    Post anonymously (recommended)
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreatePost(false)}
                    className="btn-outline flex-1"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    Share Post
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Posts List */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-600 mb-2">
                No posts yet
              </h3>
              <p className="text-neutral-500">
                Be the first to share something with the community
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post._id} className="card-hover">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-800">
                        {post.isAnonymous ? 'Anonymous' : post.author?.name}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {formatTimeAgo(post.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                    {categories.find(c => c.value === post.category)?.label || post.category}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                  {post.title}
                </h3>

                <p className="text-neutral-700 mb-4 whitespace-pre-wrap">
                  {post.content}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(post._id)}
                      className="flex items-center gap-1 text-neutral-500 hover:text-red-500 transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">{post.likes?.length || 0}</span>
                    </button>
                    
                    <button className="flex items-center gap-1 text-neutral-500 hover:text-blue-500 transition-colors">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm">{post.comments?.length || 0}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleFlag(post._id)}
                    className="flex items-center gap-1 text-neutral-400 hover:text-orange-500 transition-colors"
                    title="Flag inappropriate content"
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                </div>

                {/* Comments Section */}
                {post.comments && post.comments.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-neutral-100">
                    <h4 className="text-sm font-medium text-neutral-700 mb-3">
                      Comments ({post.comments.length})
                    </h4>
                    <div className="space-y-3">
                      {post.comments.slice(0, 3).map((comment, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-neutral-500" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-neutral-700">
                              {comment.isAnonymous ? 'Anonymous' : comment.author?.name}
                            </p>
                            <p className="text-sm text-neutral-600 mt-1">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Community Guidelines */}
        <div className="mt-12 card-hover border-l-4 border-primary-500">
          <h3 className="font-semibold text-primary-800 mb-2">
            Community Guidelines
          </h3>
          <ul className="text-sm text-neutral-600 space-y-1">
            <li>• Be respectful and supportive of others</li>
            <li>• No sharing of personal identifying information</li>
            <li>• Report inappropriate content using the flag button</li>
            <li>• Seek professional help for crisis situations</li>
            <li>• Remember that this is a peer support community, not professional therapy</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Community
