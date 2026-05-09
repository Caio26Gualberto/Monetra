import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb } from 'lucide-react';
import { Header, PageTitle } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ProjectionChart } from '@/components/charts/ProjectionChart';
import { financialService } from '@/services/financial.service';
import { extractApiError } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { brl, formatMonth, percent } from '@/lib/formatters';
import type { Projection, ProjectionAnalysis } from '@/lib/types';
import { cn } from '@/lib/utils';

export function ProjectionsPage() {
  const [projections, setProjections] = useState<Projection[]>([]);
  const [analysis, setAnalysis] = useState<ProjectionAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const { error: toastError } = useToast();

  useEffect(() => {
    setLoading(true);
    Promise.all([financialService.getProjections(4), financialService.getProjectionAnalysis()])
      .then(([p, a]) => { setProjections(p); setAnalysis(a); })
      .catch(err => toastError(extractApiError(err)))
      .finally(() => setLoading(false));
  }, [toastError]);

  return (
    <>
      <Header title="Projeções" subtitle="Próximos 4 meses" />
      <PageTitle title="Projeções" subtitle="Próximos 4 meses" />

      {loading ? <LoadingSpinner /> : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {projections.map((p) => {
              const positive = p.projectedBalance >= 0;
              const trendUp = p.trend >= 0;
              return (
                <div key={p.month} className={cn(
                  'glass p-5 animate-fade-in',
                  !positive && 'border-rose-300/60 bg-rose-50/40'
                )}>
                  <div className="text-xs text-muted-foreground">{formatMonth(p.month)}</div>
                  <div className={cn('text-2xl font-bold mt-1', positive ? 'text-foreground' : 'text-rose-600')}>
                    {brl(p.projectedBalance)}
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs">
                    {trendUp ? (
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5 text-rose-600" />
                    )}
                    <span className={trendUp ? 'text-emerald-600' : 'text-rose-600'}>
                      {percent(p.trend)}
                    </span>
                  </div>
                  <div className="border-t border-white/40 mt-3 pt-3 text-xs space-y-1">
                    <div className="flex justify-between"><span className="text-muted-foreground">Receita</span><span className="text-emerald-600 font-medium">{brl(p.projectedIncome)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Despesa</span><span className="text-rose-600 font-medium">{brl(p.projectedExpense)}</span></div>
                  </div>
                </div>
              );
            })}
          </div>

          <Card className="mb-4">
            <CardHeader>
              <div>
                <CardTitle>Evolução Projetada</CardTitle>
                <CardDescription>Saldo, receita e despesa nos próximos meses</CardDescription>
              </div>
            </CardHeader>
            <ProjectionChart data={projections} />
          </Card>

          {analysis && (
            <Card>
              <CardHeader>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {analysis.hasNegativeProjection ? (
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    ) : (
                      <Lightbulb className="h-5 w-5 text-primary" />
                    )}
                    Análise & Sugestões
                  </CardTitle>
                  <CardDescription>{analysis.description}</CardDescription>
                </div>
              </CardHeader>
              <ul className="space-y-2">
                {analysis.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/85">
                    <Lightbulb className="h-4 w-4 mt-0.5 text-primary shrink-0" /> {s}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}
    </>
  );
}
