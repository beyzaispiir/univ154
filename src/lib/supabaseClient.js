import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ssuheqfhbcuekkddomko.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzdWhlcWZoYmN1ZWtrZGRvbWtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc0MzU1ODAsImV4cCI6MjAyMzAxMTU4MH0.Yx4kAQEd4YHMXv6oHE1qP8uKVvKBSJ_lGR4dUZYE_HE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
