import apiClient from '../config/api';

export interface Expense {
  id?: number;
  dayNumber: number;
  expenseDate: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  currency: Currency;
  receiptUrl?: string;
  paymentMethod?: string;
  vendor?: string;
  location?: string;
  notes?: string;
  reimbursable?: boolean;
  reimbursed?: boolean;
  reimbursementReference?: string;
  status: ExpenseStatus;
  tripId?: number;
  activityId?: number;
  placeId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export enum ExpenseCategory {
  ACCOMMODATION = 'ACCOMMODATION',
  FOOD = 'FOOD',
  TRANSPORT = 'TRANSPORT',
  ACTIVITIES = 'ACTIVITIES',
  SHOPPING = 'SHOPPING',
  ENTERTAINMENT = 'ENTERTAINMENT',
  HEALTH = 'HEALTH',
  INSURANCE = 'INSURANCE',
  VISAS = 'VISAS',
  FEES = 'FEES',
  TIPS = 'TIPS',
  OTHER = 'OTHER'
}

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  JPY = 'JPY',
  CAD = 'CAD',
  AUD = 'AUD',
  CHF = 'CHF',
  CNY = 'CNY',
  INR = 'INR',
  BRL = 'BRL',
  MXN = 'MXN',
  KRW = 'KRW',
  RUB = 'RUB',
  ZAR = 'ZAR',
  SEK = 'SEK',
  NOK = 'NOK',
  DKK = 'DKK',
  PLN = 'PLN',
  CZK = 'CZK',
  HUF = 'HUF'
}

export enum ExpenseStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export const expenseService = {
  // Get all expenses for a trip
  async getExpensesByTripId(tripId: number): Promise<Expense[]> {
    const response = await apiClient.get(`/expenses/trip/${tripId}`);
    return response.data;
  },

  // Get expense by ID
  async getExpenseById(id: number): Promise<Expense> {
    const response = await apiClient.get(`/expenses/${id}`);
    return response.data;
  },

  // Create a new expense
  async createExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
    const response = await apiClient.post('/expenses', expense);
    return response.data;
  },

  // Update expense
  async updateExpense(id: number, expense: Partial<Expense>): Promise<Expense> {
    const response = await apiClient.put(`/expenses/${id}`, expense);
    return response.data;
  },

  // Delete expense
  async deleteExpense(id: number): Promise<void> {
    await apiClient.delete(`/expenses/${id}`);
  },

  // Get total expenses for a trip
  async getTotalExpensesByTripId(tripId: number): Promise<number> {
    const response = await apiClient.get(`/expenses/trip/${tripId}/total`);
    return response.data;
  },

  // Get expenses by trip and category
  async getExpensesByTripAndCategory(tripId: number, category: ExpenseCategory): Promise<Expense[]> {
    const response = await apiClient.get(`/expenses/trip/${tripId}/category/${category}`);
    return response.data;
  },

  // Get expenses by trip and day number
  async getExpensesByTripAndDay(tripId: number, dayNumber: number): Promise<Expense[]> {
    const response = await apiClient.get(`/expenses/trip/${tripId}/day/${dayNumber}`);
    return response.data;
  }
};
