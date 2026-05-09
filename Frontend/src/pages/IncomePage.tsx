import { useEffect, useState, useMemo, useCallback } from 'react';
import { Plus, Pencil, Trash2, Repeat } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header, PageTitle } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { StatCard } from '@/components/cards/StatCard';
import { IncomeForm } from '@/components/forms/IncomeForm';
import { financialService } from '@/services/financial.service';
import { extractApiError } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { brl, currentMonth, formatDate, formatMonth, monthRangeOptions } from '@/lib/formatters';
import { incomeTypeLabels } from '@/lib/constants';
import type { CreateIncomeRequest, FixedIncome, Income, IncomeSummary, IncomeType } from '@/lib/types';
import { TrendingUp, Calendar } from 'lucide-react';

export function IncomePage() {
  const [month, setMonth] = useState(currentMonth());
  const [filterType, setFilterType] = useState<'All' | IncomeType>('All');
  const [items, setItems] = useState<Income[]>([]);
  const [fixedItems, setFixedItems] = useState<FixedIncome[]>([]);
  const [summary, setSummary] = useState<IncomeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Income | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { success, error: toastError } = useToast();

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      financialService.getIncomesByMonth(month),
      financialService.getIncomeSummary(month),
      financialService.getFixedIncomesForMonth(month)
    ])
      .then(([list, sum, fixed]) => { setItems(list); setSummary(sum); setFixedItems(fixed); })
      .catch(err => toastError(extractApiError(err)))
      .finally(() => setLoading(false));
  }, [month, toastError]);

  useEffect(load, [month]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(
    () => filterType === 'All' ? items : items.filter(i => i.type === filterType),
    [items, filterType]
  );
  const filteredFixed = useMemo(
    () => filterType === 'All' ? fixedItems : fixedItems.filter(i => i.type === filterType),
    [fixedItems, filterType]
  );
  const fixedTotal = useMemo(() => filteredFixed.reduce((s, f) => s + f.amount, 0), [filteredFixed]);
  const totalRow = (summary?.total ?? 0) + fixedTotal;

  const handleSubmit = useCallback(async (data: CreateIncomeRequest) => {
    setSubmitting(true);
    try {
      if (editing) {
        await financialService.updateIncome(editing.id, data);
        success('Receita atualizada!');
      } else {
        await financialService.createIncome(data);
        success('Receita adicionada!');
      }
      setDialogOpen(false);
      setEditing(null);
      load();
    } catch (err) {
      toastError(extractApiError(err));
    } finally {
      setSubmitting(false);
    }
  }, [editing, load, success, toastError]);

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    setSubmitting(true);
    try {
      await financialService.deleteIncome(deleteId);
      success('Receita removida.');
      setDeleteId(null);
      load();
    } catch (err) {
      toastError(extractApiError(err));
    } finally {
      setSubmitting(false);
    }
  }, [deleteId, load, success, toastError]);

  const action = (
    <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
      <Plus className="h-4 w-4" /> Adicionar
    </Button>
  );

  return (
    <>
      <Header title="Receitas" subtitle={formatMonth(month)} action={action} />
      <PageTitle title="Receitas" subtitle={formatMonth(month)} action={action} />

      <div className="flex flex-wrap gap-3 mb-4">
        <CustomSelect 
          value={month} 
          onChange={setMonth} 
          options={monthRangeOptions(12, 12)} 
          className="w-44"
        />
        <CustomSelect 
          value={filterType} 
          onChange={(v) => setFilterType(v as 'All' | IncomeType)} 
          options={[
            { value: 'All', label: 'Todos os tipos' },
            { value: 'Salary', label: 'Salário' },
            { value: 'Freelance', label: 'Freelance' }
          ]} 
          className="w-44"
        />
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard title="Total do Mês" value={totalRow} icon={TrendingUp} comparison={summary.comparisonPercentage} gradient="purple" subtitle="Regulares + fixas" />
          <StatCard title="Fixas no Mês" value={fixedTotal} icon={Repeat} subtitle={`${filteredFixed.length} ${filteredFixed.length === 1 ? 'recorrente' : 'recorrentes'}`} />
          <StatCard title="Média Diária" value={summary.dailyAverage} icon={Calendar} subtitle="Por dia do mês (apenas regulares)" />
        </div>
      )}

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Histórico</CardTitle>
            <CardDescription>
              {filtered.length} regular{filtered.length !== 1 ? 'es' : ''}
              {filteredFixed.length > 0 && <> · {filteredFixed.length} fixa{filteredFixed.length !== 1 ? 's' : ''}</>}
            </CardDescription>
          </div>
          <Link to="/fixed-incomes" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
            Gerenciar fixas →
          </Link>
        </CardHeader>

        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 && filteredFixed.length === 0 ? (
          <EmptyState title="Nenhuma receita" description="Adicione sua primeira receita do mês." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="py-2 pr-3">Data</th>
                  <th className="py-2 pr-3">Descrição</th>
                  <th className="py-2 pr-3">Tipo</th>
                  <th className="py-2 pr-3 text-right">Valor</th>
                  <th className="py-2 w-24"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/40">
                {filteredFixed.map(f => (
                  <tr key={`fixed-${f.id}`} className="bg-purple-50/40">
                    <td className="py-3 pr-3 text-xs text-muted-foreground">{formatMonth(f.startMonth).split(' de ')[0]}</td>
                    <td className="py-3 pr-3 font-medium flex items-center gap-2">
                      {f.description}
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-600/15 text-purple-700 inline-flex items-center gap-1">
                        <Repeat className="h-3 w-3" /> FIXA
                      </span>
                    </td>
                    <td className="py-3 pr-3">
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">{incomeTypeLabels[f.type]}</span>
                    </td>
                    <td className="py-3 pr-3 text-right font-semibold text-emerald-600">{brl(f.amount)}</td>
                    <td className="py-3 flex justify-end">
                      <Link to="/fixed-incomes" className="p-1.5 rounded-lg hover:bg-white/60 text-muted-foreground hover:text-primary" title="Gerenciar fixas">
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {filtered.map(i => (
                  <tr key={i.id} className="hover:bg-white/40 transition">
                    <td className="py-3 pr-3">{formatDate(i.transactionDate)}</td>
                    <td className="py-3 pr-3 font-medium">{i.description}</td>
                    <td className="py-3 pr-3">
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">{incomeTypeLabels[i.type]}</span>
                    </td>
                    <td className="py-3 pr-3 text-right font-semibold text-emerald-600">{brl(i.amount)}</td>
                    <td className="py-3 flex justify-end gap-1">
                      <button onClick={() => { setEditing(i); setDialogOpen(true); }} className="p-1.5 rounded-lg hover:bg-white/60 text-muted-foreground hover:text-primary">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleteId(i.id)} className="p-1.5 rounded-lg hover:bg-white/60 text-muted-foreground hover:text-rose-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditing(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Receita' : 'Nova Receita'}</DialogTitle>
          </DialogHeader>
          <IncomeForm
            initial={editing ?? undefined}
            submitting={submitting}
            onCancel={() => { setDialogOpen(false); setEditing(null); }}
            onSubmit={handleSubmit}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="Remover receita?"
        description="Esta ação não pode ser desfeita."
        confirmLabel="Remover"
        loading={submitting}
        onConfirm={handleDelete}
      />
    </>
  );
}
