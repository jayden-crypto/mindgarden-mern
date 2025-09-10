import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Shield, AlertTriangle, Heart, Lock } from 'lucide-react'

const ConsentModal = () => {
  const { giveConsent, user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleConsent = async () => {
    try {
      setError(null)
      setIsSubmitting(true)
      console.log('Giving consent...')
      
      const result = await giveConsent()
      console.log('Consent result:', result)
      
      if (result?.success) {
        console.log('Consent successful, reloading page...')
        // Small delay to allow state to update before reload
        setTimeout(() => window.location.reload(), 500)
      } else {
        setError(result?.error || 'Failed to record consent')
      }
    } catch (err) {
      console.error('Error in handleConsent:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-display font-bold text-neutral-800 mb-2">
              Welcome to MindGarden
            </h2>
            <p className="text-neutral-600">
              Your privacy and safety are our top priorities
            </p>
          </div>

          {/* Important Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Important Notice</p>
                <p>
                  MindGarden is a supportive platform that complements but does not replace professional mental health care. 
                  If you're experiencing a mental health emergency, please contact emergency services immediately.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy & Safety Features */}
          <div className="space-y-4 mb-8">
            <h3 className="font-semibold text-neutral-800 mb-4">How we protect you:</h3>
            
            <div className="flex items-start space-x-3">
              <Lock className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-neutral-800">End-to-End Encryption</h4>
                <p className="text-sm text-neutral-600">Your personal notes and sensitive data are encrypted and secure.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Heart className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-neutral-800">Crisis Detection</h4>
                <p className="text-sm text-neutral-600">Our system monitors for signs of distress and connects you with help when needed.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-neutral-800">Anonymous Community</h4>
                <p className="text-sm text-neutral-600">Share and connect with peers while maintaining your privacy.</p>
              </div>
            </div>
          </div>

          {/* Emergency Resources */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-red-800 mb-2">🆘 Emergency Resources</h4>
            <div className="text-sm text-red-700 space-y-1">
              <p><strong>Suicide Prevention Lifeline:</strong> 988</p>
              <p><strong>Emergency Services:</strong> 911</p>
              <p><strong>Crisis Text Line:</strong> Text HOME to 741741</p>
              <p><strong>Online Crisis Chat:</strong> suicidepreventionlifeline.org/chat</p>
            </div>
          </div>

          {/* Consent Agreement */}
          <div className="bg-neutral-50 rounded-lg p-6 mb-6">
            <h4 className="font-medium text-neutral-800 mb-3">By continuing, you acknowledge that:</h4>
            <ul className="text-sm text-neutral-700 space-y-2">
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                MindGarden is a supportive tool, not a substitute for professional medical care
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                You will seek immediate professional help for mental health emergencies
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                You understand our privacy practices and crisis intervention protocols
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                You consent to anonymous data collection for improving mental health services
              </li>
            </ul>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {/* Action Button */}
          <button
            onClick={handleConsent}
            disabled={isSubmitting}
            className="w-full btn-primary py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : 'I understand and agree'}
          </button>

          <p className="text-xs text-neutral-500 text-center mt-4">
            You can review our privacy policy and terms of service at any time in your profile settings.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ConsentModal
