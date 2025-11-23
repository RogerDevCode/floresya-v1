/**
 * Standalone shadcn/ui components
 * Browser-compatible version without external dependencies
 */
// @ts-nocheck

import { cn, buttonVariants, buttonSizes } from './utils-standalone.js'

/**
 * Button Component - Standalone Version
 */
export function createButton(options = {}) {
  const {
    variant = 'default',
    size = 'default',
    className = '',
    children = 'Button',
    onClick = null,
    disabled = false,
    type = 'button'
  } = options

  const button = document.createElement('button')
  button.type = type
  button.disabled = disabled
  button.className = cn(buttonVariants[variant], buttonSizes[size], className)

  if (typeof children === 'string') {
    button.innerHTML = children
  } else {
    button.appendChild(children)
  }

  if (onClick) {
    button.addEventListener('click', onClick)
  }

  return button
}

/**
 * Card Components - Standalone Version
 */
export function createCard(options = {}) {
  const { className = '', children = null } = options

  const card = document.createElement('div')
  card.className = cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)

  if (children) {
    if (Array.isArray(children)) {
      children.forEach(child => card.appendChild(child))
    } else {
      card.appendChild(children)
    }
  }

  return card
}

export function createCardHeader(options = {}) {
  const { className = '', children = null } = options

  const header = document.createElement('div')
  header.className = cn('flex flex-col space-y-1.5 p-6', className)

  if (children) {
    if (Array.isArray(children)) {
      children.forEach(child => header.appendChild(child))
    } else {
      header.appendChild(children)
    }
  }

  return header
}

export function createCardTitle(options = {}) {
  const { className = '', children = 'Card Title' } = options

  const title = document.createElement('h3')
  title.className = cn('text-2xl font-semibold leading-none tracking-tight', className)
  title.textContent = children

  return title
}

export function createCardDescription(options = {}) {
  const { className = '', children = 'Card description' } = options

  const description = document.createElement('p')
  description.className = cn('text-sm text-muted-foreground', className)
  description.textContent = children

  return description
}

export function createCardContent(options = {}) {
  const { className = '', children = null } = options

  const content = document.createElement('div')
  content.className = cn('p-6 pt-0', className)

  if (children) {
    if (Array.isArray(children)) {
      children.forEach(child => content.appendChild(child))
    } else {
      content.appendChild(children)
    }
  }

  return content
}

export function createCardFooter(options = {}) {
  const { className = '', children = null } = options

  const footer = document.createElement('div')
  footer.className = cn('flex items-center p-6 pt-0', className)

  if (children) {
    if (Array.isArray(children)) {
      children.forEach(child => footer.appendChild(child))
    } else {
      footer.appendChild(children)
    }
  }

  return footer
}

/**
 * Alert Component - Standalone Version
 */
export function createAlert(options = {}) {
  const { variant = 'default', className = '', children = 'Alert message', title = null } = options

  const alertVariants = {
    default: 'bg-background text-foreground border',
    destructive:
      'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive'
  }

  const alert = document.createElement('div')
  alert.className = cn('relative w-full rounded-lg border p-4', alertVariants[variant], className)

  const content = document.createElement('div')
  content.className = 'flex items-start space-x-3'

  if (title) {
    const titleElement = document.createElement('h5')
    titleElement.className = 'mb-1 font-medium leading-none tracking-tight'
    titleElement.textContent = title

    const messageElement = document.createElement('div')
    messageElement.className = 'text-sm [&_p]:leading-relaxed'
    messageElement.innerHTML = children

    const textContent = document.createElement('div')
    textContent.appendChild(titleElement)
    textContent.appendChild(messageElement)

    content.appendChild(textContent)
  } else {
    const messageElement = document.createElement('div')
    messageElement.className = 'text-sm [&_p]:leading-relaxed'
    messageElement.innerHTML = children
    content.appendChild(messageElement)
  }

  alert.appendChild(content)

  return alert
}

/**
 * Badge Component - Standalone Version
 */
export function createBadge(options = {}) {
  const { variant = 'default', className = '', children = 'Badge' } = options

  const badgeVariants = {
    default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
    secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive:
      'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
    outline: 'text-foreground'
  }

  const badge = document.createElement('div')
  badge.className = cn(
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    badgeVariants[variant],
    className
  )
  badge.textContent = children

  return badge
}

console.log('✅ Standalone components loaded successfully')
