import { useEffect, useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, Target, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/cards/StatCard';
import { EvolutionChart } from '@/components/charts/EvolutionChart';
import { DistributionChart } from '@/components/charts/DistributionChart';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { financialService } from '@/services/financial.service';
import { brl, currentMonth, formatDate, formatMonth, monthRangeOptions } from '@/lib/formatters';
import { extractApiError } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { labelFromCategory } from '@/lib/constants';
import type { CategoryDistribution, DashboardSummary, EvolutionPoint } from '@/lib/types';

export function DashboardPage() {
  const [month, setMonth] = useState(currentMonth());
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [evolution, setEvolution] = useState<EvolutionPoint[]>([]);
  const [distribution, setDistribution] = useState<CategoryDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const { error: toastError } = useToast();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      financialService.getDashboard(month),
      financialService.getEvolution(6, month),
      financialService.getDistribution(month)
    ])
      .then(([s, e, d]) => {
        if (cancelled) return;
        setSummary(s);
        setEvolution(e);
        setDistribution(d);
      })
      .catch((err) => !cancelled && toastError(extractApiError(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [month, toastError]);

  return (
    <>
      <Header
        title="Dashboard"
        subtitle={`Visão geral · ${formatMonth(month)}`}
        action={
          <div className="w-44">
            <CustomSelect
              value={month}
              onChange={setMonth}
              options={monthRangeOptions(12, 12)}
            />
          </div>
        }
      />

      {loading ? (
        <LoadingSpinner />
      ) : !summary ? (
        <EmptyState title="Sem dados" description="Não foi possível carregar o dashboard." />
      ) : (
        <>
          {(() => {
            const today = currentMonth();
            const isFuture = month > today;
            const isPast = month < today;
            const balanceTitle = isFuture ? 'Saldo Estimado' : 'Saldo em Conta';
            const balanceSubtitle = isFuture
              ? `Estimativa início de ${formatMonth(month)}`
              : isPast
                ? 'Saldo atual (referência)'
                : 'Disponível para uso';
            const projectionSubtitle = `Saldo estimado fim de ${formatMonth(month)}`;
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard title={balanceTitle} value={summary.currentBalance} icon={Wallet} gradient="purple" subtitle={balanceSubtitle} />
                <StatCard title="Receitas do Mês" value={summary.monthlyIncome} icon={TrendingUp} comparison={summary.incomeComparison} />
                <StatCard title="Despesas do Mês" value={summary.monthlyExpense} icon={TrendingDown} comparison={summary.expenseComparison} comparisonInverted />
                <StatCard title="Projeção" value={summary.projectedBalance} icon={Target} gradient="mix" subtitle={projectionSubtitle} />
              </div>
            );
          })()}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div>
                  <CardTitle>Evolução Financeira</CardTitle>
                  <CardDescription>Últimos 6 meses</CardDescription>
                </div>
              </CardHeader>
              <EvolutionChart data={evolution} />
            </Card>
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Distribuição</CardTitle>
                  <CardDescription>Despesas por categoria</CardDescription>
                </div>
              </CardHeader>
              <DistributionChart data={distribution} />
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Transações Recentes</CardTitle>
                <CardDescription>Últimas 5 movimentações</CardDescription>
              </div>
              <Link to="/monthly-view" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                Ver todas <ArrowRight className="h-4 w-4" />
              </Link>
            </CardHeader>

            {summary.recentTransactions.length === 0 ? (
              <EmptyState title="Nenhuma transação" description="Adicione receitas ou despesas para ver o histórico." />
            ) : (
              <ul className="divide-y divide-white/40">
                {summary.recentTransactions.map(tx => (
                  <li key={tx.id} className="flex items-center justify-between py-3">
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">{tx.description}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(tx.transactionDate)} · {labelFromCategory(tx.category)}
                      </div>
                    </div>
                    <span className={`text-sm font-semibold whitespace-nowrap ${tx.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {tx.type === 'Income' ? '+' : '−'} {brl(tx.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </>
  );
}
