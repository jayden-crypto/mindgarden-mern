import React from 'react'
import { Link } from 'react-router-dom'
import { Flower2, Heart, Shield, Phone } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <Flower2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-semibold text-xl text-white">
                MindGarden
              </span>
            </div>
            <p className="text-neutral-400 mb-6 max-w-md">
              A supportive platform for student mental health with personalized wellness tracking, 
              professional counseling services, and a caring community.
            </p>
            <div className="flex items-center space-x-2 text-sm">
              <Heart className="w-4 h-4 text-red-400" />
              <span>Made with care for student wellbeing</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/resources" className="hover:text-primary-400 transition-colors duration-200">
                  Wellness Resources
                </Link>
              </li>
              <li>
                <Link to="/community" className="hover:text-primary-400 transition-colors duration-200">
                  Community Support
                </Link>
              </li>
              <li>
                <Link to="/bookings" className="hover:text-primary-400 transition-colors duration-200">
                  Book Counseling
                </Link>
              </li>
              <li>
                <Link to="/chat" className="hover:text-primary-400 transition-colors duration-200">
                  AI Assistant
                </Link>
              </li>
            </ul>
          </div>

          {/* Crisis Resources */}
          <div>
            <h3 className="font-semibold text-white mb-4 flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              Crisis Support
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="tel:988" 
                  className="hover:text-primary-400 transition-colors duration-200 font-medium"
                >
                  🆘 Suicide Prevention: 988
                </a>
              </li>
              <li>
                <a 
                  href="tel:911" 
                  className="hover:text-primary-400 transition-colors duration-200 font-medium"
                >
                  🚨 Emergency: 911
                </a>
              </li>
              <li>
                <a 
                  href="sms:741741" 
                  className="hover:text-primary-400 transition-colors duration-200"
                >
                  💬 Crisis Text: 741741
                </a>
              </li>
              <li>
                <a 
                  href="https://suicidepreventionlifeline.org/chat/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary-400 transition-colors duration-200"
                >
                  🌐 Online Crisis Chat
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-neutral-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-primary-400" />
                <span>Privacy Protected</span>
              </div>
              <span className="text-neutral-600">•</span>
              <span>HIPAA Compliant</span>
              <span className="text-neutral-600">•</span>
              <span>End-to-End Encrypted</span>
            </div>
            
            <div className="text-sm text-neutral-500">
              © 2024 MindGarden. Built for SIH 2024.
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-neutral-800 rounded-lg">
            <p className="text-xs text-neutral-400 text-center">
              <strong>Disclaimer:</strong> MindGarden provides supportive resources and connects you with professional help. 
              It is not a substitute for professional medical advice, diagnosis, or treatment. 
              If you're experiencing a mental health emergency, please contact emergency services immediately.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
