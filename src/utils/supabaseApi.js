import { supabase, handleSupabaseError } from '../lib/supabase'

// ============= USER MANAGEMENT =============

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  } catch (error) {
    handleSupabaseError(error)
  }
}

export const signUp = async (email, password, userData = {}) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    if (error) throw error

    // Create user profile in our users table
    if (data.user) {
      const { error: profileError } = await supabase
        .from('app_061iy_users')
        .insert({
          id: data.user.id,
          email: data.user.email,
          full_name: userData.full_name || '',
          role: 'user'
        })
      if (profileError) throw profileError
    }

    return data
  } catch (error) {
    handleSupabaseError(error)
  }
}

export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return data
  } catch (error) {
    handleSupabaseError(error)
  }
}

export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) throw error
    return data
  } catch (error) {
    handleSupabaseError(error)
  }
}



export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    handleSupabaseError(error)
  }
}

export const updateUserProfile = async (updates) => {
  try {
    const user = await getCurrentUser()
    const { data, error } = await supabase
      .from('app_061iy_users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    handleSupabaseError(error)
  }
}

// ============= PROFILE MANAGEMENT =============

export const getAllProfiles = async () => {
  try {
    const user = await getCurrentUser()
    const { data, error } = await supabase
      .from('app_061iy_profiles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data || []
  } catch (error) {
    handleSupabaseError(error)
  }
}

export const getProfile = async (profileId) => {
  try {
    const user = await getCurrentUser()
    const { data, error } = await supabase
      .from('app_061iy_profiles')
      .select('*')
      .eq('id', profileId)
      .eq('user_id', user.id)
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    handleSupabaseError(error)
  }
}

export const createProfile = async (profileData) => {
  try {
    const user = await getCurrentUser()
    const { data, error } = await supabase
      .from('app_061iy_profiles')
      .insert({
        ...profileData,
        user_id: user.id
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    handleSupabaseError(error)
  }
}

export const updateProfile = async (profileId, updates) => {
  try {
    const user = await getCurrentUser()
    const { data, error } = await supabase
      .from('app_061iy_profiles')
      .update(updates)
      .eq('id', profileId)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    handleSupabaseError(error)
  }
}

export const deleteProfile = async (profileId) => {
  try {
    const user = await getCurrentUser()
    const { error } = await supabase
      .from('app_061iy_profiles')
      .delete()
      .eq('id', profileId)
      .eq('user_id', user.id)
    
    if (error) throw error
  } catch (error) {
    handleSupabaseError(error)
  }
}

// ============= EYE METRICS MANAGEMENT =============

export const getAllEyeMetrics = async (profileId = null) => {
  try {
    const user = await getCurrentUser()
    let query = supabase
      .from('app_061iy_eye_metrics')
      .select(`
        *,
        app_061iy_profiles!inner (
          id,
          name,
          user_id
        )
      `)
      .eq('app_061iy_profiles.user_id', user.id)
      .order('record_date', { ascending: false })

    if (profileId) {
      query = query.eq('profile_id', profileId)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  } catch (error) {
    handleSupabaseError(error)
  }
}

export const createEyeMetric = async (metricData) => {
  try {
    const user = await getCurrentUser()
    const { data, error } = await supabase
      .from('app_061iy_eye_metrics')
      .insert({
        ...metricData,
        created_by: user.id
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    handleSupabaseError(error)
  }
}

export const updateEyeMetric = async (metricId, updates) => {
  try {
    const { data, error } = await supabase
      .from('app_061iy_eye_metrics')
      .update(updates)
      .eq('id', metricId)
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    handleSupabaseError(error)
  }
}

export const deleteEyeMetric = async (metricId) => {
  try {
    const { error } = await supabase
      .from('app_061iy_eye_metrics')
      .delete()
      .eq('id', metricId)
    
    if (error) throw error
  } catch (error) {
    handleSupabaseError(error)
  }
}

// ============= REMINDERS MANAGEMENT =============

export const getAllReminders = async () => {
  try {
    const user = await getCurrentUser()
    const { data, error } = await supabase
      .from('app_061iy_reminders')
      .select(`
        *,
        app_061iy_profiles (
          id,
          name
        )
      `)
      .eq('user_id', user.id)
      .order('reminder_date', { ascending: true })
    
    if (error) throw error
    return data || []
  } catch (error) {
    handleSupabaseError(error)
  }
}

export const createReminder = async (reminderData) => {
  try {
    const user = await getCurrentUser()
    const { data, error } = await supabase
      .from('app_061iy_reminders')
      .insert({
        ...reminderData,
        user_id: user.id
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    handleSupabaseError(error)
  }
}

export const updateReminder = async (reminderId, updates) => {
  try {
    const user = await getCurrentUser()
    const { data, error } = await supabase
      .from('app_061iy_reminders')
      .update(updates)
      .eq('id', reminderId)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    handleSupabaseError(error)
  }
}

export const deleteReminder = async (reminderId) => {
  try {
    const user = await getCurrentUser()
    const { error } = await supabase
      .from('app_061iy_reminders')
      .delete()
      .eq('id', reminderId)
      .eq('user_id', user.id)
    
    if (error) throw error
  } catch (error) {
    handleSupabaseError(error)
  }
}

// ============= APPOINTMENTS MANAGEMENT =============

export const getAllDoctors = async () => {
  try {
    const { data, error } = await supabase
      .from('app_061iy_doctors')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) throw error
    return data || []
  } catch (error) {
    handleSupabaseError(error)
  }
}

export const getAllAppointments = async () => {
  try {
    const user = await getCurrentUser()
    const { data, error } = await supabase
      .from('app_061iy_appointments')
      .select(`
        *,
        app_061iy_profiles (
          id,
          name
        ),
        app_061iy_doctors (
          id,
          name,
          specialty,
          location
        )
      `)
      .eq('user_id', user.id)
      .order('appointment_date', { ascending: true })
    
    if (error) throw error
    return data || []
  } catch (error) {
    handleSupabaseError(error)
  }
}

export const createAppointment = async (appointmentData) => {
  try {
    const user = await getCurrentUser()
    const { data, error } = await supabase
      .from('app_061iy_appointments')
      .insert({
        ...appointmentData,
        user_id: user.id
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    handleSupabaseError(error)
  }
}

export const updateAppointment = async (appointmentId, updates) => {
  try {
    const user = await getCurrentUser()
    const { data, error } = await supabase
      .from('app_061iy_appointments')
      .update(updates)
      .eq('id', appointmentId)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    handleSupabaseError(error)
  }
}

export const deleteAppointment = async (appointmentId) => {
  try {
    const user = await getCurrentUser()
    const { error } = await supabase
      .from('app_061iy_appointments')
      .delete()
      .eq('id', appointmentId)
      .eq('user_id', user.id)
    
    if (error) throw error
  } catch (error) {
    handleSupabaseError(error)
  }
}

// ============= MEDICATIONS MANAGEMENT =============

export const getAllMedications = async () => {
  try {
    const user = await getCurrentUser()
    const { data, error } = await supabase
      .from('app_061iy_medications')
      .select(`
        *,
        app_061iy_profiles!inner (
          id,
          name,
          user_id
        )
      `)
      .eq('app_061iy_profiles.user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    handleSupabaseError(error)
  }
}

export const createMedication = async (medicationData) => {
  try {
    const { data, error } = await supabase
      .from('app_061iy_medications')
      .insert(medicationData)
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    handleSupabaseError(error)
  }
}

export const updateMedication = async (medicationId, updates) => {
  try {
    const { data, error } = await supabase
      .from('app_061iy_medications')
      .update(updates)
      .eq('id', medicationId)
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    handleSupabaseError(error)
  }
}

export const deleteMedication = async (medicationId) => {
  try {
    const { error } = await supabase
      .from('app_061iy_medications')
      .delete()
      .eq('id', medicationId)
    
    if (error) throw error
  } catch (error) {
    handleSupabaseError(error)
  }
}

// ============= SHARED LINKS MANAGEMENT =============

export const createSharedLink = async (profileId, dataTypes, expirationDays = 7, recipientEmail = null) => {
  try {
    const user = await getCurrentUser()
    const accessToken = crypto.randomUUID()
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + expirationDays)

    const { data, error } = await supabase
      .from('app_061iy_shared_links')
      .insert({
        user_id: user.id,
        profile_id: profileId,
        access_token: accessToken,
        expiration_date: expirationDate.toISOString(),
        included_data_types: dataTypes,
        recipient_email: recipientEmail
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    handleSupabaseError(error)
  }
}

export const getSharedData = async (accessToken) => {
  try {
    const { data: sharedLink, error } = await supabase
      .from('app_061iy_shared_links')
      .select(`
        *,
        app_061iy_profiles (
          id,
          name,
          relationship,
          date_of_birth
        )
      `)
      .eq('access_token', accessToken)
      .gt('expiration_date', new Date().toISOString())
      .single()
    
    if (error) throw error
    
    // Update last accessed
    await supabase
      .from('app_061iy_shared_links')
      .update({ last_accessed: new Date().toISOString() })
      .eq('access_token', accessToken)

    return sharedLink
  } catch (error) {
    handleSupabaseError(error)
  }
}

// ============= REAL-TIME SUBSCRIPTIONS =============

export const subscribeToUserData = (userId, callback) => {
  return supabase
    .channel('user-data-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'app_061iy_profiles',
      filter: `user_id=eq.${userId}`
    }, callback)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'app_061iy_eye_metrics'
    }, callback)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'app_061iy_reminders',
      filter: `user_id=eq.${userId}`
    }, callback)
    .subscribe()
}

export const unsubscribeFromUserData = (subscription) => {
  if (subscription) {
    supabase.removeChannel(subscription)
  }
}

// ============= SOCIAL AUTH USER PROFILE CREATION =============

export const ensureUserProfile = async (user) => {
  try {
    // Check if user profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('app_061iy_users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      // Error other than "not found"
      console.error('Error checking user profile:', checkError)
      return false
    }

    if (!existingProfile) {
      // Create user profile for social login users
      const { error: createError } = await supabase
        .from('app_061iy_users')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
          role: 'user'
        })

      // Handle duplicate key error gracefully (user already exists)
      if (createError && createError.code === '23505') {
        console.log('User profile already exists, continuing...')
        return true
      }
      
      if (createError) {
        console.error('Error creating user profile:', createError)
        return false
      }
    }

    console.log('User profile ensured successfully')
    return true
  } catch (error) {
    console.error('Error ensuring user profile:', error)
    // Don't throw error to avoid blocking authentication
    return false
  }
}