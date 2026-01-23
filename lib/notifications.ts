export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastConfig {
  message: string;
  type: ToastType;
  duration?: number;
}

/**
 * Shows a toast notification
 * @param message - The message to display
 * @param type - Type of toast (success, error, info, warning)
 * @param duration - How long to show in ms (default: 3000)
 */
function showToast(message: string, type: ToastType, duration: number = 3000): void {
  // Remove any existing toast
  const existingToast = document.getElementById('inkora-toast');
  if (existingToast) {
    existingToast.remove();
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.id = 'inkora-toast';
  toast.className = 'inkora-toast';
  
  // Set type-specific styles
  let bgColor = '';
  let icon = '';
  
  switch (type) {
    case 'success':
      bgColor = 'bg-green-500';
      icon = '✓';
      break;
    case 'error':
      bgColor = 'bg-red-500';
      icon = '✕';
      break;
    case 'warning':
      bgColor = 'bg-yellow-500';
      icon = '⚠';
      break;
    case 'info':
      bgColor = 'bg-blue-500';
      icon = 'ℹ';
      break;
  }

  toast.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-slide-in max-w-md`;
  
  toast.innerHTML = `
    <span class="text-xl font-bold">${icon}</span>
    <span class="flex-1">${escapeHtml(message)}</span>
    <button class="text-white hover:text-gray-200 font-bold text-xl" onclick="this.parentElement.remove()">×</button>
  `;

  // Add to document
  document.body.appendChild(toast);

  // Auto-remove after duration
  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.add('animate-slide-out');
      setTimeout(() => toast.remove(), 300);
    }
  }, duration);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Export convenience functions
export const toast = {
  success: (message: string, duration?: number) => showToast(message, 'success', duration),
  error: (message: string, duration?: number) => showToast(message, 'error', duration),
  info: (message: string, duration?: number) => showToast(message, 'info', duration),
  warning: (message: string, duration?: number) => showToast(message, 'warning', duration),
};

// Type guard for error objects
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}