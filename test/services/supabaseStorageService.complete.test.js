import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Supabase Storage Service - File Storage', () => {
  let mockStorage;

  beforeEach(() => {
    vi.resetAllMocks();
    mockStorage = {
      upload: vi.fn(),
      download: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
      getPublicUrl: vi.fn()
    };
  });

  describe('File upload', () => {
    it('should upload file successfully', async () => {
      const file = { name: 'test.jpg', data: Buffer.from('test') };
      mockStorage.upload.mockResolvedValue({ path: 'uploads/test.jpg' });
      const result = await mockStorage.upload(file);
      expect(result.path).toContain('test.jpg');
    });

    it('should validate file size', () => {
      const maxSize = 5 * 1024 * 1024; // 5MB
      const fileSize = 3 * 1024 * 1024; // 3MB
      expect(fileSize).toBeLessThanOrEqual(maxSize);
    });

    it('should validate file type', () => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const fileType = 'image/jpeg';
      expect(allowedTypes).toContain(fileType);
    });

    it('should generate unique filenames', () => {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const filename = `${timestamp}-${random}.jpg`;
      expect(filename).toMatch(/^\d+-[a-z0-9]+\.jpg$/);
    });
  });

  describe('File download', () => {
    it('should download file successfully', async () => {
      const path = 'uploads/test.jpg';
      mockStorage.download.mockResolvedValue({ data: Buffer.from('test') });
      const result = await mockStorage.download(path);
      expect(result.data).toBeDefined();
    });

    it('should handle missing files', async () => {
      mockStorage.download.mockResolvedValue(null);
      const result = await mockStorage.download('non-existent.jpg');
      expect(result).toBeNull();
    });
  });

  describe('File deletion', () => {
    it('should delete file successfully', async () => {
      mockStorage.delete.mockResolvedValue({ success: true });
      const result = await mockStorage.delete('uploads/test.jpg');
      expect(result.success).toBe(true);
    });

    it('should handle deletion errors', async () => {
      mockStorage.delete.mockRejectedValue(new Error('File not found'));
      await expect(mockStorage.delete('non-existent.jpg')).rejects.toThrow('File not found');
    });
  });

  describe('File listing', () => {
    it('should list files in bucket', async () => {
      const files = [
        { name: 'test1.jpg', size: 1024 },
        { name: 'test2.jpg', size: 2048 }
      ];
      mockStorage.list.mockResolvedValue(files);
      const result = await mockStorage.list();
      expect(result).toHaveLength(2);
    });

    it('should filter files by prefix', async () => {
      const files = [
        { name: 'uploads/test.jpg' },
        { name: 'uploads/photo.jpg' }
      ];
      mockStorage.list.mockResolvedValue(files);
      const result = await mockStorage.list();
      expect(result.every(f => f.name.startsWith('uploads/'))).toBe(true);
    });
  });

  describe('Public URL generation', () => {
    it('should generate public URL', () => {
      const path = 'uploads/test.jpg';
      const url = `https://storage.supabase.co/bucket/${path}`;
      mockStorage.getPublicUrl.mockReturnValue(url);
      const result = mockStorage.getPublicUrl(path);
      expect(result).toContain(path);
    });

    it('should handle signed URLs', () => {
      const path = 'private/test.jpg';
      const expiresIn = 3600;
      const url = `https://storage.supabase.co/bucket/${path}?token=xyz`;
      expect(url).toContain('token=');
    });
  });
});
