/**
 * AuthService
 * Business logic for authentication operations
 */

import { supabase } from './supabaseClient.js'

/**
 * Verify user token
 * @param {string} token
 * @returns {Promise<Object>}
 */
export async function verifyUser(token) {
  try {
    if (!token || typeof token !== 'string') {
      throw new Error('Token inválido')
    }

    const {
      data: { user },
      error
    } = await supabase.auth.getUser(token)

    if (error) {
      throw new Error(`Error de autenticación: ${error.message}`)
    }
    if (!user) {
      throw new Error('Usuario no encontrado')
    }

    return user
  } catch (error) {
    console.error('authService.verifyUser() falló:', error)
    throw error
  }
}
