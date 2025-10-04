/**
 * Integration Tests for Product Form Page (Frontend)
 * Testing interactions between various frontend components
 */

// Mock DOM environment for Node.js
class MockElement {
  constructor(tag = 'div', attrs = {}) {
    this.tagName = tag.toUpperCase();
    this.innerHTML = '';
    this.textContent = '';
    this.value = '';
    this.checked = false;
    this.disabled = false;
    this.className = 'hidden'; // Start with hidden for modal
    this.src = '';
    this.style = { display: 'block' };
    
    // ClassList mock
    this.classList = {
      add: (cls) => {
        this.className += ` ${cls}`;
        return this;
      },
      remove: (cls) => {
        this.className = this.className.replace(cls, '').replace('  ', ' ').trim();
        return this;
      },
      contains: (cls) => this.className.includes(cls),
      toggle: (cls) => {
        if (this.classList.contains(cls)) {
          this.classList.remove(cls);
        } else {
          this.classList.add(cls);
        }
      }
    };
    
    // Attributes
    this.attributes = {};
    for (const [key, value] of Object.entries(attrs)) {
      this.attributes[key] = { value };
      if (key === 'id') this.id = value;
      if (key === 'data-index') this.dataset = { index: value };
      if (key === 'data-product-id') this.dataset = { productId: value };
    }
    
    // Event listeners
    this.eventListeners = {};
    this.addEventListener = (event, handler) => {
      if (!this.eventListeners[event]) {
        this.eventListeners[event] = [];
      }
      this.eventListeners[event].push(handler);
    };
    
    this.removeEventListener = (event, handler) => {
      if (this.eventListeners[event]) {
        this.eventListeners[event] = this.eventListeners[event].filter(h => h !== handler);
      }
    };
    
    this.dispatchEvent = (event) => {
      const eventName = event.type;
      if (this.eventListeners[eventName]) {
        this.eventListeners[eventName].forEach(handler => handler(event));
      }
    };
    
    // Methods
    this.click = () => this.dispatchEvent({ type: 'click' });
    this.focus = () => {};
    this.blur = () => {};
    
    // Form-specific methods
    if (tag === 'input' || tag === 'select' || tag === 'textarea') {
      this.focus = () => {};
      this.blur = () => {};
    }
  }
}

// Mock DOM
global.document = {
  getElementById: () => {},
  getElementsByClassName: () => [],
  querySelector: () => {},
  querySelectorAll: () => [],
  createElement: (tag) => new MockElement(tag),
  addEventListener: () => {},
  body: { appendChild: () => {}, removeChild: () => {} }
};

// Mock window
global.window = {
  location: { href: '', assign: jest.fn() },
  localStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn()
  },
  addEventListener: jest.fn(),
  URL: {
    createObjectURL: jest.fn(() => 'blob:test'),
    revokeObjectURL: jest.fn()
  },
  confirm: jest.fn(() => true), // Default to confirming
  alert: jest.fn(),
  fetch: jest.fn(),
  lucide: {
    createIcons: jest.fn()
  }
};

// Mock console
global.console = {
  log: () => {},
  error: () => {},
  warn: () => {}
};

// Mock FileReader
global.FileReader = class {
  constructor() {
    this.onload = null;
    this.onerror = null;
  }
  
  readAsDataURL(file) {
    if (this.onload) {
      this.onload({ target: { result: 'data:image/jpeg;base64,fakeimage' } });
    }
  }
};

// Mock image
global.Image = class {
  constructor() {
    this.onload = null;
    this.onerror = null;
    this.width = 1200;
    this.height = 1200;
  }
  
  set src(value) {
    if (this.onload) {
      this.onload();
    }
  }
};

// Mock toast component
const mockToast = {
  success: () => {},
  error: () => {},
  info: () => {},
  warning: () => {}
};

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

