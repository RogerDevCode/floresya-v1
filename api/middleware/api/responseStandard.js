/**
 * Procesado por B
 */

/**
 * Middleware de Respuesta Estándar
 * Asegura formato consistente: { success, data, message, error }
 * Basado en especificaciones de QWEN.md y CLAUDE.md
 */

export function standardResponse(req, res, next) {
  // Guardar método original json
  const originalJson = res.json

  res.json = function (data) {
    // Si ya tiene formato estándar, pasar directamente
    if (
      data &&
      typeof data === 'object' &&
      'success' in data &&
      ('data' in data || 'error' in data)
    ) {
      return originalJson.call(this, data)
    }

    // Handle null/undefined data
    if (data == null) {
      const isSuccess = res.statusCode >= 200 && res.statusCode < 300
      const standardFormat = {
        success: isSuccess,
        data: null,
        message: isSuccess ? 'Success' : 'Error occurred'
      }
      return originalJson.call(this, standardFormat)
    }

    // Convertir formato legacy a estándar
    const isSuccess = res.statusCode >= 200 && res.statusCode < 300
    const standardFormat = {
      success: isSuccess,
      data: (data && typeof data === 'object' && 'data' in data) ? data.data : data,
      message: (data && typeof data === 'object' && 'message' in data) ? data.message : (isSuccess ? 'Success' : 'Error occurred'),
      ...(data && typeof data === 'object' && data.error && { error: data.error })
    }

    return originalJson.call(this, standardFormat)
  }

  next()
}
