/**
 * Expenses Management Controller
 * Manages CRUD operations for expenses in admin panel
 */

import { initAdminCommon } from '../../js/admin-common.js';
import { toast } from '../../js/components/toast.js';
import { api } from '../../js/shared/api-client.js';
import { initThemeManager } from '../../js/themes/themeManager.js';

// Global state
let expenses = [];
let filters = {
  category: '',
  startDate: '',
  endDate: ''
};

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', async () => {
  // Check admin access
  await checkAdminAccess();

  // Init theme and common admin features
  initThemeManager();
  initAdminCommon();

  // Load user info
  loadUserInfo();

  // Init event listeners
  initEventListeners();

  // Load expenses
  await loadExpenses();

  // Set default date to today
  document.getElementById('expense-date').valueAsDate = new Date();
});

// ==================== ACCESS CONTROL ====================

function checkAdminAccess() {
  try {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    
    if (!user.id || user.role !== 'admin') {
      toast.error('Acceso denegado. Solo administradores.');
      setTimeout(() => {
        window.location.href = '../../index.html';
      }, 2000);
      throw new Error('Unauthorized access');
    }
  } catch (error) {
    console.error('Access check failed:', error);
    window.location.href = '../../index.html';
  }
}

// ==================== USER INFO ====================

function loadUserInfo() {
  try {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const userNameEl = document.getElementById('user-name');
    
    if (userNameEl && user.email) {
      const userName = user.email.split('@')[0];
      userNameEl.textContent = userName.charAt(0).toUpperCase() + userName.slice(1);
    }
  } catch (error) {
    console.error('Error loading user info:', error);
  }
}

// ==================== EVENT LISTENERS ====================

function initEventListeners() {
  // Modal controls
  document.getElementById('add-expense-btn').addEventListener('click', () => openModal());
  document.getElementById('close-modal-btn').addEventListener('click', closeModal);
  document.getElementById('cancel-btn').addEventListener('click', closeModal);
  document.getElementById('expense-modal').addEventListener('click', (e) => {
    if (e.target.id === 'expense-modal') {
      closeModal();
    }
  });

  // Form submission
  document.getElementById('expense-form').addEventListener('submit', handleSubmit);

  // Filters
  document.getElementById('filter-category').addEventListener('change', handleFilterChange);
  document.getElementById('filter-start-date').addEventListener('change', handleFilterChange);
  document.getElementById('filter-end-date').addEventListener('change', handleFilterChange);
  document.getElementById('filter-reset-btn').addEventListener('click', resetFilters);

  // Receipt file input
  document.getElementById('expense-receipt').addEventListener('change', handleReceiptChange);
  document.getElementById('receipt-remove')?.addEventListener('click', handleReceiptRemove);

  // Back button
  document.getElementById('back-btn').addEventListener('click', () => {
    window.location.href = './dashboard.html';
  });

  // Logout
  document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
}

// ==================== DATA LOADING ====================

async function loadExpenses() {
  const loadingState = document.getElementById('loading-state');
  const emptyState = document.getElementById('empty-state');
  const tableBody = document.getElementById('expenses-table-body');

  try {
    loadingState.classList.remove('hidden');
    emptyState.classList.add('hidden');

    const response = await api.get('/api/accounting/expenses');
    
    if (response.success) {
      expenses = response.data || [];
      renderExpenses();
    } else {
      throw new Error(response.error || 'Failed to load expenses');
    }
  } catch (error) {
    console.error('Error loading expenses:', error);
    toast.error('Error al cargar gastos');
    expenses = [];
    tableBody.innerHTML = '';
    emptyState.classList.remove('hidden');
  } finally {
    loadingState.classList.add('hidden');
  }
}

// ==================== RENDERING ====================

