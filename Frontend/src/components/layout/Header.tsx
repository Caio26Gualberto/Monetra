import { Sparkles, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function Header({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  const { user, logout } = useAuth();
  return (
    <header className="flex items-center justify-between gap-4 mb-6 animate-fade-in">
      <div className="md:hidden flex items-center gap-2">
        <div className="h-9 w-9 rounded-xl gradient-mix flex items-center justify-center text-white">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="font-bold text-gradient text-lg leading-none">Monetra</div>
      </div>
      <div className="hidden md:block">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {action}
        <button
          onClick={() => logout()}
          aria-label="Sair"
          className="md:hidden p-2 rounded-lg bg-white/60 hover:bg-white/80 transition"
        >
          <LogOut className="h-4 w-4 text-rose-500" />
        </button>
        <div className="hidden md:flex items-center gap-2 glass px-3 py-2">
          <div className="h-8 w-8 rounded-full gradient-purple text-white flex items-center justify-center text-xs font-semibold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="text-sm leading-tight">
            <div className="font-medium">Olá, {user?.firstName}!</div>
            <div className="text-[11px] text-muted-foreground">Bem-vindo de volta</div>
          </div>
        </div>
      </div>
    </header>
  );
}

export function PageTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="md:hidden flex items-end justify-between gap-3 mb-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
