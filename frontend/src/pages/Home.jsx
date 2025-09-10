import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Heart, 
  MessageCircle, 
  Calendar, 
  BookOpen, 
  Users, 
  Flower2, 
  Shield, 
  Zap,
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react'

const Home = () => {
  const features = [
    {
      icon: Heart,
      title: 'Mood Tracking',
      description: 'Log your daily emotions and track patterns with our intelligent mood analysis system.',
      color: 'text-red-500'
    },
    {
      icon: MessageCircle,
      title: 'AI-Powered Chat',
      description: 'Get instant support from our empathetic AI assistant trained in mental health support.',
      color: 'text-blue-500'
    },
    {
      icon: Calendar,
      title: 'Counselor Booking',
      description: 'Schedule sessions with qualified mental health professionals at your convenience.',
      color: 'text-green-500'
    },
    {
      icon: BookOpen,
      title: 'Resource Library',
      description: 'Access curated mental health resources, articles, and self-help materials.',
      color: 'text-purple-500'
    },
    {
      icon: Users,
      title: 'Anonymous Community',
      description: 'Connect with peers in a safe, anonymous environment for mutual support.',
      color: 'text-orange-500'
    },
    {
      icon: Flower2,
      title: 'Wellness Garden',
      description: 'Grow your personal wellness garden as you complete healthy activities.',
      color: 'text-emerald-500'
    }
  ]

  const benefits = [
    'Private and secure - your data is encrypted',
    'Available 24/7 for immediate support',
    'Professional counselors available',
    'Crisis intervention and escalation',
    'Gamified wellness tracking',
    'Peer support community'
  ]

  const stats = [
    { number: '24/7', label: 'Support Available' },
    { number: '100%', label: 'Privacy Protected' },
    { number: '50+', label: 'Wellness Resources' },
    { number: '∞', label: 'Growth Potential' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-900 dark:to-neutral-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-700">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100/20 to-secondary-100/20 dark:from-primary-900/20 dark:to-secondary-900/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center animate-bounce-gentle">
                <Flower2 className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-display font-bold text-neutral-800 dark:text-neutral-100 mb-6">
              Your Mental Health
              <span className="block gradient-text">Matters</span>
            </h1>
            
            <p className="text-xl text-neutral-600 dark:text-neutral-300 mb-8 max-w-2xl mx-auto">
              A comprehensive platform designed to support your mental wellness journey with AI-powered tools, professional guidance, and a caring community. Track your wellness, connect with professionals, and grow in a supportive community.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/register" className="btn-primary text-lg px-8 py-3">
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link to="/login" className="btn-outline text-lg px-8 py-3">
                Sign In
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold gradient-text mb-1">
                    {stat.number}
                  </div>
                  <div className="text-sm text-neutral-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-800 dark:text-neutral-100 mb-4">
              Everything You Need for
              <span className="gradient-text"> Mental Wellness</span>
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
              Our comprehensive platform provides tools, resources, and support for your mental health journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div 
                  key={index} 
                  className="card-hover text-center animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-12 h-12 ${feature.color} bg-opacity-10 rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-neutral-800 dark:to-neutral-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-800 dark:text-neutral-100 mb-6">
                Why Choose
                <span className="gradient-text"> MindGarden?</span>
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-8">
                We understand the unique challenges students face. Our platform is designed with 
                privacy, accessibility, and effectiveness at its core.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-700 dark:text-neutral-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="glass-effect rounded-2xl p-8 shadow-soft-lg">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 dark:text-neutral-100">Privacy First</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">Your data is encrypted and secure</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-neutral-700/50 rounded-lg">
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">End-to-end encryption</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-neutral-700/50 rounded-lg">
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">Anonymous community</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-neutral-700/50 rounded-lg">
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">Crisis detection</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
            Ready to Start Your Wellness Journey?
          </h2>
          
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students who are taking control of their mental health with MindGarden.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="bg-white text-primary-600 hover:bg-primary-50 font-medium py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link 
              to="/resources" 
              className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-medium py-3 px-8 rounded-lg transition-all duration-200"
            >
              Explore Resources
            </Link>
          </div>
          
          <div className="mt-8 flex items-center justify-center space-x-2 text-primary-100">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm">Trusted by students nationwide</span>
          </div>
        </div>
      </section>

      {/* Emergency Resources */}
      <section className="py-12 bg-red-50 border-t border-red-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-4">
            🆘 Need Immediate Help?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <a 
              href="tel:988" 
              className="p-3 bg-white rounded-lg border border-red-200 hover:border-red-300 transition-colors duration-200"
            >
              <div className="font-medium text-red-800">Suicide Prevention</div>
              <div className="text-red-600">Call 988</div>
            </a>
            <a 
              href="tel:911" 
              className="p-3 bg-white rounded-lg border border-red-200 hover:border-red-300 transition-colors duration-200"
            >
              <div className="font-medium text-red-800">Emergency</div>
              <div className="text-red-600">Call 911</div>
            </a>
            <a 
              href="sms:741741" 
              className="p-3 bg-white rounded-lg border border-red-200 hover:border-red-300 transition-colors duration-200"
            >
              <div className="font-medium text-red-800">Crisis Text</div>
              <div className="text-red-600">Text 741741</div>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
