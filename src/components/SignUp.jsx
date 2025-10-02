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

        <div style={{ height: '1px' }}></div>
        
        {/* Welcome Text */}
        <div className="text-center space-y-2" style={{ marginTop: '25px', marginBottom: '25px' }}>
          <h2 className="text-base text-[#0d1a4b]" style={{ fontSize: '16px' }}>Create your account</h2>
        </div>

        {/* Form */}
        <form className="space-y-0" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 mb-4 text-red-500 bg-red-50 rounded-md" style={{ fontSize: '14px', marginBottom: '10px' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Email Input */}
          <div style={{ marginBottom: '15px', width: '100%' }}>
            {email && !validateEmail(email) && (
              <p className="text-red-500" style={{ fontSize: '14px', marginBottom: '10px' }}>
                ⚠️ Please use your Rice University email address (@rice.edu or @alumni.rice.edu), Gmail address (@gmail.com), or Yahoo address (@yahoo.com)
              </p>
            )}
            <label className="block font-medium text-[#0d1a4b] mb-2" style={{ fontSize: '14px' }}>Rice Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="username@rice.edu, username@alumni.rice.edu, username@gmail.com, or username@yahoo.com"
                              pattern=".*@(rice\.edu|alumni\.rice\.edu|gmail\.com|yahoo\.com)$"
                title="Please use your Rice University email address (@rice.edu or @alumni.rice.edu), Gmail address (@gmail.com), or Yahoo address (@yahoo.com)"
              style={{ height: '37px', fontSize: '14px', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }}
              className="px-3 border border-gray-100 text-[#0d1a4b] 
              placeholder-gray-400 transition-colors duration-200
              hover:border-[#fdb913] focus:border-[#fdb913]
              focus:ring-2 focus:ring-[#fdb913] focus:ring-opacity-50 focus:outline-none"
            />
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: '15px', width: '100%' }}>
            <label className="block font-medium text-[#0d1a4b] mb-2" style={{ fontSize: '14px' }}>Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
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
            <label className="block font-medium text-[#0d1a4b] mb-2" style={{ fontSize: '14px' }}>Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
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

          {/* Sign Up Button */}
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