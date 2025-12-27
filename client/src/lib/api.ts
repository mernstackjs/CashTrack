import axios, { AxiosError } from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Custom error class
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    const message = "Request failed. Please try again.";
    return Promise.reject(new ApiError(0, message, error));
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    const status = error.response?.status || 0;
    const data = error.response?.data;
    let message = data?.error || data?.message || "An error occurred";

    // Handle specific status codes
    switch (status) {
      case 400:
        message = data?.error || "Invalid request. Please check your input.";
        break;
      case 401:
        // Handle unauthorized
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        message = "Session expired. Please log in again.";
        // Optionally redirect to login
        window.location.href = "/login";
        break;
      case 403:
        message = "You do not have permission to perform this action.";
        break;
      case 404:
        message = "Resource not found.";
        break;
      case 409:
        message = data?.error || "This resource already exists.";
        break;
      case 422:
        message = data?.error || "Validation failed. Please check your input.";
        break;
      case 500:
        message = "Server error. Please try again later.";
        break;
      case 503:
        message = "Service unavailable. Please try again later.";
        break;
      case 0:
        message = "Network error. Please check your connection.";
        break;
      default:
        message = message || "An unexpected error occurred.";
    }

    return Promise.reject(new ApiError(status, message, data));
  }
);

// Types
export interface Budget {
  id: string;
  name: string;
  amount: number;
  category: string;
  period: "weekly" | "monthly" | "yearly";
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  budgetId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetStats {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  percentageUsed: number;
  expensesByCategory: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

// API functions
export const budgetApi = {
  getAll: () => api.get<Budget[]>("/budgets"),
  getById: (id: string) => api.get<Budget>(`/budgets/${id}`),
  create: (data: Omit<Budget, "id" | "createdAt" | "updatedAt">) =>
    api.post<Budget>("/budgets", data),
  update: (id: string, data: Partial<Budget>) =>
    api.put<Budget>(`/budgets/${id}`, data),
  delete: (id: string) => api.delete(`/budgets/${id}`),
};

export const expenseApi = {
  getAll: (params?: {
    budgetId?: string;
    startDate?: string;
    endDate?: string;
  }) => api.get<Expense[]>("/expenses", { params }),
  getById: (id: string) => api.get<Expense>(`/expenses/${id}`),
  create: (data: Omit<Expense, "id" | "createdAt" | "updatedAt">) =>
    api.post<Expense>("/expenses", data),
  update: (id: string, data: Partial<Expense>) =>
    api.put<Expense>(`/expenses/${id}`, data),
  delete: (id: string) => api.delete(`/expenses/${id}`),
};

export const statsApi = {
  getStats: (params?: { startDate?: string; endDate?: string }) =>
    api.get<BudgetStats>("/stats", { params }),
};

export default api;
