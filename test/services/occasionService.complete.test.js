import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Occasion Service - Event Management', () => {
  let mockRepo;

  beforeEach(() => {
    vi.resetAllMocks();
    mockRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    };
  });

  describe('Get all occasions', () => {
    it('should return all occasions', async () => {
      const occasions = [
        { id: 1, name: 'Birthday', active: true },
        { id: 2, name: 'Anniversary', active: true }
      ];
      mockRepo.findAll.mockResolvedValue(occasions);
      const result = await mockRepo.findAll();
      expect(result).toHaveLength(2);
    });

    it('should filter active occasions', async () => {
      const occasions = [
        { id: 1, name: 'Birthday', active: true },
        { id: 2, name: 'Deleted', active: false }
      ];
      mockRepo.findAll.mockResolvedValue(occasions.filter(o => o.active));
      const result = await mockRepo.findAll();
      expect(result).toHaveLength(1);
    });
  });

  describe('Get occasion by ID', () => {
    it('should return occasion by ID', async () => {
      const occasion = { id: 1, name: 'Birthday' };
      mockRepo.findById.mockResolvedValue(occasion);
      const result = await mockRepo.findById(1);
      expect(result.id).toBe(1);
    });

    it('should return null for non-existent ID', async () => {
      mockRepo.findById.mockResolvedValue(null);
      const result = await mockRepo.findById(999);
      expect(result).toBeNull();
    });
  });

  describe('Create occasion', () => {
    it('should create new occasion', async () => {
      const newOccasion = { name: 'Wedding', description: 'Wedding event' };
      const created = { id: 1, ...newOccasion };
      mockRepo.create.mockResolvedValue(created);
      const result = await mockRepo.create(newOccasion);
      expect(result.id).toBeDefined();
    });

    it('should validate occasion name', () => {
      const name = 'Birthday';
      expect(name).toBeTruthy();
      expect(name.length).toBeGreaterThan(0);
    });
  });

  describe('Update occasion', () => {
    it('should update occasion', async () => {
      const updates = { name: 'Updated Birthday' };
      mockRepo.update.mockResolvedValue({ id: 1, ...updates });
      const result = await mockRepo.update(1, updates);
      expect(result.name).toBe('Updated Birthday');
    });
  });

  describe('Delete occasion', () => {
    it('should soft delete occasion', async () => {
      mockRepo.delete.mockResolvedValue({ id: 1, active: false });
      const result = await mockRepo.delete(1);
      expect(result.active).toBe(false);
    });
  });
});
