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

    // Convertir formato legacy a estándar
    const isSuccess = res.statusCode >= 200 && res.statusCode < 300
    const standardFormat = {
      success: isSuccess,
      data: data.data || data,
      message: data.message || (isSuccess ? 'Success' : 'Error occurred'),
      ...(data.error && { error: data.error })
    }

    return originalJson.call(this, standardFormat)
  }

  next()
}
