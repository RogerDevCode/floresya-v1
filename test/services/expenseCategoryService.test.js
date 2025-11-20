/**
 * Expense Category Service Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NotFoundError, ValidationError, ConflictError } from '../../api/errors/AppError.js'

// Mock repository
const expenseCategoryRepository = {
  findAll: vi.fn(),
  findById: vi.fn(),
  findByName: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn()
}

vi.mock('../../api/repositories/expenseCategoryRepository.js', () => ({
  default: expenseCategoryRepository
}))

const { default: expenseCategoryService } = await import(
  '../../api/services/expenseCategoryService.js'
)

describe('ExpenseCategoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllCategories', () => {
    it('should return all active categories by default', async () => {
      const mockCategories = [
        { id: 1, name: 'flores', active: true },
        { id: 2, name: 'transporte', active: true }
      ]
      expenseCategoryRepository.findAll.mockResolvedValue(mockCategories)

      const result = await expenseCategoryService.getAllCategories()

      expect(result).toEqual(mockCategories)
      expect(expenseCategoryRepository.findAll).toHaveBeenCalledWith({ includeInactive: false })
    })

    it('should include inactive categories when requested', async () => {
      const mockCategories = [
        { id: 1, name: 'flores', active: true },
        { id: 2, name: 'old_category', active: false }
      ]
      expenseCategoryRepository.findAll.mockResolvedValue(mockCategories)

      const result = await expenseCategoryService.getAllCategories({ includeInactive: true })

      expect(result).toEqual(mockCategories)
      expect(expenseCategoryRepository.findAll).toHaveBeenCalledWith({ includeInactive: true })
    })
  })

  describe('getCategoryById', () => {
    it('should return category when found', async () => {
      const mockCategory = { id: 1, name: 'flores' }
      expenseCategoryRepository.findById.mockResolvedValue(mockCategory)

      const result = await expenseCategoryService.getCategoryById(1)

      expect(result).toEqual(mockCategory)
    })

    it('should throw NotFoundError when category does not exist', async () => {
      expenseCategoryRepository.findById.mockResolvedValue(null)

      await expect(expenseCategoryService.getCategoryById(999)).rejects.toThrow(NotFoundError)
    })
  })

  describe('createCategory', () => {
    it('should create category with valid data', async () => {
      const mockCreated = { id: 1, name: 'nueva_categoria', active: true }
      expenseCategoryRepository.findByName.mockResolvedValue(null)
      expenseCategoryRepository.create.mockResolvedValue(mockCreated)

      const result = await expenseCategoryService.createCategory(
        {
          name: 'Nueva Categoria',
          description: 'Test',
          icon: '🎨',
          color: '#ff0000'
        },
        1
      )

      expect(result).toEqual(mockCreated)
      expect(expenseCategoryRepository.create).toHaveBeenCalledWith({
        name: 'nueva_categoria',
        description: 'Test',
        icon: '🎨',
        color: '#ff0000',
        is_default: false,
        active: true,
        created_by: 1
      })
    })

    it('should throw ValidationError when name is empty', async () => {
      await expect(expenseCategoryService.createCategory({ name: '' }, 1)).rejects.toThrow(
        ValidationError
      )
    })

    it('should throw ValidationError when name contains invalid characters', async () => {
      await expect(
        expenseCategoryService.createCategory({ name: 'Invalid Name!' }, 1)
      ).rejects.toThrow(ValidationError)
    })

    it('should throw ConflictError when category already exists', async () => {
      expenseCategoryRepository.findByName.mockResolvedValue({ id: 1, name: 'flores' })

      await expect(expenseCategoryService.createCategory({ name: 'flores' }, 1)).rejects.toThrow(
        ConflictError
      )
    })

    it('should throw ValidationError for invalid color format', async () => {
      expenseCategoryRepository.findByName.mockResolvedValue(null)

      await expect(
        expenseCategoryService.createCategory(
          {
            name: 'test',
            color: 'red'
          },
          1
        )
      ).rejects.toThrow(ValidationError)
    })

    it('should normalize name (lowercase and replace spaces)', async () => {
      expenseCategoryRepository.findByName.mockResolvedValue(null)
      expenseCategoryRepository.create.mockResolvedValue({ id: 1 })

      await expenseCategoryService.createCategory({ name: 'My New Category' }, 1)

      expect(expenseCategoryRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'my_new_category' })
      )
    })
  })

  describe('updateCategory', () => {
    it('should update category with valid data', async () => {
      const mockCategory = { id: 1, name: 'flores', is_default: false }
      const mockUpdated = { ...mockCategory, description: 'Updated' }
      expenseCategoryRepository.findById.mockResolvedValue(mockCategory)
      expenseCategoryRepository.update.mockResolvedValue(mockUpdated)

      const result = await expenseCategoryService.updateCategory(1, { description: 'Updated' })

      expect(result).toEqual(mockUpdated)
    })

    it('should throw NotFoundError when category does not exist', async () => {
      expenseCategoryRepository.findById.mockResolvedValue(null)

      await expect(expenseCategoryService.updateCategory(999, {})).rejects.toThrow(NotFoundError)
    })

    it('should throw ValidationError when trying to modify default category name', async () => {
      expenseCategoryRepository.findById.mockResolvedValue({ id: 1, is_default: true })

      await expect(expenseCategoryService.updateCategory(1, { name: 'new_name' })).rejects.toThrow(
        ValidationError
      )
    })

    it('should throw ValidationError for invalid color format', async () => {
      expenseCategoryRepository.findById.mockResolvedValue({ id: 1, is_default: false })

      await expect(expenseCategoryService.updateCategory(1, { color: 'blue' })).rejects.toThrow(
        ValidationError
      )
    })

    it('should throw ConflictError when new name already exists', async () => {
      expenseCategoryRepository.findById.mockResolvedValue({ id: 1, is_default: false })
      expenseCategoryRepository.findByName.mockResolvedValue({ id: 2, name: 'flores' })

      await expect(expenseCategoryService.updateCategory(1, { name: 'flores' })).rejects.toThrow(
        ConflictError
      )
    })
  })

  describe('deleteCategory', () => {
    it('should soft delete non-default category', async () => {
      const mockCategory = { id: 1, name: 'custom', is_default: false }
      const mockDeleted = { ...mockCategory, active: false }
      expenseCategoryRepository.findById.mockResolvedValue(mockCategory)
      expenseCategoryRepository.delete.mockResolvedValue(mockDeleted)

      const result = await expenseCategoryService.deleteCategory(1)

      expect(result).toEqual(mockDeleted)
    })

    it('should throw NotFoundError when category does not exist', async () => {
      expenseCategoryRepository.findById.mockResolvedValue(null)

      await expect(expenseCategoryService.deleteCategory(999)).rejects.toThrow(NotFoundError)
    })

    it('should throw ValidationError when trying to delete default category', async () => {
      expenseCategoryRepository.findById.mockResolvedValue({ id: 1, is_default: true })

      await expect(expenseCategoryService.deleteCategory(1)).rejects.toThrow(ValidationError)
    })
  })
})
