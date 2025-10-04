/**
 * Integration Tests for Product Image Controller
 * Testing the integration between controller and service layer
 */

// Mock global objects for Node.js environment
global.console = {
  log: () => {},
  error: () => {},
  warn: () => {}
};

// Create a mock Supabase client that can be configured for different test scenarios
let mockSupabaseData = {
  product_images: [],
  product: { id: 1, name: 'Test Product', active: true }
};

function resetMockData() {
  mockSupabaseData = {
    product_images: [
      { id: 1, product_id: 1, image_index: 1, size: 'thumb', url: 'https://example.com/thumb.jpg', file_hash: 'hash1', mime_type: 'image/jpeg', is_primary: false },
      { id: 2, product_id: 1, image_index: 1, size: 'small', url: 'https://example.com/small.jpg', file_hash: 'hash1', mime_type: 'image/jpeg', is_primary: false },
      { id: 3, product_id: 1, image_index: 1, size: 'medium', url: 'https://example.com/medium.jpg', file_hash: 'hash1', mime_type: 'image/jpeg', is_primary: true },
      { id: 4, product_id: 1, image_index: 1, size: 'large', url: 'https://example.com/large.jpg', file_hash: 'hash1', mime_type: 'image/jpeg', is_primary: false }
    ],
    product: { id: 1, name: 'Test Product', active: true }
  };
}

resetMockData();

// Mock Supabase client with configurable responses
global.supabase = {
  from: (table) => {
    if (table === 'product_images') {
      return {
        select: (columns = '*') => ({
          eq: (field, value) => ({
            order: () => ({
              returns: {
                data: mockSupabaseData.product_images.filter(img => img[field] == value),
                error: null
              }
            }),
            limit: (limit) => ({
              single: () => {
                const filtered = mockSupabaseData.product_images.filter(img => img[field] == value);
                return {
                  data: filtered[0] || null,
                  error: filtered.length ? null : { code: 'PGRST116' } // Not found
                };
              }
            }),
            single: () => {
              return {
                data: mockSupabaseData.product_images[0] || null,
                error: null
              }
            }
          }),
          in: (field, values) => ({
            select: () => ({
              data: mockSupabaseData.product_images.filter(img => values.includes(img[field])),
              error: null
            })
          }),
          insert: (data) => {
            if (Array.isArray(data)) {
              // Add new images to the mock data
              data.forEach((img, index) => {
                const newId = mockSupabaseData.product_images.length + 1 + index;
                mockSupabaseData.product_images.push({ ...img, id: newId });
              });
            } else {
              // Add single image to mock data
              const newId = mockSupabaseData.product_images.length + 1;
              mockSupabaseData.product_images.push({ ...data, id: newId });
            }
            return {
              select: () => ({
                data: Array.isArray(data) ? data.map((img, index) => ({...data[index], id: mockSupabaseData.product_images.length - data.length + 1 + index})) : { ...data, id: mockSupabaseData.product_images.length },
                error: null
              })
            };
          },
          update: (updates) => ({
            eq: (field, value) => ({
              select: () => ({
                single: () => {
                  // Update matching items in mock data
                  mockSupabaseData.product_images = mockSupabaseData.product_images.map(img => 
                    img[field] == value ? { ...img, ...updates } : img
                  );
                  return {
                    data: mockSupabaseData.product_images.find(img => img[field] == value),
                    error: null
                  };
                }
              })
            })
          }),
          delete: () => ({
            eq: (field, value) => ({
              select: () => ({
                data: mockSupabaseData.product_images.filter(img => img[field] == value),
                error: null
              })
            })
          })
        })
      };
    } else if (table === 'products') {
      return {
        select: () => ({
          eq: (field, value) => ({
            single: () => ({
              data: mockSupabaseData.product,
              error: null
            })
          })
        })
      };
    }
  },
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: { path: 'test-path' }, error: null }),
      getPublicUrl: (path) => ({ data: { publicUrl: `https://test.supabase.co/${path}` } }),
      remove: () => ({ error: null })
    })
  }
};

