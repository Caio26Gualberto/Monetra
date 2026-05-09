import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { CategoryDistribution } from '@/lib/types';
import { brl } from '@/lib/formatters';
import { expenseCategoryColors, expenseCategoryLabels } from '@/lib/constants';
import type { ExpenseCategory } from '@/lib/types';

export function DistributionChart({ data }: { data: CategoryDistribution[] }) {
  const formatted = data.map(d => ({
    ...d,
    label: expenseCategoryLabels[d.category as ExpenseCategory] ?? d.category
  }));
  if (formatted.length === 0) {
    return <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">Sem despesas neste período.</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={formatted} dataKey="total" nameKey="label" innerRadius={60} outerRadius={100} paddingAngle={2}>
          {formatted.map((d, i) => (
            <Cell key={i} fill={expenseCategoryColors[d.category as ExpenseCategory] ?? '#6B7280'} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.9)' }}
          formatter={(v: number) => brl(v)}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
