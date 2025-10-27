/**
 * Unit Tests: DOM Ready Utility
 * Tests core functionality for DOM initialization utilities
 * Following MANDATORY_RULES.md and ESLint compliance
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  onDOMReady,
  onWindowLoad,
  initSequence,
  isDOMReady,
  waitForElement,
  safeQuerySelector,
  safeQuerySelectorAll
} from '../../../public/js/shared/dom-ready.js'

describe('DOM Ready Utility', () => {
  beforeEach(() => {
    // Reset DOM state before each test
    document.body.innerHTML = ''
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('onDOMReady', () => {
    test('should throw error when callback is not a function', () => {
      expect(() => {
        onDOMReady(null)
      }).toThrow('onDOMReady: callback must be a function')

      expect(() => {
        onDOMReady('not a function')
      }).toThrow('onDOMReady: callback must be a function')

      expect(() => {
        onDOMReady({})
      }).toThrow('onDOMReady: callback must be a function')
    })

    test('should execute callback immediately when DOM is already loaded', async () => {
      // Mock DOM as already loaded
      Object.defineProperty(document, 'readyState', {
        value: 'complete',
        writable: true
      })

      const mockCallback = vi.fn()

      onDOMReady(mockCallback)

      // Use microtask to wait for queueMicrotask
      await new Promise(resolve => {
        queueMicrotask(resolve)
      })

      expect(mockCallback).toHaveBeenCalledTimes(1)
    })

    test('should add event listener when DOM is still loading', () => {
      // Mock DOM as loading
      Object.defineProperty(document, 'readyState', {
        value: 'loading',
        writable: true
      })

      const mockCallback = vi.fn()
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener')

      onDOMReady(mockCallback)

      expect(addEventListenerSpy).toHaveBeenCalledWith('DOMContentLoaded', mockCallback, {
        once: true
      })
      expect(mockCallback).not.toHaveBeenCalled()
    })

    test('should handle multiple callbacks correctly', async () => {
      Object.defineProperty(document, 'readyState', {
        value: 'complete',
        writable: true
      })

      const callback1 = vi.fn()
      const callback2 = vi.fn()

      onDOMReady(callback1)
      onDOMReady(callback2)

      await new Promise(resolve => {
        queueMicrotask(resolve)
      })

      expect(callback1).toHaveBeenCalledTimes(1)
      expect(callback2).toHaveBeenCalledTimes(1)
    })
  })

  describe('onWindowLoad', () => {
    test('should throw error when callback is not a function', () => {
      expect(() => {
        onWindowLoad(null)
      }).toThrow('onWindowLoad: callback must be a function')
    })

    test('should execute callback immediately when window is already loaded', async () => {
      Object.defineProperty(document, 'readyState', {
        value: 'complete',
        writable: true
      })

      const mockCallback = vi.fn()

      onWindowLoad(mockCallback)

      await new Promise(resolve => {
        queueMicrotask(resolve)
      })

      expect(mockCallback).toHaveBeenCalledTimes(1)
    })

    test('should add load event listener when window is not loaded', () => {
      Object.defineProperty(document, 'readyState', {
        value: 'interactive',
        writable: true
      })

      const mockCallback = vi.fn()
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')

      onWindowLoad(mockCallback)

      expect(addEventListenerSpy).toHaveBeenCalledWith('load', mockCallback, { once: true })
      expect(mockCallback).not.toHaveBeenCalled()
    })
  })

  describe('initSequence', () => {
    test('should execute callbacks in sequence', async () => {
      const executionOrder = []

      const callback1 = vi.fn().mockImplementation(async () => {
        executionOrder.push('callback1')
        await new Promise(resolve => setTimeout(resolve, 10))
      })

      const callback2 = vi.fn().mockImplementation(() => {
        executionOrder.push('callback2')
      })

      const promise = initSequence(callback1, callback2)

      await promise

      expect(callback1).toHaveBeenCalledTimes(1)
      expect(callback2).toHaveBeenCalledTimes(1)
      expect(executionOrder).toEqual(['callback1', 'callback2'])
    })

    test('should handle non-function callbacks gracefully', async () => {
      const callback = vi.fn()

      await expect(initSequence('not a function', callback)).resolves.not.toThrow()
      expect(callback).toHaveBeenCalledTimes(1)
    })

    test('should reject on callback error', async () => {
      const error = new Error('Test error')
      const errorCallback = vi.fn().mockRejectedValue(error)
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(initSequence(errorCallback)).rejects.toThrow('Test error')
      expect(consoleSpy).toHaveBeenCalledWith('initSequence failed:', error)

      consoleSpy.mockRestore()
    })
  })

  describe('isDOMReady', () => {
    test('should return false when DOM is loading', () => {
      Object.defineProperty(document, 'readyState', {
        value: 'loading',
        writable: true
      })

      expect(isDOMReady()).toBe(false)
    })

    test('should return true when DOM is interactive', () => {
      Object.defineProperty(document, 'readyState', {
        value: 'interactive',
        writable: true
      })

      expect(isDOMReady()).toBe(true)
    })

    test('should return true when DOM is complete', () => {
      Object.defineProperty(document, 'readyState', {
        value: 'complete',
        writable: true
      })

      expect(isDOMReady()).toBe(true)
    })
  })

  describe('waitForElement', () => {
    test('should resolve immediately when element already exists', async () => {
      const testElement = document.createElement('div')
      testElement.id = 'test-element'
      document.body.appendChild(testElement)

      const result = await waitForElement('#test-element')
      expect(result).toBe(testElement)
    })

    test('should reject when element not found within timeout', async () => {
      const startTime = Date.now()

      await expect(waitForElement('#non-existent-element', 100)).rejects.toThrow(
        'Element "#non-existent-element" not found within 100ms'
      )

      const endTime = Date.now()
      expect(endTime - startTime).toBeGreaterThanOrEqual(100)
    })

    test('should resolve when element appears after delay', async () => {
      // Mock MutationObserver
      const mockObserver = {
        observe: vi.fn(),
        disconnect: vi.fn()
      }

      global.MutationObserver = vi.fn().mockImplementation(callback => {
        // Simulate element appearing after delay
        setTimeout(() => {
          const testElement = document.createElement('div')
          testElement.id = 'delayed-element'
          document.body.appendChild(testElement)
          callback()
        }, 50)
        return mockObserver
      })

      const result = await waitForElement('#delayed-element', 200)
      expect(result.id).toBe('delayed-element')
      expect(mockObserver.disconnect).toHaveBeenCalled()
    })
  })

  describe('safeQuerySelector', () => {
    test('should resolve with element when found', async () => {
      const testElement = document.createElement('div')
      testElement.className = 'test-class'
      document.body.appendChild(testElement)

      const result = await safeQuerySelector('.test-class')
      expect(result).toBe(testElement)
    })

    test('should resolve with null when element not found', async () => {
      const result = await safeQuerySelector('.non-existent')
      expect(result).toBeNull()
    })
  })

  describe('safeQuerySelectorAll', () => {
    test('should resolve with NodeList when elements found', async () => {
      const element1 = document.createElement('div')
      const element2 = document.createElement('div')
      element1.className = 'test-elements'
      element2.className = 'test-elements'

      document.body.appendChild(element1)
      document.body.appendChild(element2)

      const result = await safeQuerySelectorAll('.test-elements')
      expect(result).toHaveLength(2)
      expect(result[0]).toBe(element1)
      expect(result[1]).toBe(element2)
    })

    test('should resolve with empty NodeList when no elements found', async () => {
      const result = await safeQuerySelectorAll('.non-existent')
      expect(result).toHaveLength(0)
    })
  })
})
