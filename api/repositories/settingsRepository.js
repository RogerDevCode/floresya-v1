import { supabase, DB_SCHEMA } from '../services/supabaseClient.js'
import { withErrorMapping } from '../middleware/error/index.js'
import { DatabaseError, DatabaseConstraintError, InternalServerError } from '../errors/AppError.js'

const TABLE = DB_SCHEMA.settings.table

export const findAll = withErrorMapping(
  async (filters = {}) => {
    let query = supabase.from(TABLE).select('*')

    if (!filters.includeDeactivated) {
      query = query.eq('active', true)
    }

    if (filters.publicOnly) {
      query = query.eq('is_public', true)
    }

    query = query.order('key', { ascending: true })

    const { data, error } = await query

    if (error) {
      throw new DatabaseError('SELECT', TABLE, error)
    }
    return data
  },
  'SELECT',
  TABLE
)

export const findByKey = withErrorMapping(
  async (key, includeDeactivated = false) => {
    let query = supabase.from(TABLE).select('*').eq('key', key)

    if (!includeDeactivated) {
      query = query.eq('active', true)
    }

    const { data, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new DatabaseError('SELECT', TABLE, error, { key })
    }
    return data
  },
  'SELECT',
  TABLE
)

export const findByKeys = withErrorMapping(
  async keys => {
    const { data, error } = await supabase.from(TABLE).select('*').in('key', keys)

    if (error) {
      throw new DatabaseError('SELECT', TABLE, error, { keys })
    }
    return data
  },
  'SELECT',
  TABLE
)

export const create = withErrorMapping(
  async newSetting => {
    const { data, error } = await supabase.from(TABLE).insert(newSetting).select().single()

    if (error) {
      if (error.code === '23505') {
        throw new DatabaseConstraintError('unique_key', TABLE, {
          key: newSetting.key,
          message: `Setting with key "${newSetting.key}" already exists`
        })
      }
      throw new DatabaseError('INSERT', TABLE, error, { settingData: newSetting })
    }

    if (!data) {
      throw new DatabaseError(
        'INSERT',
        TABLE,
        new InternalServerError('No data returned after insert'),
        { settingData: newSetting }
      )
    }
    return data
  },
  'INSERT',
  TABLE
)

export const update = withErrorMapping(
  async (key, sanitizedUpdates) => {
    const { data, error } = await supabase
      .from(TABLE)
      .update(sanitizedUpdates)
      .eq('key', key)
      .select()
      .single()

    if (error) {
      throw new DatabaseError('UPDATE', TABLE, error, { key })
    }
    return data
  },
  'UPDATE',
  TABLE
)

export const softDelete = withErrorMapping(
  async key => {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ active: false })
      .eq('key', key)
      .eq('active', true)
      .select()
      .single()

    if (error) {
      throw new DatabaseError('UPDATE', TABLE, error, { key })
    }
    return data
  },
  'UPDATE',
  TABLE
)

export const reactivate = withErrorMapping(
  async key => {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ active: true })
      .eq('key', key)
      .eq('active', false)
      .select()
      .single()

    if (error) {
      throw new DatabaseError('UPDATE', TABLE, error, { key })
    }
    return data
  },
  'UPDATE',
  TABLE
)
