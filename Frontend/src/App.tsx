import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicOnlyRoute } from '@/components/common/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { IncomePage } from '@/pages/IncomePage';
import { FixedIncomesPage } from '@/pages/FixedIncomesPage';
import { ExpensesPage } from '@/pages/ExpensesPage';
import { FixedExpensesPage } from '@/pages/FixedExpensesPage';
import { CreditCardPage } from '@/pages/CreditCardPage';
import { MonthlyViewPage } from '@/pages/MonthlyViewPage';
import { ProjectionsPage } from '@/pages/ProjectionsPage';
import { AccountBalancePage } from '@/pages/AccountBalancePage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/income" element={<IncomePage />} />
        <Route path="/fixed-incomes" element={<FixedIncomesPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/fixed-expenses" element={<FixedExpensesPage />} />
        <Route path="/credit-card" element={<CreditCardPage />} />
        <Route path="/monthly-view" element={<MonthlyViewPage />} />
        <Route path="/projections" element={<ProjectionsPage />} />
        <Route path="/account-balance" element={<AccountBalancePage />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
