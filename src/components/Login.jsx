import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'
import logo from '../assets/logo with name for univ154.png'
import riceLogo from '../assets/rice-logo.png'

export default function Login() {
  const [rememberMe, setRememberMe] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const { signIn, signInWithGoogle, resetPassword } = useAuth()

  const validateEmail = (email) => {
    const riceEmailRegex = /@rice\.edu$/
    return riceEmailRegex.test(email)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // First check if the account exists
      const { data: user } = await supabase
        .from('auth.users')
        .select('email')
        .eq('email', email)
        .single()

      if (!user) {
        setError('No account found with this email. Please sign up first.')
        setLoading(false)
        return
      }

      // If account exists, proceed with login
      const { error: signInError } = await signIn(email, password)
      
      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Incorrect password. Please try again.')
        } else {
          setError(signInError.message)
        }
      } else {
        navigate('/dashboard')
      }
    } catch (error) {
      setError('Failed to log in. Please try again.')
    }

    setLoading(false)
  }

  const handleGoogleSignIn = async () => {
    try {
      setError('')
      setLoading(true)
      const { error } = await signInWithGoogle()
      
      if (error) {
        console.error('Google sign in error:', error)
        if (error.message.includes('Rice University email address')) {
          setError('Please use your Rice University email address (@rice.edu)')
        } else {
          setError(error.message || 'Failed to sign in with Google')
        }
      }
      // The OAuth redirect will handle navigation to dashboard
    } catch (error) {
      console.error('Google sign in error:', error)
      setError('Failed to sign in with Google. Please ensure you use your Rice email.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email address')
      return
    }

    try {
      // First check if the account exists
      const { data: user } = await supabase
        .from('auth.users')
        .select('email')
        .eq('email', email)
        .single()

      if (!user) {
        setError('No account found with this email. Please sign up first.')
        return
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email)
      
      if (error) {
        setError(error.message)
      } else {
        setMessage('Password reset instructions have been sent to your email.')
        setError('')
      }
    } catch (error) {
      setError('Failed to send reset instructions. Please try again.')
    }
  }

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
    if (error && validateEmail(e.target.value)) {
      setError('')
    }
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
          
          <div className="flex flex-col items-center border-t-2 border-b-2 border-[#0d1a4b] py-4 px-4">
            <div className="flex flex-col items-center" style={{ marginBottom: '-1.5rem' }}>
              <img 
                src={logo} 
                alt="UNIV154 Logo" 
                style={{ height: '140px', width: 'auto', marginLeft: '-10px' }} 
                /*style={{ height: '140px', width: 'auto', marginLeft: '-10px', transform: 'rotate(0deg)' }}*/
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
          <h2 className="text-base text-[#0d1a4b]" style={{ fontSize: '16px' }}>Please sign in to your account</h2>
        </div>

        {/* Form */}
        <form className="space-y-0" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          {message && (
            <div className="p-3 mb-4 text-sm text-green-500 bg-green-50 rounded-md">
              {message}
            </div>
          )}

          {/* Email Input */}
          <div style={{ marginBottom: '15px', width: '100%' }}>
            <label className="block font-medium text-[#0d1a4b] mb-2" style={{ fontSize: '14px' }}>Rice Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={handleEmailChange}
              placeholder="username@rice.edu"
              pattern=".*@rice\.edu$"
              title="Please use your Rice University email address"
              style={{ height: '37px', fontSize: '14px', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }}
              className="px-3 border border-gray-100 text-[#0d1a4b] 
              placeholder-gray-400 transition-colors duration-200
              hover:border-[#fdb913] focus:border-[#fdb913]
              focus:ring-2 focus:ring-[#fdb913] focus:ring-opacity-50 focus:outline-none"
            />
            {email && !validateEmail(email) && (
              <p className="mt-1 text-sm text-red-500">
                Please use your Rice University email address
              </p>
            )}
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: '15px', width: '100%' }}>
            <label className="block font-medium text-[#0d1a4b] mb-2" style={{ fontSize: '14px' }}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{ height: '37px', fontSize: '14px', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }}
              className="px-3 border border-gray-100 text-[#0d1a4b] 
              placeholder-gray-400 transition-colors duration-200
              hover:border-[#fdb913] focus:border-[#fdb913]
              focus:ring-2 focus:ring-[#fdb913] focus:ring-opacity-50 focus:outline-none"
            />
          </div>

          {/* Remember Me and Forgot Password */}
          <div className="flex items-center justify-between" style={{ marginBottom: '15px', width: '99.9%' }}>
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 border-gray-300 rounded text-[#0d1a4b]"
              />
              <label htmlFor="remember-me" className="ml-2 text-[#0d1a4b]" style={{ fontSize: '14px' }}>
                Remember me
              </label>
            </div>
            <button
              onClick={handleForgotPassword}
              className="text-[#0d1a4b] hover:text-[#162456]"
              style={{ fontSize: '14px' }}
            >
              Forgot your password?
            </button>
          </div>

          {/* Submit Button */}
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
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          {/* Or continue with */}
          <div className="text-center space-y-4" style={{ width: '100%' }}>
            <p className="text-[#0d1a4b]" style={{ marginBottom: '15px', marginTop: '15px', fontSize: '14px' }}>or</p>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="border border-gray-200 text-[#0d1a4b] font-medium
              shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0d1a4b] focus:ring-offset-2
              transition-all duration-200 ease-in-out flex items-center justify-center gap-3
              hover:border-[#0d1a4b] hover:text-[#162456] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ height: '37px', fontSize: '14px', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 24" width="16" style={{ marginRight: '6px' }}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {loading ? 'Signing in...' : 'Continue with Google'}
            </button>
          </div>
        </form>

        {/* Sign Up Link */}
        <div className="text-center mt-8">
          <p className="text-[#0d1a4b]" style={{ fontSize: '14px' }}>
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#0d1a4b] hover:text-[#162456]" style={{ fontSize: '14px' }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