// Mock DOM elements setup for integration tests
function setupIntegrationElements() {
  // Reset mock implementations
  global.document.getElementById.mockClear();
  global.document.querySelector.mockClear();
  global.document.querySelectorAll.mockClear();
  
  // Create mock elements that interact with each other
  const mockElements = {
    // Modal and form elements
    'product-form-modal': new MockElement('div', { id: 'product-form-modal', class: 'hidden' }),
    'product-form-title': new MockElement('h2', { id: 'product-form-title' }),
    'product-form': new MockElement('form', { id: 'product-form' }),
    'product-name': new MockElement('input', { id: 'product-name', type: 'text' }),
    'product-description': new MockElement('textarea', { id: 'product-description' }),
    'product-price-usd': new MockElement('input', { id: 'product-price-usd', type: 'number' }),
    'product-price-ves': new MockElement('input', { id: 'product-price-ves', type: 'number' }),
    'product-stock': new MockElement('input', { id: 'product-stock', type: 'number' }),
    'product-sku': new MockElement('input', { id: 'product-sku', type: 'text' }),
    'product-featured': new MockElement('input', { id: 'product-featured', type: 'checkbox' }),
    'product-carousel-order': new MockElement('input', { id: 'product-carousel-order', type: 'number' }),
    
    // Image-related elements
    'product-images-grid': new MockElement('div', { id: 'product-images-grid' }),
    'product-image-upload': new MockElement('input', { id: 'product-image-upload', type: 'file' }),
    
    // Action buttons
    'close-product-form': new MockElement('button', { id: 'close-product-form' }),
    'cancel-product-form': new MockElement('button', { id: 'cancel-product-form' }),
    'save-product-btn': new MockElement('button', { id: 'save-product-btn' }),
    
    // Occasions section
    'occasions-list': new MockElement('div', { id: 'occasions-list' }),
    
    // Product list elements
    'products-list': new MockElement('tbody', { id: 'products-list' }),
    'new-product-btn': new MockElement('button', { id: 'new-product-btn' }),
    
    // Toast container
    'toast-container': new MockElement('div', { id: 'toast-container' })
  };
  
  // Setup get queries
  global.document.getElementById = (id) => mockElements[id] || null;
  global.document.querySelector = (selector) => {
    if (selector === '#product-form') return mockElements['product-form'];
    if (selector === 'form') return mockElements['product-form'];
    if (selector.startsWith('#')) return mockElements[selector.substring(1)];
    return new MockElement('div');
  };
  global.document.querySelectorAll = (selector) => {
    if (selector === '.image-slot') {
      // Return 5 mock image slots
      return Array.from({ length: 5 }, (_, i) => {
        const slot = new MockElement('div', { 'data-index': i.toString() });
        slot.classList.contains = (cls) => {
          return cls === 'drag-over' || cls === 'dragging' || cls === 'has-image' || cls === 'is-primary';
        };
        return slot;
      });
    }
    if (selector === '.edit-product-link') return [];
    if (selector === '.delete-product-link') return [];
    return [];
  };
  
  return mockElements;
}

console.log('\\n🔗 Starting Product Form Page Integration Tests...');

// Test 1: Full form workflow - Open form, add data, submit
runTest('Complete product form workflow should work end-to-end', (done) => {
  const mockElements = setupIntegrationElements();
  
  import('../public/pages/admin/dashboard.js')
    .then((dashboardModule) => {
      // Mock successful fetch responses
      global.window.fetch = jest.fn((url) => {
        if (url.includes('/api/products')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              data: { id: 123, name: 'Test Product' }
            })
          });
        }
        if (url.includes('/api/occasions')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              data: [{ id: 1, name: 'Birthday' }, { id: 2, name: 'Anniversary' }]
            })
          });
        }
        return Promise.resolve({ ok: false });
      });
      
      // Step 1: Open the form for creating a new product
      dashboardModule.openProductForm(null);
      
      // Verify modal is open
      if (mockElements['product-form-modal'].classList.contains('hidden')) {
        throw new Error('Modal should be open after openProductForm');
      }
      
      // Step 2: Enter product data
      mockElements['product-name'].value = 'Test Product';
      mockElements['product-price-usd'].value = '29.99';
      mockElements['product-stock'].value = '10';
      mockElements['product-description'].value = 'Test product description';
      
      // Step 3: Add an image
      const mockFile = {
        type: 'image/jpeg',
        size: 1024000, // 1MB
        name: 'test.jpg'
      };
      
      mockElements['product-image-upload'].files = [mockFile];
      mockElements['product-image-upload'].dataset = { targetIndex: '0' };
      
      // Simulate file selection event
      const event = {
        target: mockElements['product-image-upload'],
        preventDefault: jest.fn()
      };
      
      dashboardModule.handleFileSelect(event);
      
      // Step 4: Simulate form submission after a delay for file processing
      setTimeout(() => {
        try {
          // Create submit event
          const submitEvent = {
            preventDefault: jest.fn(),
            target: mockElements['product-form']
          };
          
          dashboardModule.handleProductFormSubmit(submitEvent);
          
          // Verify the form submission process started
          if (mockElements['save-product-btn'].disabled !== true) {
            throw new Error('Save button should be disabled during submission');
          }
          
          done();
        } catch (err) {
          done(err);
        }
      }, 150);
    })
    .catch(err => console.error('Test failed:', err));
}, 5000);

