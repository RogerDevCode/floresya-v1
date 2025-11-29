import { supabase, DB_SCHEMA } from '../services/supabaseClient.js'
import { withErrorMapping } from '../middleware/error/index.js'
import { DatabaseError, DatabaseConstraintError, InternalServerError } from '../errors/AppError.js'
import { QUERY_LIMITS } from '../config/constants.js'

const TABLE = DB_SCHEMA.product_images?.table || 'product_images'

export const findAll = withErrorMapping(
  async (productId, filters = {}) => {
    let query = supabase.from(TABLE).select('*').eq('product_id', productId)

    if (filters.size) {
      query = query.eq('size', filters.size)
    }

    if (filters.is_primary !== undefined) {
      query = query.eq('is_primary', filters.is_primary)
    }

    query = query.order('image_index', { ascending: true })

    const { data, error } = await query

    if (error) {
      throw new DatabaseError('SELECT', TABLE, error, { productId })
    }
    return data
  },
  'SELECT',
  TABLE
)

export const findPrimary = withErrorMapping(
  async productId => {
    const { data: primaryImage, error: primaryError } = await supabase
      .from(TABLE)
      .select('*')
      .eq('product_id', productId)
      .eq('is_primary', true)
      .eq('size', 'medium')
      .single()

    if (primaryError) {
      if (primaryError.code === 'PGRST116') {
        return null // Not found
      }
      throw new DatabaseError('SELECT', TABLE, primaryError, { productId })
    }

    return primaryImage
  },
  'SELECT',
  TABLE
)

export const findFirstAvailable = withErrorMapping(
  async productId => {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('product_id', productId)
      .order('image_index', { ascending: true })
      .limit(QUERY_LIMITS.SINGLE_RECORD)
      .maybeSingle()

    if (error) {
      throw new DatabaseError('SELECT', TABLE, error, { productId })
    }
    return data
  },
  'SELECT',
  TABLE
)

export const findById = withErrorMapping(
  async (id, includeDeactivated = false) => {
    let query = supabase.from(TABLE).select('*').eq('id', id)

    if (!includeDeactivated) {
      query = query.eq('active', true)
    }

    const { data, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new DatabaseError('SELECT', TABLE, error, { imageId: id })
    }
    return data
  },
  'SELECT',
  TABLE
)

export const findByHash = withErrorMapping(
  async fileHash => {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('file_hash', fileHash)
      .limit(1)

    if (error) {
      throw new DatabaseError('SELECT', TABLE, error)
    }
    return data || []
  },
  'SELECT',
  TABLE
)

export const create = withErrorMapping(
  async newImage => {
    const { data, error } = await supabase.from(TABLE).insert(newImage).select().single()

    if (error) {
      if (error.code === '23505') {
        throw new DatabaseConstraintError('unique_image', TABLE, {
          product_id: newImage.product_id,
          image_index: newImage.image_index,
          size: newImage.size,
          message: `Image already exists for product ${newImage.product_id}, index ${newImage.image_index}, size ${newImage.size}`
        })
      }
      throw new DatabaseError('INSERT', TABLE, error, { imageData: newImage })
    }

    if (!data) {
      throw new DatabaseError(
        'INSERT',
        TABLE,
        new InternalServerError('No data returned after insert'),
        { imageData: newImage }
      )
    }
    return data
  },
  'INSERT',
  TABLE
)

export const createBatch = withErrorMapping(
  async (imagesToInsert, context = {}) => {
    const { data, error } = await supabase.from(TABLE).insert(imagesToInsert).select()

    if (error) {
      throw new DatabaseError('INSERT', TABLE, error, context)
    }
    if (!data) {
      throw new DatabaseError(
        'INSERT',
        TABLE,
        new InternalServerError('No data returned after insert'),
        context
      )
    }
    return data
  },
  'INSERT',
  TABLE
)

export const update = withErrorMapping(
  async (id, sanitizedUpdates) => {
    const { data, error } = await supabase
      .from(TABLE)
      .update(sanitizedUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new DatabaseError('UPDATE', TABLE, error, { imageId: id })
    }
    return data
  },
  'UPDATE',
  TABLE
)

export const unsetPrimary = withErrorMapping(
  async productId => {
    const { error } = await supabase
      .from(TABLE)
      .update({ is_primary: false })
      .eq('product_id', productId)
      .eq('is_primary', true)

    if (error) {
      throw new DatabaseError('UPDATE', TABLE, error, { productId })
    }
  },
  'UPDATE',
  TABLE
)

export const setPrimary = withErrorMapping(
  async (productId, imageIndex) => {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ is_primary: true })
      .eq('product_id', productId)
      .eq('image_index', imageIndex)
      .eq('size', 'medium')
      .select()
      .single()

    if (error) {
      throw new DatabaseError('UPDATE', TABLE, error, { productId, imageIndex })
    }
    return data
  },
  'UPDATE',
  TABLE
)

export const softDelete = withErrorMapping(
  async id => {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ active: false })
      .eq('id', id)
      .eq('active', true)
      .select()
      .single()

    if (error) {
      throw new DatabaseError('UPDATE', TABLE, error, { imageId: id })
    }
    return data
  },
  'DELETE',
  TABLE
)

export const reactivate = withErrorMapping(
  async id => {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ active: true })
      .eq('id', id)
      .eq('active', false)
      .select()
      .single()

    if (error) {
      throw new DatabaseError('UPDATE', TABLE, error, { imageId: id })
    }
    return data
  },
  'UPDATE',
  TABLE
)

export const softDeleteByProduct = withErrorMapping(
  async productId => {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ active: false })
      .eq('product_id', productId)
      .eq('active', true)
      .select()

    if (error) {
      throw new DatabaseError('UPDATE', TABLE, error, { productId })
    }
    return data
  },
  'DELETE',
  TABLE
)

export const reactivateByProduct = withErrorMapping(
  async productId => {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ active: true })
      .eq('product_id', productId)
      .eq('active', false)
      .select()

    if (error) {
      throw new DatabaseError('UPDATE', TABLE, error, { productId })
    }
    return data
  },
  'UPDATE',
  TABLE
)

export const findByProductAndSize = withErrorMapping(
  async (productId, size) => {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('product_id', productId)
      .eq('size', size)
      .order('image_index', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (error) {
      throw new DatabaseError('SELECT', TABLE, error, { productId, size })
    }
    return data
  },
  'SELECT',
  TABLE
)

export const findImagesByProductIdsAndSize = withErrorMapping(
  async (productIds, size) => {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .in('product_id', productIds)
      .eq('size', size)
      .order('image_index', { ascending: true })

    if (error) {
      throw new DatabaseError('SELECT', TABLE, error, { productIds, size })
    }
    return data
  },
  'SELECT',
  TABLE
)

export const findFallbackImagesByProductIds = withErrorMapping(
  async (productIds) => {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .in('product_id', productIds)
      .eq('size', 'large')
      .order('image_index', { ascending: true })

    if (error) {
      throw new DatabaseError('SELECT', TABLE, error, { productIds, size: 'large' })
    }
    return data
  },
  'SELECT',
  TABLE
)

export const deleteBySize = withErrorMapping(
  async (productId, size) => {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ active: false })
      .eq('product_id', productId)
      .eq('size', size)
      .eq('active', true)
      .select()

    if (error) {
      throw new DatabaseError('DELETE', TABLE, error, { productId, size })
    }
    return data
  },
  'DELETE',
  TABLE
)
