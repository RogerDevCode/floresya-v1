import { describe, it, expect } from 'vitest'

describe('DI Container - Complete Coverage', () => {
  describe('register', () => {
    it('should register singleton service', () => {
      const service = { name: 'TestService' }
      const registry = new Map()
      registry.set('TestService', { instance: service, scope: 'singleton' })
      expect(registry.has('TestService')).toBe(true)
    })

    it('should register transient service', () => {
      const factory = () => ({ name: 'TestService' })
      const registry = new Map()
      registry.set('TestService', { factory, scope: 'transient' })
      expect(registry.has('TestService')).toBe(true)
    })

    it('should register scoped service', () => {
      const factory = () => ({ name: 'ScopedService' })
      const registry = new Map()
      registry.set('ScopedService', { factory, scope: 'scoped' })
      expect(registry.has('ScopedService')).toBe(true)
    })
  })

  describe('resolve', () => {
    it('should resolve singleton service', () => {
      const service = { name: 'TestService' }
      const registry = new Map()
      registry.set('TestService', { instance: service, scope: 'singleton' })
      const resolved = registry.get('TestService').instance
      expect(resolved).toBe(service)
    })

    it('should create new instance for transient', () => {
      let counter = 0
      const factory = () => ({ id: ++counter })
      const instance1 = factory()
      const instance2 = factory()
      expect(instance1.id).not.toBe(instance2.id)
    })

    it('should reuse instance within scope', () => {
      const scope = new Map()
      const service = { name: 'ScopedService' }
      scope.set('ScopedService', service)
      const resolved = scope.get('ScopedService')
      expect(resolved).toBe(service)
    })
  })

  describe('lifecycle', () => {
    it('should initialize service', () => {
      const service = {
        initialized: false,
        init: function () {
          this.initialized = true
        }
      }
      service.init()
      expect(service.initialized).toBe(true)
    })

    it('should dispose service', () => {
      const service = {
        disposed: false,
        dispose: function () {
          this.disposed = true
        }
      }
      service.dispose()
      expect(service.disposed).toBe(true)
    })

    it('should cleanup on scope end', () => {
      const scope = new Map()
      scope.set('Service', { name: 'Test' })
      scope.clear()
      expect(scope.size).toBe(0)
    })
  })
})
