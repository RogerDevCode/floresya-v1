/**
 * Error Helpers para Controller Tests
 * Crear errores con el tipo correcto para mocks
 */

export const createNotFoundError = _message => {
  const error = new Error(_message)
  error.name = 'NotFoundError'
  return error
}

export const createValidationError = _message => {
  const error = new Error(_message)
  error.name = 'ValidationError'
  return error
}

export const createBadRequestError = _message => {
  const error = new Error(_message)
  error.name = 'BadRequestError'
  return error
}

export const createDatabaseConstraintError = _message => {
  const error = new Error(_message)
  error.name = 'DatabaseConstraintError'
  return error
}
