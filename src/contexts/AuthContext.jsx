import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext({})

export function useAuth() {
  return useContext(AuthContext)
}

// Helper function to validate Rice and Gmail email addresses
const isValidEmail = (email) => {
  return email.endsWith('@rice.edu') || email.endsWith('@alumni.rice.edu') || email.endsWith('@gmail.com');
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active sessions and sets the user
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (!error && session?.user) {
        setUser(session.user)
      }
      setLoading(false)
    }
    
    getSession()

    // Listen for changes on auth state (signed in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change event:', event);
      console.log('Auth state change session:', session);
      console.log('Auth state change user:', session?.user);
      
      if (event === 'SIGNED_IN') {
        const user = session?.user
        
        console.log('User signed in:', user);
        console.log('User email:', user?.email);
        
        // Check if the email is from Rice University or Gmail
        if (user && !isValidEmail(user.email)) {
          // Sign out the user if not a valid email
          await supabase.auth.signOut()
          console.error('Invalid email attempted to sign in:', user.email)
          // Don't throw error here as it might cause issues with the auth flow
          setUser(null)
          return
        }

        setUser(user)
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setUser(null)
        // Don't clear remember me data on sign out
        // This allows the user to stay logged in if they chose "Remember me"
        // Only clear if it's a manual sign out (not session expiry)
      } else if (event === 'TOKEN_REFRESHED') {
        // Update user data when token is refreshed
        if (session?.user) {
          console.log('Token refreshed, updating user:', session.user);
          setUser(session.user)
        }
      } else if (event === 'TOKEN_REFRESHED_FAILED') {
        // If token refresh fails, clear remember me data
        localStorage.removeItem('rememberMe')
        localStorage.removeItem('savedEmail')
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email, password) => {
    try {
      console.log('AuthContext signUp called with:', { email, password: '***' })
      
      if (!isValidEmail(email)) {
        throw new Error('Please use your Rice University email address (@rice.edu or @alumni.rice.edu) or Gmail address (@gmail.com)')
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      console.log('Supabase signUp response:', { data, error })
      console.log('User data details:', {
        user: data?.user,
        email_confirmed_at: data?.user?.email_confirmed_at,
        created_at: data?.user?.created_at,
        updated_at: data?.user?.updated_at
      })

      if (error) {
        console.log('Supabase signUp error details:', error)
        throw error
      }

      // Check if this is an existing user by comparing created_at with current date
      if (data?.user?.created_at) {
        const createdDate = new Date(data.user.created_at)
        const currentDate = new Date()
        const timeDiff = currentDate.getTime() - createdDate.getTime()
        const daysDiff = timeDiff / (1000 * 3600 * 24)
        
        console.log('Days since user creation:', daysDiff)
        
        // If user was created more than 1 day ago, it's an existing user
        if (daysDiff > 1) {
          console.log('This is an existing user, not a new signup')
          throw new Error('An account with this email already exists. Please sign in instead.')
        }
      }

      return { data, error: null }
    } catch (error) {
      console.error('AuthContext signUp error:', error)
      return { data: null, error }
    }
  }

  const signIn = async (email, password, rememberMe = false) => {
    try {
      if (!isValidEmail(email)) {
        throw new Error('Please use your Rice University email address (@rice.edu or @alumni.rice.edu) or Gmail address (@gmail.com)')
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          // If rememberMe is true, set a longer session duration
          // If false, use default session duration
          persistSession: true, // Always persist session
        }
      })

      if (error) throw error

      // If rememberMe is false, we could set a shorter session duration
      // But Supabase handles this automatically based on user activity
      if (!rememberMe) {
        // For non-remember me, we could implement additional logic
        // like setting a shorter session timeout, but Supabase handles this well
        console.log('User chose not to remember login')
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google OAuth sign in...');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            // Removed hosted_domain and hd restrictions to allow Gmail accounts
            // hosted_domain: 'rice.edu', // Restrict to rice.edu domain only
            // hd: 'rice.edu', // Additional hosted domain parameter
          },
          redirectTo: `${window.location.origin}/dashboard`
        },
      })

      if (error) {
        console.error('Google OAuth error:', error);
        throw error;
      }
      
      console.log('Google OAuth initiated successfully:', data);
      return { data, error: null }
    } catch (error) {
      console.error('Google sign in error:', error)
      return { data: null, error }
    }
  }

  const resetPassword = async (email) => {
    try {
      if (!isValidEmail(email)) {
        throw new Error('Please use your Rice University email address (@rice.edu or @alumni.rice.edu) or Gmail address (@gmail.com)')
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      })

      if (error) throw error

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Only clear remember me data if user explicitly wants to forget
      // This allows the "Remember me" feature to work properly
      // User can manually clear this by unchecking the checkbox
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    resetPassword,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 