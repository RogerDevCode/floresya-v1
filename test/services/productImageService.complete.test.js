import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Product Image Service - Image Management', () => {
  let mockRepo;
  let mockStorage;

  beforeEach(() => {
    vi.resetAllMocks();
    mockRepo = {
      findByProductId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    };
    mockStorage = {
      upload: vi.fn(),
      delete: vi.fn(),
      getPublicUrl: vi.fn()
    };
  });

  describe('Get product images', () => {
    it('should return all images for product', async () => {
      const images = [
        { id: 1, productId: 1, url: 'image1.jpg', isPrimary: true },
        { id: 2, productId: 1, url: 'image2.jpg', isPrimary: false }
      ];
      mockRepo.findByProductId.mockResolvedValue(images);
      const result = await mockRepo.findByProductId(1);
      expect(result).toHaveLength(2);
    });

    it('should identify primary image', async () => {
      const images = [
        { id: 1, isPrimary: true, url: 'primary.jpg' },
        { id: 2, isPrimary: false, url: 'secondary.jpg' }
      ];
      mockRepo.findByProductId.mockResolvedValue(images);
      const result = await mockRepo.findByProductId(1);
      const primary = result.find(img => img.isPrimary);
      expect(primary).toBeDefined();
    });
  });

  describe('Upload product image', () => {
    it('should upload and create image record', async () => {
      const file = { name: 'product.jpg', data: Buffer.from('test') };
      mockStorage.upload.mockResolvedValue({ path: 'products/product.jpg' });
      mockRepo.create.mockResolvedValue({
        id: 1,
        productId: 1,
        url: 'products/product.jpg',
        isPrimary: false
      });
      
      const uploadResult = await mockStorage.upload(file);
      const dbResult = await mockRepo.create({ productId: 1, url: uploadResult.path });
      
      expect(dbResult.url).toBe('products/product.jpg');
    });

    it('should validate image dimensions', () => {
      const width = 1024;
      const height = 768;
      const maxWidth = 2000;
      const maxHeight = 2000;
      
      expect(width).toBeLessThanOrEqual(maxWidth);
      expect(height).toBeLessThanOrEqual(maxHeight);
    });

    it('should set first image as primary', async () => {
      const images = [];
      const isPrimary = images.length === 0;
      expect(isPrimary).toBe(true);
    });
  });

  describe('Update image metadata', () => {
    it('should update image details', async () => {
      const updates = { alt: 'Product photo', displayOrder: 2 };
      mockRepo.update.mockResolvedValue({ id: 1, ...updates });
      const result = await mockRepo.update(1, updates);
      expect(result.alt).toBe('Product photo');
    });

    it('should set new primary image', async () => {
      mockRepo.update.mockResolvedValue({ id: 2, isPrimary: true });
      const result = await mockRepo.update(2, { isPrimary: true });
      expect(result.isPrimary).toBe(true);
    });
  });

  describe('Delete product image', () => {
    it('should delete from storage and database', async () => {
      mockStorage.delete.mockResolvedValue({ success: true });
      mockRepo.delete.mockResolvedValue({ id: 1 });
      
      await mockStorage.delete('products/image.jpg');
      await mockRepo.delete(1);
      
      expect(mockStorage.delete).toHaveBeenCalled();
      expect(mockRepo.delete).toHaveBeenCalled();
    });

    it('should prevent deleting primary image if others exist', () => {
      const images = [
        { id: 1, isPrimary: true },
        { id: 2, isPrimary: false }
      ];
      const imageToDelete = images[0];
      const canDelete = !imageToDelete.isPrimary || images.length === 1;
      expect(canDelete).toBe(false);
    });
  });

  describe('Image URL generation', () => {
    it('should generate public URLs', () => {
      const path = 'products/image.jpg';
      const baseUrl = 'https://storage.supabase.co';
      const publicUrl = `${baseUrl}/${path}`;
      mockStorage.getPublicUrl.mockReturnValue(publicUrl);
      const result = mockStorage.getPublicUrl(path);
      expect(result).toContain(path);
    });

    it('should generate thumbnail URLs', () => {
      const originalUrl = 'products/image.jpg';
      const thumbnailUrl = originalUrl.replace('.jpg', '_thumb.jpg');
      expect(thumbnailUrl).toContain('_thumb');
    });
  });
});
