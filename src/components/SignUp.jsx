import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/logo with name for univ154.png'
import riceLogo from '../assets/rice-logo.png'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    symbol: false
  })
  const navigate = useNavigate()
  const { signUp } = useAuth()

  const validateEmail = (email) => {
    const validEmailRegex = /@(rice\.edu|alumni\.rice\.edu|gmail\.com|yahoo\.com)$/
    return validEmailRegex.test(email)
  }

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!validateEmail(email)) {
      setError('Please use your Rice University email address (@rice.edu or @alumni.rice.edu), Gmail address (@gmail.com), or Yahoo address (@yahoo.com)')
      return
    }

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
      const { data, error } = await signUp(email, password)
      
      if (error) {
        console.log('SignUp error details:', error)
        throw error
      }

      console.log('SignUp success data:', data)

      // Success - show confirmation message and redirect to login
      navigate('/signup-success')
    } catch (error) {
      console.log('SignUp catch error:', error)
      if (error.message.includes('User already registered')) {
        setError('An account with this email already exists. Please sign in instead.')
      } else if (error.message.includes('already registered')) {
        setError('An account with this email already exists. Please sign in instead.')
      } else {
        setError(error.message || 'Failed to create an account')
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col items-center justify-center p-4 relative">
      <div className="w-full max-w-[400px] space-y-6 bg-white p-8 rounded-2xl shadow-lg px-6">
        {/* Logo and Title Section - Minimalist Gradient Card */}
        <div className="flex flex-col items-center w-full">
          {/* Rice University Logo with fade-in */}
          <div 
            className="opacity-0 animate-[fadeIn_0.6s_ease-out_0.2s_forwards]"
            style={{
              animationFillMode: 'forwards'
            }}
          >
            <img 
              src={riceLogo} 
              alt="Rice University Logo" 
              style={{ height: '100px', width: 'auto', marginBottom: '32px' }}
              className="object-contain drop-shadow-sm"
            />
          </div>
          
          {/* Main Logo Card with Gradient Background */}
          <div 
            className="w-full rounded-2xl bg-gradient-to-br from-[#fffde7] via-yellow-50 to-white
            shadow-lg overflow-hidden
            opacity-0 animate-[fadeIn_0.8s_ease-out_0.4s_forwards] transform"
            style={{
              animationFillMode: 'forwards',
              boxShadow: '0 10px 25px -5px rgba(253, 230, 19, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.07)',
              padding: '20px 110px',
              border: '1px solid rgba(242, 250, 3, 0.08)'
            }}
          >
            {/* UNIV154 Logo */}
            <div className="flex justify-center mb-6" style={{ padding: '0 20px' }}>
              <img 
                src={logo} 
                alt="UNIV154 Logo" 
                style={{ height: '145px', width: 'auto' }} 
                className="object-contain drop-shadow-md transition-transform duration-300 hover:scale-105"
              />
            </div>
            
            {/* Course Title Section */}
            <div className="text-center w-full">
              <h1 
                className="font-bold tracking-wide text-[#0d1a4b] mb-2"
                style={{ 
                  fontSize: '26px',
                  letterSpacing: '-0.02em',
                  textShadow: '0 1px 2px rgba(13, 26, 75, 0.1)'
                }}
              >
                Financial Literacy for Life
              </h1>
              <p 
                className="text-sm tracking-wide text-[#0d1a4b]/70"
                style={{ 
                  fontSize: '17px',
                  letterSpacing: '0.01em'
                }}
              >
                Preparing for the Real World
              </p>
            </div>
          </div>
        </div>
        
        {/* CSS Animation for fade-in */}
        <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>

        {/* Spacer */}
        <div style={{ height: '1px' }}></div>
        
        {/* Welcome Text */}
        <div className="text-center space-y-2" style={{ marginTop: '30px', marginBottom: '25px' }}>
          <h2 className="text-lg font-semibold text-[#0d1a4b]" style={{ fontSize: '18px' }}>Create your account</h2>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="p-4 text-red-600 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl shadow-sm mb-5" style={{ fontSize: '14px' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Email Input */}
          <div style={{ marginBottom: '10px', width: '100%' }}>
            {email && !validateEmail(email) && (
              <p className="text-red-500" style={{ fontSize: '14px', marginBottom: '10px' }}>
                ⚠️ Please use your Rice University email address (@rice.edu or @alumni.rice.edu), Gmail address (@gmail.com), or Yahoo address (@yahoo.com)
              </p>
            )}
            <label className="block font-semibold text-[#0d1a4b] mb-2" style={{ fontSize: '14px' }}>Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="username@rice.edu, username@alumni.rice.edu, username@gmail.com, or username@yahoo.com"
                              pattern=".*@(rice\.edu|alumni\.rice\.edu|gmail\.com|yahoo\.com)$"
                title="Please use your Rice University email address (@rice.edu or @alumni.rice.edu), Gmail address (@gmail.com), or Yahoo address (@yahoo.com)"
              style={{ height: '42px', fontSize: '14px', borderRadius: '10px', width: '100%', boxSizing: 'border-box', border: '2px solid #d1d5db' }}
              className="px-4 text-[#0d1a4b] bg-white
              placeholder-gray-400 transition-all duration-200
              hover:border-[#fdb913] hover:shadow-sm focus:border-[#fdb913]
              focus:ring-2 focus:ring-[#fdb913] focus:ring-opacity-30 focus:outline-none focus:shadow-md"
            />
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: '15px', width: '100%' }}>
            <label className="block font-semibold text-[#0d1a4b] mb-2" style={{ fontSize: '14px' }}>Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                style={{ height: '42px', fontSize: '14px', borderRadius: '10px', width: '100%', boxSizing: 'border-box', paddingRight: '50px', border: '2px solid #d1d5db' }}
                className="px-4 text-[#0d1a4b] bg-white
                placeholder-gray-400 transition-all duration-200
                hover:border-[#fdb913] hover:shadow-sm focus:border-[#fdb913]
                focus:ring-2 focus:ring-[#fdb913] focus:ring-opacity-30 focus:outline-none focus:shadow-md"
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
            <label className="block font-semibold text-[#0d1a4b] mb-2" style={{ fontSize: '14px' }}>Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                style={{ height: '42px', fontSize: '14px', borderRadius: '10px', width: '100%', boxSizing: 'border-box', paddingRight: '50px', border: '2px solid #d1d5db' }}
                className="px-4 text-[#0d1a4b] bg-white
                placeholder-gray-400 transition-all duration-200
                hover:border-[#fdb913] hover:shadow-sm focus:border-[#fdb913]
                focus:ring-2 focus:ring-[#fdb913] focus:ring-opacity-30 focus:outline-none focus:shadow-md"
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

          {/* Sign Up Button */}
          <div style={{ marginTop: '15px', marginBottom: '10px', width: '100%' }}>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 text-[#0d1a4b] bg-white
              hover:bg-gradient-to-r hover:from-[#fffde7] hover:to-yellow-50 hover:border-[#fdb913] 
              hover:shadow-md focus:border-[#fdb913] transition-all duration-200 transform hover:scale-[1.02]
              focus:ring-2 focus:ring-[#fdb913] focus:ring-opacity-30 focus:outline-none
              text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ height: '42px', fontSize: '14px', borderRadius: '10px', width: '100%', boxSizing: 'border-box', border: '2px solid #d1d5db' }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
        </form>

        {/* Sign In Link */}
        <div className="text-center mt-8">
          <p className="text-[#0d1a4b]" style={{ fontSize: '14px' }}>
            Already have an account?{' '}
            <Link to="/" className="text-[#0d1a4b] hover:text-[#162456]" style={{ fontSize: '14px' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 