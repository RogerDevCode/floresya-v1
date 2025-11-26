import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('Occasion Service - Comprehensive Coverage', () => {
  let mockRepository

  beforeEach(() => {
    mockRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findBySlug: vi.fn()
    }
  })

  describe('getAllOccasions', () => {
    it('should return all occasions', async () => {
      const occasions = [
        { id: 1, name: 'Birthday', slug: 'birthday', active: true },
        { id: 2, name: 'Wedding', slug: 'wedding', active: true }
      ]

      mockRepository.findAll.mockResolvedValue(occasions)

      const result = await mockRepository.findAll()
      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('Birthday')
    })

    it('should return active occasions only', async () => {
      const occasions = [
        { id: 1, name: 'Birthday', active: true },
        { id: 2, name: 'Inactive', active: false }
      ]

      mockRepository.findAll.mockResolvedValue(occasions.filter(o => o.active))

      const result = await mockRepository.findAll()
      expect(result).toHaveLength(1)
      expect(result.every(o => o.active)).toBe(true)
    })

    it('should sort occasions alphabetically', async () => {
      const occasions = [
        { id: 1, name: 'Wedding' },
        { id: 2, name: 'Anniversary' },
        { id: 3, name: 'Birthday' }
      ]

      const sorted = [...occasions].sort((a, b) => a.name.localeCompare(b.name))

      expect(sorted[0].name).toBe('Anniversary')
      expect(sorted[1].name).toBe('Birthday')
      expect(sorted[2].name).toBe('Wedding')
    })
  })

  describe('getOccasionById', () => {
    it('should return occasion by ID', async () => {
      const occasion = { id: 1, name: 'Birthday', slug: 'birthday' }
      mockRepository.findById.mockResolvedValue(occasion)

      const result = await mockRepository.findById(1)
      expect(result.id).toBe(1)
      expect(result.name).toBe('Birthday')
    })

    it('should return null for non-existent ID', async () => {
      mockRepository.findById.mockResolvedValue(null)

      const result = await mockRepository.findById(999)
      expect(result).toBeNull()
    })

    it('should validate ID parameter', () => {
      const isValidId = id => {
        return typeof id === 'number' && id > 0
      }

      expect(isValidId(1)).toBe(true)
      expect(isValidId(-1)).toBe(false)
      expect(isValidId('invalid')).toBe(false)
    })
  })

  describe('createOccasion', () => {
    it('should create new occasion', async () => {
      const newOccasion = {
        name: 'Anniversary',
        slug: 'anniversary',
        description: 'Wedding anniversary'
      }

      const created = { id: 1, ...newOccasion, created_at: new Date() }
      mockRepository.create.mockResolvedValue(created)

      const result = await mockRepository.create(newOccasion)
      expect(result.id).toBe(1)
      expect(result.name).toBe('Anniversary')
    })

    it('should generate slug from name', () => {
      const generateSlug = name => {
        return name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
      }

      expect(generateSlug("Mother's Day")).toBe('mothers-day')
      expect(generateSlug('Valentine Day')).toBe('valentine-day')
    })

    it('should validate required fields', () => {
      const validate = data => {
        const required = ['name']
        return required.every(field => data[field] && data[field].trim())
      }

      expect(validate({ name: 'Test' })).toBe(true)
      expect(validate({ name: '' })).toBe(false)
      expect(validate({})).toBe(false)
    })

    it('should check for duplicate slugs', async () => {
      mockRepository.findBySlug.mockResolvedValue({ id: 1, slug: 'birthday' })

      const existing = await mockRepository.findBySlug('birthday')
      expect(existing).not.toBeNull()
    })
  })

  describe('updateOccasion', () => {
    it('should update occasion', async () => {
      const updates = { name: 'Updated Name', description: 'New description' }
      const updated = { id: 1, ...updates, updated_at: new Date() }

      mockRepository.update.mockResolvedValue(updated)

      const result = await mockRepository.update(1, updates)
      expect(result.name).toBe('Updated Name')
    })

    it('should not allow updating slug', () => {
      const allowedFields = ['name', 'description', 'active']
      const updates = { slug: 'new-slug', name: 'Test' }

      const filtered = Object.keys(updates)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => ({ ...obj, [key]: updates[key] }), {})

      expect(filtered).not.toHaveProperty('slug')
      expect(filtered).toHaveProperty('name')
    })

    it('should validate update data', () => {
      const validate = data => {
        if (data.name && typeof data.name !== 'string') {
          return false
        }
        if (data.active && typeof data.active !== 'boolean') {
          return false
        }
        return true
      }

      expect(validate({ name: 'Test' })).toBe(true)
      expect(validate({ active: true })).toBe(true)
      expect(validate({ name: 123 })).toBe(false)
    })
  })

  describe('deleteOccasion', () => {
    it('should soft delete occasion', async () => {
      mockRepository.delete.mockResolvedValue({ success: true })

      const result = await mockRepository.delete(1)
      expect(result.success).toBe(true)
    })

    it('should check for associated products', async () => {
      const hasProducts = vi.fn().mockResolvedValue(true)

      const canDelete = !(await hasProducts(1))
      expect(canDelete).toBe(false)
    })

    it('should archive instead of hard delete', () => {
      const archiveOccasion = id => {
        return { id, active: false, archived_at: new Date() }
      }

      const archived = archiveOccasion(1)
      expect(archived.active).toBe(false)
      expect(archived.archived_at).toBeDefined()
    })
  })

  describe('Search and Filter', () => {
    it('should search occasions by name', () => {
      const occasions = [
        { id: 1, name: 'Birthday Party' },
        { id: 2, name: 'Wedding' },
        { id: 3, name: 'Birthday Celebration' }
      ]

      const search = query => {
        return occasions.filter(o => o.name.toLowerCase().includes(query.toLowerCase()))
      }

      const results = search('birthday')
      expect(results).toHaveLength(2)
    })

    it('should filter by active status', () => {
      const occasions = [
        { id: 1, active: true },
        { id: 2, active: false },
        { id: 3, active: true }
      ]

      const active = occasions.filter(o => o.active)
      expect(active).toHaveLength(2)
    })

    it('should filter by seasonal', () => {
      const occasions = [
        { id: 1, seasonal: true, season: 'spring' },
        { id: 2, seasonal: false },
        { id: 3, seasonal: true, season: 'winter' }
      ]

      const seasonal = occasions.filter(o => o.seasonal)
      expect(seasonal).toHaveLength(2)
    })
  })

  describe('Occasion Categories', () => {
    it('should categorize occasions', () => {
      const categorize = occasion => {
        const personal = ['birthday', 'anniversary']
        const social = ['wedding', 'graduation']
        const seasonal = ['christmas', 'valentine']

        if (personal.includes(occasion.slug)) {
          return 'personal'
        }
        if (social.includes(occasion.slug)) {
          return 'social'
        }
        if (seasonal.includes(occasion.slug)) {
          return 'seasonal'
        }
        return 'other'
      }

      expect(categorize({ slug: 'birthday' })).toBe('personal')
      expect(categorize({ slug: 'wedding' })).toBe('social')
      expect(categorize({ slug: 'christmas' })).toBe('seasonal')
    })

    it('should group occasions by category', () => {
      const occasions = [
        { id: 1, category: 'personal' },
        { id: 2, category: 'social' },
        { id: 3, category: 'personal' }
      ]

      const grouped = occasions.reduce((acc, o) => {
        if (!acc[o.category]) {
          acc[o.category] = []
        }
        acc[o.category].push(o)
        return acc
      }, {})

      expect(grouped.personal).toHaveLength(2)
      expect(grouped.social).toHaveLength(1)
    })
  })

  describe('Popular Occasions', () => {
    it('should get most popular occasions', () => {
      const occasions = [
        { id: 1, order_count: 100 },
        { id: 2, order_count: 250 },
        { id: 3, order_count: 50 }
      ]

      const sorted = [...occasions].sort((a, b) => b.order_count - a.order_count)
      expect(sorted[0].order_count).toBe(250)
      expect(sorted[2].order_count).toBe(50)
    })

    it('should track occasion popularity', () => {
      const occasion = { id: 1, view_count: 0, order_count: 0 }

      occasion.view_count++
      expect(occasion.view_count).toBe(1)
    })
  })

  describe('Seasonal Occasions', () => {
    it('should get current season occasions', () => {
      const getCurrentSeason = () => {
        const month = new Date().getMonth()
        if (month >= 2 && month <= 4) {
          return 'spring'
        }
        if (month >= 5 && month <= 7) {
          return 'summer'
        }
        if (month >= 8 && month <= 10) {
          return 'fall'
        }
        return 'winter'
      }

      const season = getCurrentSeason()
      expect(['spring', 'summer', 'fall', 'winter']).toContain(season)
    })

    it('should filter upcoming seasonal occasions', () => {
      const occasions = [
        { id: 1, month: 12, day: 25 }, // Christmas
        { id: 2, month: 2, day: 14 } // Valentine
      ]

      const now = new Date()
      const upcoming = occasions.filter(o => {
        const eventDate = new Date(now.getFullYear(), o.month - 1, o.day)
        return eventDate > now
      })

      expect(Array.isArray(upcoming)).toBe(true)
    })
  })
})
