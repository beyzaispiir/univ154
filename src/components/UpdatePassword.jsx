import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'
import logo from '../assets/logo with name for univ154.png'
import riceLogo from '../assets/rice-logo.png'

export default function UpdatePassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    symbol: false
  })
  const navigate = useNavigate()
  const location = useLocation()

  const validatePassword = (password) => {
    const requirements = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
    setPasswordRequirements(requirements)
    return Object.values(requirements).every(Boolean)
  }

  useEffect(() => {
    if (password) {
      validatePassword(password)
    }
  }, [password])

  // Check for error parameters in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.hash.substring(1))
    const error = urlParams.get('error')
    const errorDescription = urlParams.get('error_description')
    

    
    if (error) {
      setError('⚠️ Password reset link is invalid. Please request a new password reset link.')
    }
  }, [location])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!validatePassword(password)) {
      setError('Password does not meet all requirements')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      setLoading(true)
      
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        throw error
      }

      setMessage('Password updated successfully! Redirecting to login...')
      setTimeout(() => {
        navigate('/')
      }, 2000)
    } catch (error) {
      console.error('Password update error:', error)
      
      // Provide simplified error messages
      if (error.message?.includes('weak_password')) {
        setError('⚠️ Password is too weak. Please choose a stronger password that meets all requirements.')
      } else {
        setError('⚠️ Password reset link is invalid. Please request a new password reset link.')
      }
    }

    setLoading(false)
  }

  const handleRequestNewLink = () => {
    // Navigate to login page where user can use "Forgot Password" option
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <div className="w-full max-w-[400px] space-y-6 bg-white p-8 rounded-lg shadow-sm px-6" style={{ marginTop: '2rem' }}>
        {/* Logo and Title Section */}
        <div className="flex flex-col items-center">
          <img 
            src={riceLogo} 
            alt="Rice University Logo" 
            style={{ height: '100px', width: 'auto', marginBottom: '45px' }}
            className="object-contain"
          />
          
          <div className="flex flex-col items-center border-t-2 border-b-2 border-[#0d1a4b] py-4 px-4">
            <div className="flex flex-col items-center" style={{ marginBottom: '-1.5rem' }}>
              <img 
                src={logo} 
                alt="UNIV154 Logo" 
                style={{ height: '140px', width: 'auto', marginLeft: '-10px' }}
                className="object-contain"
              />
            </div>
            
            {/* Course Title Section */}
            <div className="text-center w-full">
              <h1 className="font-bold tracking-wide text-[#0d1a4b] text-left pl-[100px]" style={{ fontSize: '24px', marginTop: '-0.5rem', marginBottom: '0' }}>
                Financial Literacy for Life
              </h1>
              <p className="text-sm tracking-wide text-[#0d1a4b] text-left pl-[100px]" style={{ fontSize: '16px', marginTop: '0' }}>
                Preparing for the Real World
              </p>
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div style={{ height: '1px' }}></div>
        
        {/* Welcome Text */}
        <div className="text-center space-y-2" style={{ marginTop: '25px', marginBottom: '25px' }}>
          <h2 className="text-base text-[#0d1a4b]" style={{ fontSize: '16px' }}>Update Your Password</h2>
        </div>

        {/* Form */}
        <form className="space-y-0" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 text-red-500 bg-red-50 rounded-md" style={{ fontSize: '14px', marginBottom: '10px' }}>
              {error}
            </div>
          )}
          {message && (
            <div className="p-3 text-green-500 bg-green-50 rounded-md" style={{ fontSize: '14px', marginBottom: '10px' }}>
              {message}
            </div>
          )}

          {/* Password Input */}
          <div style={{ marginBottom: '15px', width: '100%' }}>
            <label className="block font-medium text-[#0d1a4b] mb-2" style={{ fontSize: '14px' }}>New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your new password"
                style={{ height: '37px', fontSize: '14px', borderRadius: '4px', width: '100%', boxSizing: 'border-box', paddingRight: '50px' }}
                className="px-3 border border-gray-100 text-[#0d1a4b] 
                placeholder-gray-400 transition-colors duration-200
                hover:border-[#fdb913] focus:border-[#fdb913]
                focus:ring-2 focus:ring-[#fdb913] focus:ring-opacity-50 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '13px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  color: '#0d1a4b',
                  fontWeight: '500',
                  zIndex: 10
                }}
                onMouseOver={(e) => e.target.style.color = '#162456'}
                onMouseOut={(e) => e.target.style.color = '#0d1a4b'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {/* Password Requirements */}
            <div className="mt-2 space-y-1">
              <p className="text-gray-500 mb-1" style={{ fontSize: '14px' }}>Password requirements:</p>
              <ul className="space-y-1 list-none">
                <li className={`flex items-center ${passwordRequirements.length ? 'text-green-600' : 'text-gray-500'}`} style={{ fontSize: '14px' }}>
                  At least 8 characters
                </li>
                <li className={`flex items-center ${passwordRequirements.lowercase ? 'text-green-600' : 'text-gray-500'}`} style={{ fontSize: '14px' }}>
                  One lowercase letter
                </li>
                <li className={`flex items-center ${passwordRequirements.uppercase ? 'text-green-600' : 'text-gray-500'}`} style={{ fontSize: '14px' }}>
                  One uppercase letter
                </li>
                <li className={`flex items-center ${passwordRequirements.number ? 'text-green-600' : 'text-gray-500'}`} style={{ fontSize: '14px' }}>
                  One number
                </li>
                <li className={`flex items-center ${passwordRequirements.symbol ? 'text-green-600' : 'text-gray-500'}`} style={{ fontSize: '14px' }}>
                  One symbol (!@#$%^&*(),.?":{}|&lt;&gt;)
                </li>
              </ul>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div style={{ marginBottom: '15px', width: '100%' }}>
            <label className="block font-medium text-[#0d1a4b] mb-2" style={{ fontSize: '14px' }}>Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                style={{ height: '37px', fontSize: '14px', borderRadius: '4px', width: '100%', boxSizing: 'border-box', paddingRight: '50px' }}
                className="px-3 border border-gray-100 text-[#0d1a4b] 
                placeholder-gray-400 transition-colors duration-200
                hover:border-[#fdb913] focus:border-[#fdb913]
                focus:ring-2 focus:ring-[#fdb913] focus:ring-opacity-50 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ 
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '13px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  color: '#0d1a4b',
                  fontWeight: '500',
                  zIndex: 10
                }}
                onMouseOver={(e) => e.target.style.color = '#162456'}
                onMouseOut={(e) => e.target.style.color = '#0d1a4b'}
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Update Password Button */}
          <div style={{ marginTop: '15px', marginBottom: '15px', width: '100%' }}>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1.5 border border-gray-100 text-[#0d1a4b] bg-white
              hover:border-[#fdb913] focus:border-[#fdb913] transition-colors duration-200
              focus:ring-2 focus:ring-[#fdb913] focus:ring-opacity-50 focus:outline-none
              text-sm font-medium"
              style={{ height: '37px', fontSize: '14px', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }}
            >
              {loading ? 'Updating password...' : 'Update Password'}
            </button>
          </div>

          {/* Request New Reset Link Button - Only show when there's an error */}
          {error && (
            <div style={{ marginTop: '10px', marginBottom: '15px', width: '100%' }}>
              <button
                type="button"
                onClick={handleRequestNewLink}
                disabled={loading}
                className="px-3 py-1.5 border border-[#A4907C] text-white bg-[#A4907C]
                hover:bg-[#8B7355] focus:border-[#8B7355] transition-colors duration-200
                focus:ring-2 focus:ring-[#A4907C] focus:ring-opacity-50 focus:outline-none
                text-sm font-medium"
                style={{ height: '37px', fontSize: '14px', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }}
              >
                Go to Login Page
              </button>
            </div>
          )}
        </form>

        {/* Back to Login Link */}
        <div className="text-center mt-8">
          <p className="text-[#0d1a4b]" style={{ fontSize: '14px' }}>
            Remember your password?{' '}
            <button 
              onClick={() => navigate('/')} 
              className="text-[#0d1a4b] hover:text-[#162456]" 
              style={{ fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  )
} 