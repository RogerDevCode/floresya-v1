/**
 * AuthService
 * Handles user authentication and profile management
 * @typedef {import('../types/index.js').User} User
 */

import { supabase, isSupabaseConfigured } from './supabase.js'

export class AuthService {
  constructor() {
    this.currentUser = null
    this.loadSession()
  }

  /**
   * Load existing session
   * @private
   */
  async loadSession() {
    if (!isSupabaseConfigured()) {
      return
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        this.currentUser = session.user
        console.log('✅ Session restored:', session.user.email)
      }
    } catch (error) {
      console.error('Failed to load session:', error)
    }
  }

  /**
   * Sign up new user
   * @param {string} email
   * @param {string} password
   * @param {Object} metadata
   * @returns {Promise<User>}
   */
  async signUp(email, password, metadata = {}) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured')
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })

      if (error) {
        throw error
      }

      // Create profile
      if (data.user) {
        await this.createProfile(data.user.id, email, metadata)
        this.currentUser = data.user
      }

      return data.user
    } catch (error) {
      console.error('Sign up failed:', error)
      throw error
    }
  }

  /**
   * Sign in existing user
   * @param {string} email
   * @param {string} password
   * @returns {Promise<User>}
   */
  async signIn(email, password) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured')
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        throw error
      }

      this.currentUser = data.user
      return data.user
    } catch (error) {
      console.error('Sign in failed:', error)
      throw error
    }
  }

  /**
   * Sign out current user
   * @returns {Promise<void>}
   */
  async signOut() {
    if (!isSupabaseConfigured()) {
      this.currentUser = null
      return
    }

    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
      this.currentUser = null
    } catch (error) {
      console.error('Sign out failed:', error)
      throw error
    }
  }

  /**
   * Get current user
   * @returns {User|null}
   */
  getCurrentUser() {
    return this.currentUser
  }

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return this.currentUser !== null
  }

  /**
   * Create user profile
   * @private
   * @param {string} userId
   * @param {string} email
   * @param {Object} metadata
   * @returns {Promise<void>}
   */
  async createProfile(userId, email, metadata = {}) {
    if (!isSupabaseConfigured()) {
      return
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email,
          full_name: metadata.full_name || null,
          phone: metadata.phone || null,
          address: metadata.address || null
        })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Failed to create profile:', error)
      throw error
    }
  }

  /**
   * Get user profile
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async getProfile(userId) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured')
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Failed to get profile:', error)
      throw error
    }
  }

  /**
   * Update user profile
   * @param {string} userId
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  async updateProfile(userId, updates) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured')
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Failed to update profile:', error)
      throw error
    }
  }

  /**
   * Reset password
   * @param {string} email
   * @returns {Promise<void>}
   */
  async resetPassword(email) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured')
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Password reset failed:', error)
      throw error
    }
  }

  /**
   * Listen to auth state changes
   * @param {Function} callback
   * @returns {Object} Subscription object
   */
  onAuthStateChange(callback) {
    if (!isSupabaseConfigured()) {
      return { unsubscribe: () => {} }
    }

    return supabase.auth.onAuthStateChange((event, session) => {
      this.currentUser = session?.user || null
      callback(event, session)
    })
  }
}