// Test 2: Image drag-and-drop functionality integration
runTest('Image drag-and-drop functionality should work correctly', () => {
  setupIntegrationElements();
  
  import('../public/pages/admin/dashboard.js')
    .then((dashboardModule) => {
      // Initialize with some images
      dashboardModule.productImages = [
        { file: {}, preview: 'prev1', index: 0, isPrimary: true },
        { file: {}, preview: 'prev2', index: 2, isPrimary: false }
      ];
      
      // Create a drag event
      const dragEvent = {
        currentTarget: { dataset: { index: '0' } },
        dataTransfer: { effectAllowed: '' },
        preventDefault: jest.fn(),
        stopPropagation: jest.fn()
      };
      
      // Test drag start
      dashboardModule.handleDragStart(dragEvent);
      if (typeof dashboardModule.draggedImageIndex === 'undefined') {
        throw new Error('draggedImageIndex should be set after drag start');
      }
      
      // Test drag over
      dashboardModule.handleDragOver(dragEvent);
      if (dragEvent.dataTransfer.dropEffect !== 'move') {
        throw new Error('dropEffect should be set to move');
      }
      
      // Test drop
      const dropEvent = {
        ...dragEvent,
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        currentTarget: { dataset: { index: '1' } }
      };
      
      dashboardModule.handleDrop(dropEvent);
      
      // Should have updated the image indices after drop
      console.log('Drag and drop functionality tested');
    })
    .catch(err => console.error('Test failed:', err));
});

// Test 3: Image management integration (add, set primary, remove)
runTest('Image management functions should work together', () => {
  setupIntegrationElements();
  
  import('../public/pages/admin/dashboard.js')
    .then((dashboardModule) => {
      // Initialize empty images array
      dashboardModule.productImages = [];
      dashboardModule.currentEditingProductId = 1;
      
      // Step 1: Add an image
      const mockFile = { name: 'test.jpg', size: 1000, type: 'image/jpeg' };
      const imageData = {
        file: mockFile,
        preview: 'data:image/jpeg;base64,fake',
        index: 0,
        isPrimary: true
      };
      
      dashboardModule.productImages.push(imageData);
      
      // Verify image was added
      if (dashboardModule.productImages.length !== 1) {
        throw new Error('Image should be added to array');
      }
      
      // Step 2: Add another image
      const imageData2 = {
        file: mockFile,
        preview: 'data:image/jpeg;base64,fake2',
        index: 1,
        isPrimary: false
      };
      
      dashboardModule.productImages.push(imageData2);
      
      // Step 3: Set second image as primary
      dashboardModule.setPrimaryImage(1);
      
      if (dashboardModule.productImages[0].isPrimary !== false) {
        throw new Error('First image should no longer be primary');
      }
      
      if (dashboardModule.productImages[1].isPrimary !== true) {
        throw new Error('Second image should be primary');
      }
      
      // Step 4: Remove first image
      global.window.confirm = () => true; // Mock confirmation
      dashboardModule.removeImage(0);
      
      if (dashboardModule.productImages.length !== 1) {
        throw new Error('First image should be removed');
      }
      
      if (dashboardModule.productImages[0].index !== 1) {
        throw new Error('Remaining image should have correct index');
      }
    })
    .catch(err => console.error('Test failed:', err));
});

