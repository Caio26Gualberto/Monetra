import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { brl, percent } from '@/lib/formatters';

interface Props {
  title: string;
  value: number;
  icon: LucideIcon;
  comparison?: number;
  comparisonInverted?: boolean;
  gradient?: 'purple' | 'pink' | 'mix' | 'plain';
  subtitle?: string;
}

export function StatCard({ title, value, icon: Icon, comparison, comparisonInverted, gradient = 'plain', subtitle }: Props) {
  const gradClass = {
    purple: 'gradient-purple text-white',
    pink: 'gradient-pink text-white',
    mix: 'gradient-mix text-white',
    plain: 'glass'
  }[gradient];

  const isWhite = gradient !== 'plain';
  const positive = comparison !== undefined ? (comparisonInverted ? comparison < 0 : comparison >= 0) : null;

  return (
    <div className={cn(gradClass, 'rounded-2xl p-5 animate-fade-in glass-hover')}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className={cn('text-xs font-medium', isWhite ? 'text-white/85' : 'text-muted-foreground')}>{title}</div>
          <div className={cn('text-2xl font-bold mt-1', isWhite ? 'text-white' : 'text-foreground')}>
            {brl(value)}
          </div>
          {subtitle && (
            <div className={cn('text-[11px] mt-1', isWhite ? 'text-white/80' : 'text-muted-foreground')}>{subtitle}</div>
          )}
        </div>
        <div className={cn('p-2.5 rounded-xl shrink-0', isWhite ? 'bg-white/20' : 'bg-white/60')}>
          <Icon className={cn('h-5 w-5', isWhite ? 'text-white' : 'text-primary')} />
        </div>
      </div>
      {comparison !== undefined && (
        <div className="mt-3 flex items-center gap-1 text-xs font-medium">
          {positive ? (
            <ArrowUpRight className={cn('h-3.5 w-3.5', isWhite ? 'text-white' : 'text-emerald-600')} />
          ) : (
            <ArrowDownRight className={cn('h-3.5 w-3.5', isWhite ? 'text-white' : 'text-rose-600')} />
          )}
          <span className={cn(isWhite ? 'text-white/95' : positive ? 'text-emerald-600' : 'text-rose-600')}>
            {percent(comparison)}
          </span>
          <span className={cn(isWhite ? 'text-white/75' : 'text-muted-foreground')}>vs mês anterior</span>
        </div>
      )}
    </div>
  );
}
