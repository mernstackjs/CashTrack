type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

let toastId = 0;
const toasts: Map<string, Toast> = new Map();
const listeners: Set<(toasts: Toast[]) => void> = new Set();

export const toast = {
  success: (message: string, duration = 3000) => {
    return addToast("success", message, duration);
  },
  error: (message: string, duration = 4000) => {
    return addToast("error", message, duration);
  },
  warning: (message: string, duration = 3500) => {
    return addToast("warning", message, duration);
  },
  info: (message: string, duration = 3000) => {
    return addToast("info", message, duration);
  },
  remove: (id: string) => {
    toasts.delete(id);
    notifyListeners();
  },
  subscribe: (listener: (toasts: Toast[]) => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

function addToast(type: ToastType, message: string, duration: number): string {
  const id = `toast-${++toastId}`;
  const newToast: Toast = { id, type, message, duration };

  toasts.set(id, newToast);
  notifyListeners();

  if (duration > 0) {
    setTimeout(() => {
      toasts.delete(id);
      notifyListeners();
    }, duration);
  }

  return id;
}

function notifyListeners() {
  const toastArray = Array.from(toasts.values());
  listeners.forEach((listener) => listener(toastArray));
}

export function getToasts(): Toast[] {
  return Array.from(toasts.values());
}
