export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface Account {
  id: string;
  currentBalance: number;
  updatedAt: string;
}

export interface AccountBalanceHistory {
  id: string;
  previousBalance: number;
  newBalance: number;
  notes?: string | null;
  createdAt: string;
}

export type IncomeType = 'Salary' | 'Freelance';

export interface Income {
  id: string;
  type: IncomeType;
  amount: number;
  description: string;
  transactionDate: string;
}

export interface CreateIncomeRequest {
  type: IncomeType;
  amount: number;
  description: string;
  transactionDate: string;
}

export interface IncomeSummary {
  month: string;
  total: number;
  salaryTotal: number;
  freelanceTotal: number;
  previousMonthTotal: number;
  comparisonPercentage: number;
  dailyAverage: number;
}

export type ExpenseCategory =
  | 'Food' | 'Transport' | 'Entertainment' | 'Health' | 'Shopping' | 'Utilities' | 'Other';

export type PaymentMethod = 'Debit' | 'Pix';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  paymentMethod: PaymentMethod;
  description: string;
  transactionDate: string;
}

export interface CreateExpenseRequest {
  category: ExpenseCategory;
  amount: number;
  paymentMethod: PaymentMethod;
  description: string;
  transactionDate: string;
}

export interface CategoryTotal {
  category: string;
  total: number;
  percentage: number;
}

export interface ExpenseSummary {
  month: string;
  total: number;
  previousMonthTotal: number;
  comparisonPercentage: number;
  byCategory: CategoryTotal[];
}

export interface CreditCard {
  id: string;
  cardName: string;
  closingDay: number;
  dueDay: number;
}

export interface CreateCreditCardRequest {
  cardName: string;
  closingDay: number;
  dueDay: number;
}

export interface CreditCardPurchase {
  id: string;
  creditCardId: string;
  description: string;
  amount: number;
  totalInstallments: number;
  currentInstallment: number;
  installmentValue: number;
  purchaseDate: string;
  firstInvoiceMonth: string;
}

export interface CreatePurchaseRequest {
  description: string;
  amount: number;
  totalInstallments: number;
  currentInstallment: number;
  purchaseDate: string;
}

export interface InvoiceLine {
  purchaseId: string;
  description: string;
  installmentNumber: number;
  totalInstallments: number;
  installmentValue: number;
  purchaseDate: string;
}

export interface CreditCardInvoice {
  creditCardId: string;
  cardName: string;
  month: string;
  dueDate: string;
  totalAmount: number;
  isPaid: boolean;
  lines: InvoiceLine[];
}

export interface CreditCardSummary {
  month: string;
  totalAmount: number;
  cardCount: number;
  pendingInstallmentsTotal: number;
  pendingInstallmentsCount: number;
}

export interface Transaction {
  id: string;
  type: 'Income' | 'Expense';
  description: string;
  category: string;
  amount: number;
  transactionDate: string;
}

export interface DashboardSummary {
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  projectedBalance: number;
  incomeComparison: number;
  expenseComparison: number;
  recentTransactions: Transaction[];
}

export interface EvolutionPoint {
  month: string;
  income: number;
  expense: number;
}

export interface CategoryDistribution {
  category: string;
  total: number;
  percentage: number;
}

export interface Projection {
  month: string;
  projectedIncome: number;
  projectedExpense: number;
  projectedBalance: number;
  trend: number;
}

export interface ProjectionAnalysis {
  trend: string;
  description: string;
  hasNegativeProjection: boolean;
  suggestions: string[];
}

export interface MonthlyOverview {
  month: string;
  incomeTotal: number;
  expenseTotal: number;
  balance: number;
  incomes: Transaction[];
  expenses: Transaction[];
}
