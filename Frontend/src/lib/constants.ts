import type { ExpenseCategory, IncomeType, PaymentMethod } from './types';

export const incomeTypeLabels: Record<IncomeType, string> = {
  Salary: 'Salário',
  Freelance: 'Freelance'
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  Debit: 'Débito',
  Pix: 'PIX'
};

export const expenseCategoryLabels: Record<ExpenseCategory, string> = {
  Food: 'Alimentação',
  Transport: 'Transporte',
  Entertainment: 'Lazer',
  Health: 'Saúde',
  Shopping: 'Compras',
  Utilities: 'Utilidades',
  Other: 'Outros'
};

export const expenseCategoryColors: Record<ExpenseCategory, string> = {
  Food: '#F59E0B',
  Transport: '#3B82F6',
  Entertainment: '#A78BFA',
  Health: '#10B981',
  Shopping: '#EC4899',
  Utilities: '#06B6D4',
  Other: '#6B7280'
};

export const expenseCategoryList: ExpenseCategory[] = [
  'Food', 'Transport', 'Entertainment', 'Health', 'Shopping', 'Utilities', 'Other'
];

export const incomeTypeList: IncomeType[] = ['Salary', 'Freelance'];

export const paymentMethodList: PaymentMethod[] = ['Debit', 'Pix'];

export const labelFromCategory = (key: string) =>
  expenseCategoryLabels[key as ExpenseCategory] ?? incomeTypeLabels[key as IncomeType] ?? key;
