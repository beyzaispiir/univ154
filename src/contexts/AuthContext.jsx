import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext({})

export function useAuth() {
  return useContext(AuthContext)
}

// Helper function to validate Rice email addresses
const isValidRiceEmail = (email) => {
  return email.endsWith('@rice.edu') || email.endsWith('@alumni.rice.edu');
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
      if (event === 'SIGNED_IN') {
        const user = session?.user
        
        // Check if the email is from Rice University
        if (user && !isValidRiceEmail(user.email)) {
          // Sign out the user if not a Rice email
          await supabase.auth.signOut()
          throw new Error('Please use your Rice University email address')
        }

        setUser(user)
      } else if (event === 'SIGNED_OUT') {
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
      if (!isValidRiceEmail(email)) {
        throw new Error('Please use your Rice University email address')
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signIn = async (email, password) => {
    try {
      if (!isValidRiceEmail(email)) {
        throw new Error('Please use your Rice University email address')
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            hosted_domain: ['rice.edu', 'alumni.rice.edu'], // Correct way to specify multiple domains
          },
          redirectTo: `${window.location.origin}/dashboard`
        },
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Google sign in error:', error)
      return { data: null, error }
    }
  }

  const resetPassword = async (email) => {
    try {
      if (!isValidRiceEmail(email)) {
        throw new Error('Please use your Rice University email address')
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
      {!loading && children}
    </AuthContext.Provider>
  )
} 