import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/logo with name for univ154.png'
import riceLogo from '../assets/rice-logo.png'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
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
    const riceEmailRegex = /@rice\.edu$/
    return riceEmailRegex.test(email)
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
      setError('Please use your Rice University email address')
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
      const { error } = await signUp(email, password)
      
      if (error) {
        throw error
      }

      // Success - show confirmation message and redirect to login
      navigate('/signup-success')
    } catch (error) {
      setError(error.message || 'Failed to create an account')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[400px] space-y-6 bg-white p-8 rounded-lg shadow-sm px-6">
        {/* Logo and Title Section */}
        <div className="flex flex-col items-center">
          <img 
            src={riceLogo} 
            alt="Rice University Logo" 
            style={{ height: '100px', width: 'auto', marginBottom: '45px' }}
            className="object-contain"
          />
          
          <div className="flex flex-col items-center border-t-2 border-b-2 border-[#A4907C] py-4 px-4">
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
        <div style={{ height: '25px' }}></div>
        
        {/* Welcome Text */}
        <div className="text-center space-y-2" style={{ marginTop: '20px' }}>
          <h2 className="text-base text-[#0d1a4b]" style={{ fontSize: '16px' }}>Create your account</h2>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          {/* Email Input */}
          <div>
            <label className="block font-medium text-[#0d1a4b]" style={{ fontSize: '14px' }}>Rice Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="username@rice.edu"
                pattern=".*@rice\.edu$"
                title="Please use your Rice University email address"
                style={{ height: '30px', fontSize: '14px' }}
                className="w-full px-3 border border-gray-100 rounded-md text-[#0d1a4b] 
                placeholder-gray-400 transition-colors duration-200
                hover:border-[#fdb913] focus:border-[#fdb913]
                focus:ring-2 focus:ring-[#fdb913] focus:ring-opacity-50 focus:outline-none"
              />
            </div>
            {email && !validateEmail(email) && (
              <p className="mt-1 text-sm text-red-500">
                Please use your Rice University email address
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label className="block font-medium text-[#0d1a4b]" style={{ fontSize: '14px' }}>Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                style={{ height: '30px', fontSize: '14px' }}
                className="w-full px-3 border border-gray-100 rounded-md text-[#0d1a4b] 
                placeholder-gray-400 transition-colors duration-200
                hover:border-[#fdb913] focus:border-[#fdb913]
                focus:ring-2 focus:ring-[#fdb913] focus:ring-opacity-50 focus:outline-none"
              />
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
          <div>
            <label className="block font-medium text-[#0d1a4b]" style={{ fontSize: '14px' }}>Confirm Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                style={{ height: '30px', fontSize: '14px' }}
                className="w-full px-3 border border-gray-100 rounded-md text-[#0d1a4b] 
                placeholder-gray-400 transition-colors duration-200
                hover:border-[#fdb913] focus:border-[#fdb913]
                focus:ring-2 focus:ring-[#fdb913] focus:ring-opacity-50 focus:outline-none"
              />
            </div>
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={loading}
            style={{ height: '30px', marginTop: '0.5rem', fontSize: '14px' }}
            className="w-full bg-[#A4907C] text-white px-4 rounded-md font-semibold
            shadow-sm hover:bg-[#8B7355] focus:outline-none focus:ring-2 focus:ring-[#A4907C] 
            focus:ring-offset-2 transition-all duration-200 ease-in-out transform hover:-translate-y-0.5
            disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Sign In Link */}
        <div className="text-center pt-4">
          <p className="text-[#0d1a4b]" style={{ fontSize: '14px' }}>
            Already have an account?{' '}
            <Link to="/" className="text-[#A4907C] hover:text-[#8B7355]" style={{ fontSize: '14px' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 