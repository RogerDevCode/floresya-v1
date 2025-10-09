/**
 * Global Test Setup for Vitest
 * Configuración global para todos los tests
 */

// Mock DOM environment for Node.js tests
import { JSDOM } from 'jsdom'

// Setup DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost:3000',
  pretendToBeVisual: true,
  resources: 'usable'
})

// Set up global variables
global.window = dom.window
global.document = dom.window.document
global.navigator = dom.window.navigator
global.HTMLElement = dom.window.HTMLElement
global.HTMLDivElement = dom.window.HTMLDivElement
global.HTMLButtonElement = dom.window.HTMLButtonElement
global.HTMLInputElement = dom.window.HTMLInputElement
global.HTMLFormElement = dom.window.HTMLFormElement
global.HTMLSelectElement = dom.window.HTMLSelectElement
global.HTMLTextAreaElement = dom.window.HTMLTextAreaElement
global.HTMLImageElement = dom.window.HTMLImageElement
global.HTMLAnchorElement = dom.window.HTMLAnchorElement
global.HTMLUListElement = dom.window.HTMLUListElement
global.HTMLOListElement = dom.window.HTMLOListElement
global.HTMLLIElement = dom.window.HTMLLIElement
global.Node = dom.window.Node
global.NodeList = dom.window.NodeList
global.HTMLCollection = dom.window.HTMLCollection
global.Event = dom.window.Event
global.CustomEvent = dom.window.CustomEvent
global.MouseEvent = dom.window.MouseEvent
global.KeyboardEvent = dom.window.KeyboardEvent
global.FocusEvent = dom.window.FocusEvent
global.EventTarget = dom.window.EventTarget

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0
}
global.localStorage = localStorageMock

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0
}
global.sessionStorage = sessionStorageMock

// Mock URL.createObjectURL
global.URL = {
  createObjectURL: vi.fn(() => 'blob:mock-url'),
  revokeObjectURL: vi.fn()
}

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

// Mock console methods to avoid noise in tests (but still show errors)
const originalConsole = global.console
global.console = {
  ...originalConsole,
  log: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  // Keep error visible for debugging
  error: (...args) => originalConsole.error(...args),
  debug: vi.fn(),
  table: vi.fn(),
  trace: vi.fn(),
  group: vi.fn(),
  groupEnd: vi.fn(),
  time: vi.fn(),
  timeEnd: vi.fn()
}

// Mock fetch for tests that need it
global.fetch = vi.fn()

// Mock FileReader
global.FileReader = class {
  constructor() {
    this.onload = null
    this.onerror = null
    this.result = null
    this.error = null
  }

  readAsDataURL(_file) {
    // Simulate async file reading
    setTimeout(() => {
      if (this.onload) {
        this.result = 'data:image/jpeg;base64,fakeimage'
        this.onload({ target: { result: this.result } })
      }
    }, 10)
  }

  readAsText(_file) {
    setTimeout(() => {
      if (this.onload) {
        this.result = 'fake file content'
        this.onload({ target: { result: this.result } })
      }
    }, 10)
  }

  abort() {
    // Mock implementation
  }
}

// Mock Image constructor
global.Image = class {
  constructor() {
    this.onload = null
    this.onerror = null
    this.src = ''
    this.width = 0
    this.height = 0
    this.alt = ''
    this.loading = 'eager'

    // Simulate image loading
    setTimeout(() => {
      this.width = 800
      this.height = 600
      if (this.onload) {
        this.onload()
      }
    }, 10)
  }

  set src(value) {
    this.src = value
    // Simulate image loading when src is set
    setTimeout(() => {
      if (this.onload) {
        this.onload()
      }
    }, 10)
  }
}

// Mock window.print
global.window.print = vi.fn()

// Mock window.confirm
global.window.confirm = vi.fn(() => true)

// Mock window.alert
global.window.alert = vi.fn()

// Mock window.prompt
global.window.prompt = vi.fn(() => 'user input')

// Mock crypto for random UUID generation
global.crypto = {
  randomUUID: vi.fn(() => 'mock-uuid-1234-5678-9abc-def012345678')
}

// Clean up after each test
import { afterEach } from 'vitest'
afterEach(() => {
  // Clear all mocks
  vi.clearAllMocks()

  // Reset localStorage mock
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  localStorageMock.removeItem.mockClear()
  localStorageMock.clear.mockClear()
  localStorageMock.key.mockClear()

  // Reset sessionStorage mock
  sessionStorageMock.getItem.mockClear()
  sessionStorageMock.setItem.mockClear()
  sessionStorageMock.removeItem.mockClear()
  sessionStorageMock.clear.mockClear()
  sessionStorageMock.key.mockClear()

  // Reset fetch mock
  global.fetch.mockClear()

  // Reset URL mocks
  global.URL.createObjectURL.mockClear()
  global.URL.revokeObjectURL.mockClear()

  // Reset window mocks
  global.window.print.mockClear()
  global.window.confirm.mockClear()
  global.window.alert.mockClear()
  global.window.prompt.mockClear()

  // Reset crypto mock
  global.crypto.randomUUID.mockClear()
})
