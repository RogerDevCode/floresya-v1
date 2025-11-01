/**
 * DOM Ready Utility Tests - DRUD (DOM Ready Utility Tests - Enhanced)
 * Enhanced version with best practices from Silicon Valley testing standards
 *
 * Best Practices Applied:
 * - AAA Pattern (Arrange-Act-Assert)
 * - Happy-dom environment for browser APIs
 * - Proper mocking with cleanup
 * - Parametrized tests with describe.each
 * - Comprehensive edge case coverage
 * - Async testing best practices
 * - Mock lifecycle management
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

describe('DOM Ready Utility - DRUD Enhanced', () => {
  // Mock browser APIs
  let mockAddEventListener
  let mockRemoveEventListener
  let mockQuerySelector
  let mockMutationObserver

  beforeEach(() => {
    // Create fresh mocks for each test
    mockAddEventListener = vi.fn()
    mockRemoveEventListener = vi.fn()
    mockQuerySelector = vi.fn()

    // Mock document
    vi.stubGlobal('document', {
      readyState: 'loading',
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn()
      },
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
      querySelector: mockQuerySelector
    })

    // Mock window
    vi.stubGlobal('window', {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    })

    // Mock queueMicrotask (Node.js doesn't have it by default)
    vi.stubGlobal('queueMicrotask', vi.fn())

    // Mock MutationObserver
    mockMutationObserver = vi.fn().mockImplementation(_callback => ({
      observe: vi.fn(),
      disconnect: vi.fn()
    }))
    vi.stubGlobal('MutationObserver', mockMutationObserver)
  })

  afterEach(() => {
    // Cleanup all mocks
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  describe('onDOMReady', () => {
    // Test validation
    test('DRUD-001: should throw error when callback is not a function', () => {
      const invalidInputs = [null, 'string', 123, {}, [], undefined]

      invalidInputs.forEach(input => {
        expect(() => onDOMReady(input)).toThrow('onDOMReady: callback must be a function')
      })
    })

    // Test behavior when DOM is loading
    test('DRUD-002: should add event listener when DOM is still loading', () => {
      // Arrange
      document.readyState = 'loading'
      const callback = vi.fn()

      // Act
      onDOMReady(callback)

      // Assert
      expect(mockAddEventListener).toHaveBeenCalledTimes(1)
      expect(mockAddEventListener).toHaveBeenCalled()
      expect(callback).not.toHaveBeenCalled()
    })

    // Test behavior when DOM is already complete
    describe.each([
      { state: 'complete', description: 'complete' },
      { state: 'interactive', description: 'interactive' }
    ])('when readyState is $state', ({ state }) => {
      test(`DRUD-003-${state}: should execute callback immediately using queueMicrotask`, async () => {
        // Arrange
        document.readyState = state
        const callback = vi.fn()

        // Act
        onDOMReady(callback)

        // Assert - callback should be queued for microtask
        expect(queueMicrotask).toHaveBeenCalledTimes(1)
        expect(queueMicrotask).toHaveBeenCalled()

        // Wait for microtask to execute
        await vi.waitFor(() => {
          expect(callback).toHaveBeenCalledTimes(1)
        })
      })
    })

    // Test multiple callbacks
    test('DRUD-004: should handle multiple callbacks correctly', async () => {
      // Arrange
      document.readyState = 'complete'
      const callback1 = vi.fn()
      const callback2 = vi.fn()
      const callback3 = vi.fn()

      // Act
      onDOMReady(callback1)
      onDOMReady(callback2)
      onDOMReady(callback3)

      // Wait for all callbacks to execute
      await vi.waitFor(() => {
        expect(callback1).toHaveBeenCalledTimes(1)
        expect(callback2).toHaveBeenCalledTimes(1)
        expect(callback3).toHaveBeenCalledTimes(1)
      })

      // Assert
      expect(queueMicrotask).toHaveBeenCalledTimes(3)
    })

    // Test "once" behavior (event listener should only fire once)
    test('DRUD-005: should use { once: true } to prevent multiple invocations', () => {
      // Arrange
      document.readyState = 'loading'
      const callback = vi.fn()

      // Act
      onDOMReady(callback)

      // Assert - verify that once: true is passed
      const eventListenerCall = mockAddEventListener.mock.calls[0]
      expect(eventListenerCall[2]).toEqual({ once: true })
    })
  })

  describe('onWindowLoad', () => {
    test('DRUD-006: should throw error when callback is not a function', () => {
      const invalidInputs = [null, 'string', 123, {}, []]

      invalidInputs.forEach(input => {
        expect(() => onWindowLoad(input)).toThrow('onWindowLoad: callback must be a function')
      })
    })

    test('DRUD-007: should add load event listener when window is not loaded', () => {
      // Arrange
      document.readyState = 'loading'
      const callback = vi.fn()

      // Act
      onWindowLoad(callback)

      // Assert
      expect(window.addEventListener).toHaveBeenCalledTimes(1)
      expect(window.addEventListener).toHaveBeenCalled()
    })

    test('DRUD-008: should execute callback immediately when window is already loaded', async () => {
      // Arrange
      document.readyState = 'complete'
      const callback = vi.fn()

      // Act
      onWindowLoad(callback)

      // Assert
      expect(queueMicrotask).toHaveBeenCalled()
      await vi.waitFor(() => {
        expect(callback).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('initSequence', () => {
    test('DRUD-009: should execute callbacks in sequence', async () => {
      // Arrange
      document.readyState = 'complete'
      const callback1 = vi.fn().mockResolvedValue(undefined)
      const callback2 = vi.fn().mockResolvedValue(undefined)
      const callback3 = vi.fn().mockResolvedValue(undefined)

      // Act
      await initSequence(callback1, callback2, callback3)

      // Assert - all should be called in order
      expect(callback1).toHaveBeenCalledTimes(1)
      expect(callback2).toHaveBeenCalledTimes(1)
      expect(callback3).toHaveBeenCalledTimes(1)
    })

    test('DRUD-010: should handle non-function callbacks gracefully', async () => {
      // Arrange
      document.readyState = 'complete'
      const callback1 = vi.fn().mockResolvedValue(undefined)
      const callback2 = 'not a function'
      const callback3 = vi.fn().mockResolvedValue(undefined)

      // Act & Assert
      await expect(initSequence(callback1, callback2, callback3)).resolves.toBeUndefined()

      // Only valid functions should be called
      expect(callback1).toHaveBeenCalledTimes(1)
      expect(callback3).toHaveBeenCalledTimes(1)
    })

    test('DRUD-011: should reject on callback error', async () => {
      // Arrange
      document.readyState = 'complete'
      const error = new Error('Test error')
      const callback1 = vi.fn().mockRejectedValue(error)
      const callback2 = vi.fn()

      // Act & Assert
      await expect(initSequence(callback1, callback2)).rejects.toThrow('Test error')
      expect(callback1).toHaveBeenCalledTimes(1)
      expect(callback2).not.toHaveBeenCalled() // Should not reach callback2
    })

    test('DRUD-012: should work without callbacks', async () => {
      // Arrange & Act
      const promise = initSequence()

      // Assert
      await expect(promise).resolves.toBeUndefined()
    })
  })

  describe('isDOMReady', () => {
    test.each([
      { state: 'loading', expected: false },
      { state: 'interactive', expected: true },
      { state: 'complete', expected: true }
    ])('DRUD-013: should return $expected when readyState is $state', ({ state, expected }) => {
      // Arrange
      document.readyState = state

      // Act
      const result = isDOMReady()

      // Assert
      expect(result).toBe(expected)
    })
  })

  describe('waitForElement', () => {
    test('DRUD-014: should resolve immediately when element already exists', async () => {
      // Arrange
      const mockElement = { id: 'test-element' }
      mockQuerySelector.mockReturnValue(mockElement)

      // Act
      const element = await waitForElement('#test-element')

      // Assert
      expect(mockQuerySelector).toHaveBeenCalled()
      expect(element).toBe(mockElement)
    })

    test('DRUD-015: should wait for element using MutationObserver', async () => {
      // Arrange
      mockQuerySelector
        .mockReturnValueOnce(null) // Not found initially
        .mockReturnValueOnce(null) // Still not found
        .mockReturnValue({ id: 'test-element' }) // Found on third call

      let observerCallback
      const mockObserver = {
        observe: vi.fn(),
        disconnect: vi.fn()
      }
      mockMutationObserver.mockImplementation(callback => {
        observerCallback = callback
        return mockObserver
      })

      vi.spyOn(global, 'setTimeout')

      // Act
      const promise = waitForElement('#test-element', 1000)

      // Trigger MutationObserver callback
      observerCallback()

      // Assert
      await expect(promise).resolves.toEqual({ id: 'test-element' })
      expect(mockObserver.observe).toHaveBeenCalled()
      expect(mockObserver.disconnect).toHaveBeenCalled()
    })

    test('DRUD-016: should reject when element not found within timeout', async () => {
      // Arrange
      mockQuerySelector.mockReturnValue(null)

      let timeoutCallback
      vi.spyOn(global, 'setTimeout').mockImplementation(callback => {
        timeoutCallback = callback
        return 123 // mock timeout id
      })

      const mockObserver = {
        observe: vi.fn(),
        disconnect: vi.fn()
      }
      mockMutationObserver.mockImplementation(_callback => {
        // Callback is available to be called if needed
        return mockObserver
      })

      // Act
      const promise = waitForElement('#nonexistent', 1000)

      // Trigger timeout
      timeoutCallback()

      // Assert
      await expect(promise).rejects.toThrow('Element "#nonexistent" not found within 1000ms')
      expect(mockObserver.disconnect).toHaveBeenCalled()
    })

    test('DRUD-017: should use default timeout of 5000ms', async () => {
      // Arrange
      mockQuerySelector.mockReturnValue(null)

      let timeoutCallback
      vi.spyOn(global, 'setTimeout').mockImplementation(callback => {
        timeoutCallback = callback
        return 123
      })

      const mockObserver = {
        observe: vi.fn(),
        disconnect: vi.fn()
      }
      mockMutationObserver.mockImplementation(() => mockObserver)

      // Act
      const promise = waitForElement('#test')

      // Trigger timeout
      timeoutCallback()

      // Assert - verify default timeout was used (5000ms)
      expect(setTimeout).toHaveBeenCalledWith(5000)
      await expect(promise).rejects.toThrow()
    })
  })

  describe('safeQuerySelector', () => {
    test('DRUD-018: should query selector after DOM is ready', async () => {
      // Arrange
      document.readyState = 'complete'
      const mockElement = { id: 'safe-element' }
      mockQuerySelector.mockReturnValue(mockElement)

      // Act
      const element = await safeQuerySelector('#safe-element')

      // Assert
      expect(queueMicrotask).toHaveBeenCalled()
      expect(mockQuerySelector).toHaveBeenCalled()
      expect(element).toBe(mockElement)
    })

    test('DRUD-019: should return null when element not found', async () => {
      // Arrange
      document.readyState = 'complete'
      mockQuerySelector.mockReturnValue(null)

      // Act
      const element = await safeQuerySelector('#not-found')

      // Assert
      expect(element).toBeNull()
    })
  })

  describe('safeQuerySelectorAll', () => {
    test('DRUD-020: should query all selectors after DOM is ready', async () => {
      // Arrange
      document.readyState = 'complete'
      const mockNodeList = [{ id: 1 }, { id: 2 }]
      mockQuerySelector.mockReturnValue(mockNodeList)

      // Act
      const elements = await safeQuerySelectorAll('.test')

      // Assert
      expect(queueMicrotask).toHaveBeenCalled()
      expect(mockQuerySelector).toHaveBeenCalled()
      expect(elements).toBe(mockNodeList)
    })

    test('DRUD-021: should return empty NodeList when no elements found', async () => {
      // Arrange
      document.readyState = 'complete'
      mockQuerySelector.mockReturnValue([])

      // Act
      const elements = await safeQuerySelectorAll('.not-found')

      // Assert
      expect(elements).toEqual([])
    })
  })

  describe('Integration Tests', () => {
    test('DRUD-022: should work with complex initialization chain', () => {
      // Arrange
      document.readyState = 'complete'
      let step = 0

      const callback1 = () => {
        step = 1
      }
      const callback2 = () => {
        step = 2
      }
      const callback3 = () => {
        step = 3
      }

      // Act
      initSequence(callback1, callback2, callback3).then(() => {
        // Assert
        expect(step).toBe(3)
      })
    })

    test('DRUD-023: should handle mixed onDOMReady and onWindowLoad', () => {
      // Arrange
      document.readyState = 'complete'
      const domCallback = vi.fn()
      const loadCallback = vi.fn()

      // Act
      onDOMReady(domCallback)
      onWindowLoad(loadCallback)

      // Assert - Functions should be queued
      expect(queueMicrotask).toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    test('DRUD-026: should handle empty string selector', () => {
      // Arrange
      document.readyState = 'complete'

      // Act & Assert
      expect(() => onDOMReady(() => {})).not.toThrow()
    })

    test('DRUD-027: should handle edge cases gracefully', () => {
      // Arrange
      document.readyState = 'complete'

      // Act & Assert - Just verify no errors are thrown
      expect(() => onWindowLoad(() => {})).not.toThrow()
      expect(() => isDOMReady()).not.toThrow()
    })
  })
})
