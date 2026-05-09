import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import type { EvolutionPoint } from '@/lib/types';
import { brl, formatMonth } from '@/lib/formatters';

export function EvolutionChart({ data }: { data: EvolutionPoint[] }) {
  const formatted = data.map(d => ({ ...d, label: formatMonth(d.month).slice(0, 3) }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={formatted} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
        <YAxis tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.5)', backdropFilter: 'blur(10px)', background: 'rgba(255,255,255,0.9)' }}
          formatter={(v: number) => brl(v)}
          labelFormatter={(l) => `Mês: ${l}`}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="income" name="Receitas" stroke="#7C3AED" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        <Line type="monotone" dataKey="expense" name="Despesas" stroke="#EC4899" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
