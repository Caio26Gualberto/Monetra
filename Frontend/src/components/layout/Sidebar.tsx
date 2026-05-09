import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, TrendingUp, TrendingDown, CreditCard, Calendar,
  LineChart, Wallet, LogOut, Sparkles, Repeat
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const items = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/income', label: 'Receitas', icon: TrendingUp },
  { to: '/fixed-incomes', label: 'Receitas Fixas', icon: Repeat },
  { to: '/expenses', label: 'Despesas', icon: TrendingDown },
  { to: '/fixed-expenses', label: 'Despesas Fixas', icon: Repeat },
  { to: '/credit-card', label: 'Cartão de Crédito', icon: CreditCard },
  { to: '/monthly-view', label: 'Visão Mensal', icon: Calendar },
  { to: '/projections', label: 'Projeções', icon: LineChart },
  { to: '/account-balance', label: 'Saldo em Conta', icon: Wallet }
];

export function Sidebar() {
  const { user, logout } = useAuth();
  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 h-screen sticky top-0 p-4 gap-4">
      <div className="flex items-center gap-3 px-2 py-3">
        <div className="h-10 w-10 rounded-xl gradient-mix flex items-center justify-center text-white shadow-lg shadow-primary/30">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <div className="font-bold text-gradient text-lg leading-none">Monetra</div>
          <div className="text-[11px] text-muted-foreground mt-1">Finanças pessoais</div>
        </div>
      </div>

      <nav className="glass p-2 flex-1 flex flex-col gap-1">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition',
                isActive
                  ? 'gradient-mix text-white shadow-md shadow-primary/25'
                  : 'text-foreground/80 hover:bg-white/60'
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="glass p-3 flex items-center gap-3">
        <div className="h-9 w-9 rounded-full gradient-purple text-white flex items-center justify-center text-sm font-semibold">
          {user?.firstName?.[0]?.toUpperCase()}
          {user?.lastName?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</div>
          <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
        </div>
        <button
          onClick={() => logout()}
          aria-label="Sair"
          className="p-2 rounded-lg hover:bg-white/60 text-muted-foreground hover:text-rose-600 transition"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
