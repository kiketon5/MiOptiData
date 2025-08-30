import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hmpjcpmyonhtzmxhhnsk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtcGpjcG15b25odHpteGhobnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMTE4NzksImV4cCI6MjA3MTg4Nzg3OX0.YJL8OWfjnZfZ9b8e5n0jZZqRzxwHkMJVdJlaS-el7z8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper function to handle Supabase errors
export const handleSupabaseError = (error) => {
  console.error('Supabase error:', error)
  if (error.message) {
    throw new Error(error.message)
  }
  throw error
}

// Helper function to ensure user is authenticated
export const ensureAuthenticated = () => {
  const { data: { user } } = supabase.auth.getUser()
  if (!user) {
    throw new Error('User must be authenticated')
  }
  return user
}