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
  
  // Set type-specific styles
  let bgColor = '';
  let borderColor = '';
  let icon = '';
  
  switch (type) {
    case 'success':
      bgColor = '#22c55e'; // green-500
      borderColor = '#16a34a'; // green-600
      icon = '✓';
      break;
    case 'error':
      bgColor = '#ef4444'; // red-500
      borderColor = '#dc2626'; // red-600
      icon = '✕';
      break;
    case 'warning':
      bgColor = '#f59e0b'; // amber-500 (changed from yellow for better contrast)
      borderColor = '#d97706'; // amber-600
      icon = '⚠';
      break;
    case 'info':
      bgColor = '#3b82f6'; // blue-500
      borderColor = '#2563eb'; // blue-600
      icon = 'ℹ';
      break;
  }

  // Apply inline styles with better sizing and positioning
  toast.style.cssText = `
    position: fixed;
    top: 5rem;
    right: 1.5rem;
    left: auto;
    background-color: ${bgColor};
    color: white;
    padding: 1.25rem 1.75rem;
    border-radius: 0.75rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    gap: 1rem;
    z-index: 99999;
    min-width: 320px;
    max-width: 500px;
    border: 2px solid ${borderColor};
    animation: slideInRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
    font-size: 15px;
    line-height: 1.5;
  `;
  
  // Create the toast content
  const iconSpan = document.createElement('span');
  iconSpan.style.cssText = `
    font-size: 1.75rem;
    font-weight: bold;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
  `;
  iconSpan.textContent = icon;
  
  const messageSpan = document.createElement('span');
  messageSpan.style.cssText = `
    flex: 1;
    font-weight: 500;
  `;
  messageSpan.textContent = escapeHtml(message);
  
  const closeButton = document.createElement('button');
  closeButton.style.cssText = `
    color: white;
    font-weight: bold;
    font-size: 1.5rem;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0 0.5rem;
    opacity: 0.9;
    transition: opacity 0.2s;
    flex-shrink: 0;
    line-height: 1;
  `;
  closeButton.textContent = '×';
  closeButton.onmouseover = () => closeButton.style.opacity = '1';
  closeButton.onmouseout = () => closeButton.style.opacity = '0.9';
  closeButton.onclick = () => toast.remove();
  
  toast.appendChild(iconSpan);
  toast.appendChild(messageSpan);
  toast.appendChild(closeButton);

  // Add to document
  document.body.appendChild(toast);

  // Auto-remove after duration
  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.animation = 'slideOutRight 0.3s ease-in';
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