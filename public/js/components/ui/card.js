import { cn } from '../../shared/utils.js'

/**
 * Card component with shadcn/ui styling
 * @param {Object} props - Card properties
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} props.children - Card content
 * @returns {HTMLDivElement} Card element
 */
export function createCard({ className = '', children, ...props }) {
  const card = document.createElement('div')
  card.className = cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)

  if (children) {
    card.innerHTML = children
  }

  Object.keys(props).forEach(key => {
    card.setAttribute(key, props[key])
  })

  return card
}

/**
 * Card Header component
 * @param {Object} props - Header properties
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} props.children - Header content
 * @returns {HTMLDivElement} Card header element
 */
export function createCardHeader({ className = '', children, ...props }) {
  const header = document.createElement('div')
  header.className = cn('flex flex-col space-y-1.5 p-6', className)

  if (children) {
    header.innerHTML = children
  }

  Object.keys(props).forEach(key => {
    header.setAttribute(key, props[key])
  })

  return header
}

/**
 * Card Title component
 * @param {Object} props - Title properties
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} props.children - Title content
 * @returns {HTMLHeadingElement} Card title element
 */
export function createCardTitle({ className = '', children, ...props }) {
  const title = document.createElement('h3')
  title.className = cn('text-2xl font-semibold leading-none tracking-tight', className)

  if (children) {
    title.textContent = children
  }

  Object.keys(props).forEach(key => {
    title.setAttribute(key, props[key])
  })

  return title
}

/**
 * Card Description component
 * @param {Object} props - Description properties
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} props.children - Description content
 * @returns {HTMLParagraphElement} Card description element
 */
export function createCardDescription({ className = '', children, ...props }) {
  const description = document.createElement('p')
  description.className = cn('text-sm text-muted-foreground', className)

  if (children) {
    description.textContent = children
  }

  Object.keys(props).forEach(key => {
    description.setAttribute(key, props[key])
  })

  return description
}

/**
 * Card Content component
 * @param {Object} props - Content properties
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} props.children - Content
 * @returns {HTMLDivElement} Card content element
 */
export function createCardContent({ className = '', children, ...props }) {
  const content = document.createElement('div')
  content.className = cn('p-6 pt-0', className)

  if (children) {
    content.innerHTML = children
  }

  Object.keys(props).forEach(key => {
    content.setAttribute(key, props[key])
  })

  return content
}

/**
 * Card Footer component
 * @param {Object} props - Footer properties
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} props.children - Footer content
 * @returns {HTMLDivElement} Card footer element
 */
export function createCardFooter({ className = '', children, ...props }) {
  const footer = document.createElement('div')
  footer.className = cn('flex items-center p-6 pt-0', className)

  if (children) {
    footer.innerHTML = children
  }

  Object.keys(props).forEach(key => {
    footer.setAttribute(key, props[key])
  })

  return footer
}