function renderExpenses() {
  const tableBody = document.getElementById('expenses-table-body');
  const emptyState = document.getElementById('empty-state');

  // Apply filters
  const filteredExpenses = expenses.filter(expense => {
    if (filters.category && expense.category !== filters.category) {
      return false;
    }
    if (filters.startDate && expense.expense_date < filters.startDate) {
      return false;
    }
    if (filters.endDate && expense.expense_date > filters.endDate) {
      return false;
    }
    return true;
  });

  if (filteredExpenses.length === 0) {
    tableBody.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  // Sort by date (newest first)
  filteredExpenses.sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date));

  tableBody.innerHTML = filteredExpenses.map(expense => `
    <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
        ${formatDate(expense.expense_date)}
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(expense.category)}">
          ${formatCategory(expense.category)}
        </span>
      </td>
      <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
        ${escapeHtml(expense.description)}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
        $${parseFloat(expense.amount).toFixed(2)}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        ${formatPaymentMethod(expense.payment_method)}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm">
        ${expense.receipt_url ? `
          <a href="${expense.receipt_url}" target="_blank" class="text-blue-600 hover:text-blue-800 dark:text-blue-400" title="Ver comprobante">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
          </a>
        ` : '<span class="text-gray-400 dark:text-gray-600">-</span>'}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
        <button
          onclick="window.expensesController.editExpense(${expense.id})"
          class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          title="Editar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          </svg>
        </button>
        <button
          onclick="window.expensesController.deleteExpense(${expense.id})"
          class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          title="Eliminar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </button>
      </td>
    </tr>
  `).join('');
}

// ==================== MODAL OPERATIONS ====================

function openModal(expense = null) {
  const modal = document.getElementById('expense-modal');
  const modalTitle = document.getElementById('modal-title');
  const form = document.getElementById('expense-form');
  const receiptInput = document.getElementById('expense-receipt');
  const receiptPreview = document.getElementById('receipt-preview');
  const receiptCurrent = document.getElementById('receipt-current');
  const receiptLink = document.getElementById('receipt-link');

  // Reset receipt UI
  receiptInput.value = '';
  receiptPreview.classList.add('hidden');
  receiptCurrent.classList.add('hidden');

  if (expense) {
    modalTitle.textContent = 'Editar Gasto';
    document.getElementById('expense-id').value = expense.id;
    document.getElementById('expense-category').value = expense.category;
    document.getElementById('expense-amount').value = expense.amount;
    document.getElementById('expense-date').value = expense.expense_date;
    document.getElementById('expense-payment-method').value = expense.payment_method;
    document.getElementById('expense-description').value = expense.description;
    document.getElementById('expense-notes').value = expense.notes || '';

    // Show existing receipt link if available
    if (expense.receipt_url) {
      receiptLink.href = expense.receipt_url;
      receiptCurrent.classList.remove('hidden');
    }
  } else {
    modalTitle.textContent = 'Nuevo Gasto';
    form.reset();
    document.getElementById('expense-date').valueAsDate = new Date();
  }

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('expense-modal');
  const form = document.getElementById('expense-form');
  
  modal.classList.add('hidden');
  document.body.style.overflow = '';
  form.reset();
}

// ==================== FORM HANDLING ====================

async function handleSubmit(e) {
  e.preventDefault();

  const receiptFile = document.getElementById('expense-receipt').files[0];

  // Validate file size (5MB max)
  if (receiptFile && receiptFile.size > 5 * 1024 * 1024) {
    toast.error('El archivo es muy grande. Máximo 5MB');
    return;
  }

  // Prepare FormData for multipart upload
  const formData = new FormData();
  formData.append('category', document.getElementById('expense-category').value);
  formData.append('amount', parseFloat(document.getElementById('expense-amount').value));
  formData.append('expense_date', document.getElementById('expense-date').value);
  formData.append('payment_method', document.getElementById('expense-payment-method').value);
  formData.append('description', document.getElementById('expense-description').value.trim());
  
  const notes = document.getElementById('expense-notes').value.trim();
  if (notes) {
    formData.append('notes', notes);
  }

  if (receiptFile) {
    formData.append('receipt', receiptFile);
  }

  // Basic validation
  if (!formData.get('category') || !formData.get('amount') || !formData.get('expense_date') || 
      !formData.get('payment_method') || !formData.get('description')) {
    toast.error('Por favor completa todos los campos requeridos');
    return;
  }

  if (parseFloat(formData.get('amount')) <= 0) {
    toast.error('El monto debe ser mayor a 0');
    return;
  }

  try {
    const expenseId = document.getElementById('expense-id').value;
    let response;

    if (expenseId) {
      // Update - use fetch for FormData (multipart)
      // eslint-disable-next-line no-restricted-globals
      const res = await fetch(`${api.baseUrl}/api/accounting/expenses/${expenseId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token') || ''}`
        },
        body: formData,
        credentials: 'include'
      });
      response = await res.json();
    } else {
      // Create - use fetch for FormData (multipart)
      // eslint-disable-next-line no-restricted-globals
      const res = await fetch(`${api.baseUrl}/api/accounting/expenses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token') || ''}`
        },
        body: formData,
        credentials: 'include'
      });
      response = await res.json();
    }

    if (response.success) {
      toast.success(expenseId ? 'Gasto actualizado exitosamente' : 'Gasto registrado exitosamente');
      closeModal();
      await loadExpenses();
    } else {
      throw new Error(response.error || 'Operation failed');
    }
  } catch (error) {
    console.error('Error saving expense:', error);
    toast.error('Error al guardar gasto');
  }
}