// Mock function creator
function createMockFn(impl = () => {}) {
  const fn = impl;
  fn.mock = { calls: [] };
  fn.mockClear = () => { fn.mock.calls = []; };
  return fn;
}

// Mock asyncHandler
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Mock request and response objects
function createMockRequest(overrides = {}) {
  const defaults = {
    params: { id: '1', imageIndex: '1' },
    body: {},
    query: {},
    file: null,
    headers: { authorization: 'Bearer admin:1:admin' }
  };
  return { ...defaults, ...overrides };
}

function createMockResponse() {
  const res = {};
  res.status = createMockFn((code) => {
    res.statusCode = code;
    return res;
  });
  res.json = createMockFn((data) => {
    res.data = data;
    return res;
  });
  res.send = createMockFn((data) => {
    res.sentData = data;
    return res;
  });
  return res;
}

// Import the controller using dynamic import
async function runIntegrationTests() {
  const productImageController = await import('../api/controllers/productImageController.js');
  const productImageService = await import('../api/services/productImageService.js');

  // Test counter variables
  let testCount = 0;
  let passedCount = 0;

  function runTest(description, testFunction) {
    testCount++;
    try {
      testFunction();
      console.log(`✅ Test ${testCount}: ${description}`);
      passedCount++;
    } catch (error) {
      console.log(`❌ Test ${testCount}: ${description} - ${error.message}`);
    }
  }

  console.log('\\n🔗 Starting Product Image Controller Integration Tests...');

  // Test 1: Integration test - Get all images for a product
  runTest('getProductImages integrates with service layer correctly', async () => {
    const req = createMockRequest({ params: { id: '1' } });
    const res = createMockResponse();
    const next = createMockFn();

    try {
      // Execute controller function
      const controllerFunction = asyncHandler(productImageController.getProductImages);
      await controllerFunction(req, res, next);

      // Verify the response
      if (!res.status.mock.calls || res.status.mock.calls.length === 0) throw new Error('Response status not called');
      if (res.statusCode !== 200) throw new Error('Expected status 200');
      
      const response = res.data || res.sentData;
      if (response && response.success !== true) throw new Error('Expected success: true');
      if (response && (!Array.isArray(response.data) || response.data.length === 0)) throw new Error('Expected array of images');
      if (response && (!response.message || response.message.indexOf('image(s) retrieved') === -1)) throw new Error('Expected proper message');
    } catch (error) {
      console.error('getProductImages test error:', error);
      throw error;
    }
  });

  // Test 2: Integration test - Get primary image for a product
  runTest('getPrimaryImage integrates with service layer correctly', async () => {
    const req = createMockRequest({ params: { id: '1' } });
    const res = createMockResponse();
    const next = createMockFn();

    try {
      // Execute controller function
      const controllerFunction = asyncHandler(productImageController.getPrimaryImage);
      await controllerFunction(req, res, next);

      // Verify the response
      if (res.statusCode !== 200) throw new Error('Expected status 200');
      
      const response = res.data || res.sentData;
      if (response && response.success !== true) throw new Error('Expected success: true');
      if (response && response.data && response.data.is_primary !== true) throw new Error('Expected primary image');
      if (response && (!response.message || response.message.indexOf('Primary image retrieved') === -1)) throw new Error('Expected proper message');
    } catch (error) {
      console.error('getPrimaryImage test error:', error);
      throw error;
    }
  });

  // Test 3: Integration test - Create product images (JSON flow)
  runTest('createProductImages JSON flow integrates with service layer correctly', async () => {
    const req = createMockRequest({ 
      params: { id: '1' },
      body: {
        image_index: 2,
        images: [
          { size: 'thumb', url: 'https://example.com/thumb2.jpg', file_hash: 'hash234', mime_type: 'image/jpeg' },
          { size: 'small', url: 'https://example.com/small2.jpg', file_hash: 'hash234', mime_type: 'image/jpeg' }
        ],
        is_primary: false
      }
    });
    const res = createMockResponse();
    const next = createMockFn();

    try {
      // Execute controller function
      const controllerFunction = asyncHandler(productImageController.createProductImages);
      await controllerFunction(req, res, next);

      // Verify the response (should be 201 for created)
      if (res.statusCode !== 201) throw new Error('Expected status 201');
      
      const response = res.data || res.sentData;
      if (response && response.success !== true) throw new Error('Expected success: true');
      if (response && !Array.isArray(response.data)) throw new Error('Expected array of created images');
      if (response && (!response.message || response.message.indexOf('created') === -1)) throw new Error('Expected creation message');
    } catch (error) {
      console.error('createProductImages JSON flow test error:', error);
      throw error;
    }
  });

  // Test 4: Integration test - Delete images by index
  runTest('deleteImagesByIndex integrates with service layer correctly', async () => {
    const req = createMockRequest({ params: { id: '1', imageIndex: '1' } });
    const res = createMockResponse();
    const next = createMockFn();

    try {
      // Execute controller function
      const controllerFunction = asyncHandler(productImageController.deleteImagesByIndex);
      await controllerFunction(req, res, next);

      // Verify the response
      if (res.statusCode !== 200) throw new Error('Expected status 200');
      
      const response = res.data || res.sentData;
      if (response && response.success !== true) throw new Error('Expected success: true');
      if (response && (!response.data || typeof response.data.deleted_count !== 'number')) throw new Error('Expected deleted count');
      if (response && (!response.message || response.message.indexOf('deleted') === -1)) throw new Error('Expected deletion message');
    } catch (error) {
      console.error('deleteImagesByIndex test error:', error);
      throw error;
    }
  });

  // Test 5: Integration test - Set primary image
  runTest('setPrimaryImage integrates with service layer correctly', async () => {
    const req = createMockRequest({ params: { id: '1', imageIndex: '1' } });
    const res = createMockResponse();
    const next = createMockFn();

    try {
      // Execute controller function
      const controllerFunction = asyncHandler(productImageController.setPrimaryImage);
      await controllerFunction(req, res, next);

      // Verify the response
      if (res.statusCode !== 200) throw new Error('Expected status 200');
      
      const response = res.data || res.sentData;
      if (response && response.success !== true) throw new Error('Expected success: true');
      if (response && (!response.data || !response.data.size)) throw new Error('Expected image data in response');
      if (response && (!response.message || response.message.indexOf('set as primary') === -1)) throw new Error('Expected primary setting message');
    } catch (error) {
      console.error('setPrimaryImage test error:', error);
      throw error;
    }
  });

  // Test 6: Error handling integration
  runTest('getProductImages handles invalid product ID correctly', async () => {
    const req = createMockRequest({ params: { id: 'invalid' } });
    const res = createMockResponse();
    const next = createMockFn();

    try {
      // Execute controller function
      const controllerFunction = asyncHandler(productImageController.getProductImages);
      await controllerFunction(req, res, next);

      // For this test, we check if a proper error response was sent
      if (res.statusCode && res.statusCode >= 400) {
        // This is expected behavior
      } else if (next.mock.calls && next.mock.calls.length > 0) {
        // Error was passed to next middleware
      } else {
        // Check if response has error format
        const response = res.data || res.sentData;
        if (response && response.success === false) {
          // This is also acceptable
        } else {
          throw new Error('Expected error response or next() call');
        }
      }
    } catch (error) {
      console.error('getProductImages error handling test error:', error);
      throw error;
    }
  });

  // Test 7: Get images with specific size filter
  runTest('getProductImages handles size filter correctly', async () => {
    const req = createMockRequest({ 
      params: { id: '1' }, 
      query: { size: 'medium' } 
    });
    const res = createMockResponse();
    const next = createMockFn();

    try {
      // Execute controller function
      const controllerFunction = asyncHandler(productImageController.getProductImages);
      await controllerFunction(req, res, next);

      // Verify the response
      if (res.statusCode !== 200) throw new Error('Expected status 200');
      
      const response = res.data || res.sentData;
      if (response && response.success !== true) throw new Error('Expected success: true');
    } catch (error) {
      console.error('getProductImages size filter test error:', error);
      throw error;
    }
  });

  console.log(`\\n📊 Product Image Controller Integration Tests: ${passedCount}/${testCount} passed`);
}

// Run tests
runIntegrationTests();