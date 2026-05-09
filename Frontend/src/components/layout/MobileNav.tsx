import { NavLink } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, TrendingDown, CreditCard, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { to: '/dashboard', label: 'Início', icon: LayoutDashboard },
  { to: '/income', label: 'Receitas', icon: TrendingUp },
  { to: '/expenses', label: 'Despesas', icon: TrendingDown },
  { to: '/credit-card', label: 'Cartão', icon: CreditCard },
  { to: '/monthly-view', label: 'Mais', icon: MoreHorizontal }
];

export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 glass-strong border-t border-white/40 px-2 py-2 flex justify-around">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[11px] transition flex-1',
              isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
            )
          }
        >
          <Icon className="h-5 w-5" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