// ==================== EXPENSE OPERATIONS ====================

function editExpense(id) {
  const expense = expenses.find(e => e.id === id);
  if (expense) {
    openModal(expense);
  }
}

async function deleteExpense(id) {
  if (!confirm('¿Estás seguro de eliminar este gasto?')) {
    return;
  }

  try {
    const response = await api.delete(`/api/accounting/expenses/${id}`);
    
    if (response.success) {
      toast.success('Gasto eliminado exitosamente');
      await loadExpenses();
    } else {
      throw new Error(response.error || 'Delete failed');
    }
  } catch (error) {
    console.error('Error deleting expense:', error);
    toast.error('Error al eliminar gasto');
  }
}

// ==================== FILTERS ====================

function handleFilterChange() {
  filters.category = document.getElementById('filter-category').value;
  filters.startDate = document.getElementById('filter-start-date').value;
  filters.endDate = document.getElementById('filter-end-date').value;
  
  renderExpenses();
}

function resetFilters() {
  document.getElementById('filter-category').value = '';
  document.getElementById('filter-start-date').value = '';
  document.getElementById('filter-end-date').value = '';
  
  filters = {
    category: '',
    startDate: '',
    endDate: ''
  };
  
  renderExpenses();
}

// ==================== RECEIPT HANDLING ====================

function handleReceiptChange(e) {
  const file = e.target.files[0];
  const preview = document.getElementById('receipt-preview');
  const filename = document.getElementById('receipt-filename');

  if (!file) {
    preview.classList.add('hidden');
    return;
  }

  // Validate file size
  if (file.size > 5 * 1024 * 1024) {
    toast.error('El archivo es muy grande. Máximo 5MB');
    e.target.value = '';
    preview.classList.add('hidden');
    return;
  }

  // Show preview
  filename.textContent = file.name;
  preview.classList.remove('hidden');
}

function handleReceiptRemove() {
  const input = document.getElementById('expense-receipt');
  const preview = document.getElementById('receipt-preview');
  
  input.value = '';
  preview.classList.add('hidden');
}

// ==================== UTILITIES ====================

function formatDate(dateString) {
  if (!dateString) {
    return 'N/A';
  }
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatCategory(category) {
  const categories = {
    flores: 'Flores',
    suministros: 'Suministros',
    transporte: 'Transporte',
    servicios: 'Servicios',
    salarios: 'Salarios',
    alquiler: 'Alquiler',
    otros: 'Otros'
  };
  return categories[category] || category;
}

function formatPaymentMethod(method) {
  const methods = {
    efectivo: 'Efectivo',
    tarjeta: 'Tarjeta',
    transferencia: 'Transferencia',
    cheque: 'Cheque'
  };
  return methods[method] || method;
}

function getCategoryColor(category) {
  const colors = {
    flores: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
    suministros: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    transporte: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    servicios: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    salarios: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    alquiler: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    otros: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  };
  return colors[category] || colors.otros;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function handleLogout() {
  sessionStorage.clear();
  toast.success('Sesión cerrada');
  setTimeout(() => {
    window.location.href = '../../index.html';
  }, 1000);
}

// Export controller to window for onclick handlers
window.expensesController = {
  editExpense,
  deleteExpense
};
