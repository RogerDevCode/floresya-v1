/**
 * FloresYa - Type Definitions (SSOT)
 * Single Source of Truth for all application types using JSDoc
 */

/**
 * @typedef {Object} Product
 * @property {number} id - Unique identifier
 * @property {string} name - Product name
 * @property {number} price - Product price in USD
 * @property {string} image - Image URL
 * @property {string} description - Product description
 * @property {string} occasion - Occasion type (amor, cumpleanos, madre, etc.)
 * @property {boolean} featured - Featured product flag
 * @property {string} [category] - Product category
 * @property {number} [stock] - Available stock
 * @property {Date} [createdAt] - Creation timestamp
 * @property {Date} [updatedAt] - Last update timestamp
 */

/**
 * @typedef {Object} CartItem
 * @property {number} productId - Product ID reference
 * @property {string} name - Product name
 * @property {number} price - Product price
 * @property {number} quantity - Quantity in cart
 * @property {string} image - Product image URL
 */

/**
 * @typedef {Object} Cart
 * @property {CartItem[]} items - Cart items
 * @property {number} total - Total cart value
 * @property {number} itemCount - Total item count
 */

/**
 * @typedef {Object} Order
 * @property {string} id - Order ID
 * @property {string} userId - User ID reference
 * @property {CartItem[]} items - Ordered items
 * @property {number} total - Order total
 * @property {string} status - Order status (pending, confirmed, delivered, cancelled)
 * @property {string} deliveryAddress - Delivery address
 * @property {string} [deliveryNotes] - Optional delivery notes
 * @property {Date} createdAt - Order creation timestamp
 * @property {Date} [deliveredAt] - Delivery timestamp
 */

/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} email - User email
 * @property {string} [name] - User full name
 * @property {string} [phone] - Phone number
 * @property {string} [address] - Default address
 * @property {Date} createdAt - Account creation date
 */

/**
 * @typedef {'amor' | 'cumpleanos' | 'madre' | 'aniversario' | 'graduacion' | 'condolencias'} OccasionType
 */

/**
 * @typedef {Object} ApiResponse
 * @template T
 * @property {boolean} success - Request success status
 * @property {T} [data] - Response data
 * @property {string} [message] - Response message
 * @property {string} [error] - Error message if failed
 */

export {}