import { apiClient } from '@/lib/api';
import type {
  Account, AccountBalanceHistory,
  CategoryDistribution, CategoryTotal, CreditCard, CreditCardInvoice, CreditCardPurchase,
  CreditCardSummary, DashboardSummary, EvolutionPoint, Expense, ExpenseSummary,
  FixedExpense, FixedIncome,
  Income, IncomeSummary, MonthlyOverview, Projection, ProjectionAnalysis, Transaction,
  CreateIncomeRequest, CreateExpenseRequest, CreateCreditCardRequest, CreatePurchaseRequest,
  CreateFixedExpenseRequest, CreateFixedIncomeRequest
} from '@/lib/types';

export const financialService = {
  // Account
  getAccount: () => apiClient.get<Account>('/api/financial/account').then(r => r.data),
  updateBalance: (newBalance: number, notes?: string) =>
    apiClient.put('/api/financial/account/balance', { newBalance, notes }),
  getAccountHistory: () =>
    apiClient.get<AccountBalanceHistory[]>('/api/financial/account/history').then(r => r.data),

  // Income
  getIncomes: () => apiClient.get<Income[]>('/api/financial/income').then(r => r.data),
  getIncomesByMonth: (month: string) =>
    apiClient.get<Income[]>(`/api/financial/income/month/${month}`).then(r => r.data),
  createIncome: (data: CreateIncomeRequest) =>
    apiClient.post<Income>('/api/financial/income', data).then(r => r.data),
  updateIncome: (id: string, data: CreateIncomeRequest) =>
    apiClient.put(`/api/financial/income/${id}`, data),
  deleteIncome: (id: string) => apiClient.delete(`/api/financial/income/${id}`),
  getIncomeSummary: (month: string) =>
    apiClient.get<IncomeSummary>(`/api/financial/income/summary/${month}`).then(r => r.data),

  // Expense
  getExpenses: () => apiClient.get<Expense[]>('/api/financial/expense').then(r => r.data),
  getExpensesByMonth: (month: string) =>
    apiClient.get<Expense[]>(`/api/financial/expense/month/${month}`).then(r => r.data),
  createExpense: (data: CreateExpenseRequest) =>
    apiClient.post<Expense>('/api/financial/expense', data).then(r => r.data),
  updateExpense: (id: string, data: CreateExpenseRequest) =>
    apiClient.put(`/api/financial/expense/${id}`, data),
  deleteExpense: (id: string) => apiClient.delete(`/api/financial/expense/${id}`),
  getExpenseSummary: (month: string) =>
    apiClient.get<ExpenseSummary>(`/api/financial/expense/summary/${month}`).then(r => r.data),
  getExpenseByCategory: (month: string) =>
    apiClient.get<CategoryTotal[]>(`/api/financial/expense/by-category/${month}`).then(r => r.data),

  // Fixed Expense
  getFixedExpenses: () =>
    apiClient.get<FixedExpense[]>('/api/financial/fixed-expense').then(r => r.data),
  getFixedExpensesForMonth: (month: string) =>
    apiClient.get<FixedExpense[]>(`/api/financial/fixed-expense/month/${month}`).then(r => r.data),
  createFixedExpense: (data: CreateFixedExpenseRequest) =>
    apiClient.post<FixedExpense>('/api/financial/fixed-expense', data).then(r => r.data),
  updateFixedExpense: (id: string, data: CreateFixedExpenseRequest) =>
    apiClient.put(`/api/financial/fixed-expense/${id}`, data),
  deleteFixedExpense: (id: string) =>
    apiClient.delete(`/api/financial/fixed-expense/${id}`),

  // Fixed Income
  getFixedIncomes: () =>
    apiClient.get<FixedIncome[]>('/api/financial/fixed-income').then(r => r.data),
  getFixedIncomesForMonth: (month: string) =>
    apiClient.get<FixedIncome[]>(`/api/financial/fixed-income/month/${month}`).then(r => r.data),
  createFixedIncome: (data: CreateFixedIncomeRequest) =>
    apiClient.post<FixedIncome>('/api/financial/fixed-income', data).then(r => r.data),
  updateFixedIncome: (id: string, data: CreateFixedIncomeRequest) =>
    apiClient.put(`/api/financial/fixed-income/${id}`, data),
  deleteFixedIncome: (id: string) =>
    apiClient.delete(`/api/financial/fixed-income/${id}`),

  // Credit Card
  getCreditCards: () => apiClient.get<CreditCard[]>('/api/financial/creditcard').then(r => r.data),
  getCreditCard: (id: string) =>
    apiClient.get<CreditCard>(`/api/financial/creditcard/${id}`).then(r => r.data),
  createCreditCard: (data: CreateCreditCardRequest) =>
    apiClient.post<CreditCard>('/api/financial/creditcard', data).then(r => r.data),
  updateCreditCard: (id: string, data: CreateCreditCardRequest) =>
    apiClient.put(`/api/financial/creditcard/${id}`, data),
  deleteCreditCard: (id: string) => apiClient.delete(`/api/financial/creditcard/${id}`),
  getCardSummary: (month: string) =>
    apiClient.get<CreditCardSummary>(`/api/financial/creditcard/summary/${month}`).then(r => r.data),

  // Invoices
  getInvoice: (cardId: string, month: string) =>
    apiClient.get<CreditCardInvoice>(`/api/financial/creditcard/${cardId}/invoices/${month}`).then(r => r.data),
  payInvoice: (cardId: string, month: string) =>
    apiClient.post(`/api/financial/creditcard/${cardId}/invoices/${month}/pay`),
  unpayInvoice: (cardId: string, month: string) =>
    apiClient.delete(`/api/financial/creditcard/${cardId}/invoices/${month}/pay`),

  // Purchases
  getPurchases: (cardId: string) =>
    apiClient.get<CreditCardPurchase[]>(`/api/financial/creditcard/${cardId}/purchases`).then(r => r.data),
  createPurchase: (cardId: string, data: CreatePurchaseRequest) =>
    apiClient.post<CreditCardPurchase>(`/api/financial/creditcard/${cardId}/purchases`, data).then(r => r.data),
  updatePurchase: (purchaseId: string, data: CreatePurchaseRequest) =>
    apiClient.put(`/api/financial/creditcard/purchases/${purchaseId}`, data),
  deletePurchase: (purchaseId: string) =>
    apiClient.delete(`/api/financial/creditcard/purchases/${purchaseId}`),
  getPendingInstallments: () =>
    apiClient.get<CreditCardPurchase[]>('/api/financial/creditcard/pending-installments').then(r => r.data),

  // Dashboard
  getDashboard: (month?: string) =>
    apiClient.get<DashboardSummary>('/api/financial/dashboard/summary', { params: { month } }).then(r => r.data),
  getEvolution: (months: number) =>
    apiClient.get<EvolutionPoint[]>(`/api/financial/dashboard/evolution/${months}`).then(r => r.data),
  getDistribution: (month: string) =>
    apiClient.get<CategoryDistribution[]>(`/api/financial/dashboard/distribution/${month}`).then(r => r.data),
  getRecentTransactions: () =>
    apiClient.get<Transaction[]>('/api/financial/dashboard/recent-transactions').then(r => r.data),

  // Monthly + projections
  getMonthlyView: (month: string, params?: { type?: string; category?: string; sort?: string }) =>
    apiClient.get<MonthlyOverview>(`/api/financial/transactions/month/${month}`, { params }).then(r => r.data),
  searchTransactions: (query: string, month?: string) =>
    apiClient.get<Transaction[]>('/api/financial/transactions/search', { params: { query, month } }).then(r => r.data),
  getProjections: (months = 4) =>
    apiClient.get<Projection[]>(`/api/financial/projections/${months}`).then(r => r.data),
  getProjectionAnalysis: () =>
    apiClient.get<ProjectionAnalysis>('/api/financial/projections/analysis').then(r => r.data)
};