// Test 4: Form validation integration
runTest('Form validation should prevent submission with invalid data', (done) => {
  const mockElements = setupIntegrationElements();
  
  import('../public/pages/admin/dashboard.js')
    .then((dashboardModule) => {
      // Set up a form with invalid data
      mockElements['product-name'].value = ''; // Invalid - empty
      mockElements['product-price-usd'].value = '-10'; // Invalid - negative
      
      // Create submit event
      const submitEvent = {
        preventDefault: jest.fn(),
        target: mockElements['product-form']
      };
      
      // Mock toast.error to track if validation errors are shown
      mockToast.error.mockClear();
      
      dashboardModule.handleProductFormSubmit(submitEvent);
      
      // Check if validation prevented submission
      setTimeout(() => {
        try {
          if (mockToast.error.mock.calls.length === 0) {
            throw new Error('Validation error should be displayed for invalid data');
          }
          
          done();
        } catch (err) {
          done(err);
        }
      }, 50);
    })
    .catch(err => console.error('Test failed:', err));
}, 1000);

// Test 5: Product list rendering integration with images
runTest('Product list rendering should work with image URLs', () => {
  setupIntegrationElements();
  
  import('../public/pages/admin/dashboard.js')
    .then((dashboardModule) => {
      // Mock products array with image URLs
      const mockProducts = [
        {
          id: 1,
          name: 'Product 1',
          price_usd: 29.99,
          stock: 5,
          active: true,
          image_url: 'https://example.com/product1.jpg',
          sku: 'SKU123'
        },
        {
          id: 2,
          name: 'Product 2',
          price_usd: 39.99,
          stock: 10,
          active: false,
          image_url: null,
          sku: 'SKU456'
        }
      ];
      
      // Add products to module state
      dashboardModule.products = mockProducts;
      
      // Call render function
      dashboardModule.renderProducts(mockProducts);
      
      // The function should complete without errors
      console.log('Product list rendering completed');
    })
    .catch(err => console.error('Test failed:', err));
});

// Test 6: Occasions loading integration
runTest('Occasions loading should populate the form correctly', (done) => {
  setupIntegrationElements();
  
  import('../public/pages/admin/dashboard.js')
    .then((dashboardModule) => {
      // Mock the API response for occasions
      global.window.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: [
              { id: 1, name: 'Birthday' },
              { id: 2, name: 'Anniversary' },
              { id: 3, name: 'Valentine\'s Day' }
            ]
          })
        })
      );
      
      // Call the function
      dashboardModule.loadOccasions();
      
      // Check if the fetch was called
      setTimeout(() => {
        try {
          const fetchCalls = global.window.fetch.mock.calls;
          const occasionsCall = fetchCalls.find(call => call[0].includes('/api/occasions'));
          
          if (!occasionsCall) {
            throw new Error('loadOccasions should call /api/occasions endpoint');
          }
          
          done();
        } catch (err) {
          done(err);
        }
      }, 100);
    })
    .catch(err => console.error('Test failed:', err));
}, 1000);

// Test 7: Product editing workflow
runTest('Product editing workflow should pre-populate form correctly', () => {
  const mockElements = setupIntegrationElements();
  
  import('../public/pages/admin/dashboard.js')
    .then((dashboardModule) => {
      // Mock products array
      dashboardModule.products = [
        {
          id: 1,
          name: 'Test Product',
          description: 'Test description',
          price_usd: 29.99,
          price_ves: 950000,
          stock: 5,
          sku: 'TEST001',
          featured: true,
          carousel_order: 1,
          active: true
        }
      ];
      
      // Call open form in edit mode
      dashboardModule.openProductForm(1);
      
      // Check if form was populated correctly
      if (mockElements['product-form-title'].textContent !== 'Editar Producto') {
        throw new Error('Title should be "Editar Producto" in edit mode');
      }
      
      if (mockElements['product-name'].value !== 'Test Product') {
        throw new Error('Product name should be pre-filled');
      }
      
      if (mockElements['product-price-usd'].value !== '29.99') {
        throw new Error('Product price should be pre-filled');
      }
      
      if (mockElements['product-featured'].checked !== true) {
        throw new Error('Featured checkbox should be checked');
      }
    })
    .catch(err => console.error('Test failed:', err));
});

console.log(`\\n📊 Product Form Page Integration Tests: ${passedCount}/${testCount} passed`);