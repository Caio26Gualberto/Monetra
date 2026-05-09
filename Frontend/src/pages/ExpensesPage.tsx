import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, TrendingDown } from 'lucide-react';
import { Header, PageTitle } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { StatCard } from '@/components/cards/StatCard';
import { ExpenseForm } from '@/components/forms/ExpenseForm';
import { financialService } from '@/services/financial.service';
import { extractApiError } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { brl, currentMonth, formatDate, formatMonth, monthOptions } from '@/lib/formatters';
import {
  expenseCategoryColors, expenseCategoryLabels, expenseCategoryList, paymentMethodLabels, paymentMethodList
} from '@/lib/constants';
import type { CreateExpenseRequest, Expense, ExpenseCategory, ExpenseSummary, PaymentMethod } from '@/lib/types';

export function ExpensesPage() {
  const [month, setMonth] = useState(currentMonth());
  const [filterCategory, setFilterCategory] = useState<'All' | ExpenseCategory>('All');
  const [filterMethod, setFilterMethod] = useState<'All' | PaymentMethod>('All');
  const [items, setItems] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { success, error: toastError } = useToast();

  const load = () => {
    setLoading(true);
    Promise.all([
      financialService.getExpensesByMonth(month),
      financialService.getExpenseSummary(month)
    ])
      .then(([list, sum]) => { setItems(list); setSummary(sum); })
      .catch(err => toastError(extractApiError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [month]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = items
    .filter(e => filterCategory === 'All' || e.category === filterCategory)
    .filter(e => filterMethod === 'All' || e.paymentMethod === filterMethod);

  const handleSubmit = async (data: CreateExpenseRequest) => {
    setSubmitting(true);
    try {
      if (editing) {
        await financialService.updateExpense(editing.id, data);
        success('Despesa atualizada!');
      } else {
        await financialService.createExpense(data);
        success('Despesa adicionada!');
      }
      setDialogOpen(false);
      setEditing(null);
      load();
    } catch (err) { toastError(extractApiError(err)); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSubmitting(true);
    try {
      await financialService.deleteExpense(deleteId);
      success('Despesa removida.');
      setDeleteId(null);
      load();
    } catch (err) { toastError(extractApiError(err)); }
    finally { setSubmitting(false); }
  };

  const action = (
    <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
      <Plus className="h-4 w-4" /> Adicionar
    </Button>
  );

  return (
    <>
      <Header title="Despesas" subtitle={formatMonth(month)} action={action} />
      <PageTitle title="Despesas" subtitle={formatMonth(month)} action={action} />

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="w-44">
          <CustomSelect value={month} onChange={setMonth} options={monthOptions(12)} />
        </div>
        <div className="w-44">
          <CustomSelect
            value={filterCategory}
            onChange={(v) => setFilterCategory(v as 'All' | ExpenseCategory)}
            options={[
              { value: 'All', label: 'Todas categorias' },
              ...expenseCategoryList.map(c => ({ value: c, label: expenseCategoryLabels[c] }))
            ]}
          />
        </div>
        <div className="w-44">
          <CustomSelect
            value={filterMethod}
            onChange={(v) => setFilterMethod(v as 'All' | PaymentMethod)}
            options={[
              { value: 'All', label: 'Todos métodos' },
              ...paymentMethodList.map(m => ({ value: m, label: paymentMethodLabels[m] }))
            ]}
          />
        </div>
      </div>

      {summary && (
        <div className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <StatCard title="Total do Mês" value={summary.total} icon={TrendingDown} comparison={summary.comparisonPercentage} comparisonInverted gradient="pink" />
            <StatCard title="Mês Anterior" value={summary.previousMonthTotal} icon={TrendingDown} subtitle="Para comparação" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {expenseCategoryList.map(cat => {
              const found = summary.byCategory.find(c => c.category === cat);
              const value = found?.total ?? 0;
              const pct = found?.percentage ?? 0;
              return (
                <div key={cat} className="glass p-3 text-center">
                  <div className="h-1.5 rounded-full mb-2" style={{ background: expenseCategoryColors[cat], opacity: value > 0 ? 1 : 0.25 }} />
                  <div className="text-[11px] text-muted-foreground truncate">{expenseCategoryLabels[cat]}</div>
                  <div className="font-semibold text-sm mt-1">{brl(value)}</div>
                  <div className="text-[10px] text-muted-foreground">{pct.toFixed(0)}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Histórico</CardTitle>
            <CardDescription>{filtered.length} despesa{filtered.length !== 1 ? 's' : ''}</CardDescription>
          </div>
        </CardHeader>

        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <EmptyState title="Nenhuma despesa" description="Adicione sua primeira despesa do mês." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="py-2 pr-3">Data</th>
                  <th className="py-2 pr-3">Descrição</th>
                  <th className="py-2 pr-3">Categoria</th>
                  <th className="py-2 pr-3">Método</th>
                  <th className="py-2 pr-3 text-right">Valor</th>
                  <th className="py-2 w-24"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/40">
                {filtered.map(e => (
                  <tr key={e.id} className="hover:bg-white/40 transition">
                    <td className="py-3 pr-3">{formatDate(e.transactionDate)}</td>
                    <td className="py-3 pr-3 font-medium">{e.description}</td>
                    <td className="py-3 pr-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: `${expenseCategoryColors[e.category]}25`, color: expenseCategoryColors[e.category] }}
                      >
                        {expenseCategoryLabels[e.category]}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-xs text-muted-foreground">{paymentMethodLabels[e.paymentMethod]}</td>
                    <td className="py-3 pr-3 text-right font-semibold text-rose-600">{brl(e.amount)}</td>
                    <td className="py-3 flex justify-end gap-1">
                      <button onClick={() => { setEditing(e); setDialogOpen(true); }} className="p-1.5 rounded-lg hover:bg-white/60 text-muted-foreground hover:text-primary">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleteId(e.id)} className="p-1.5 rounded-lg hover:bg-white/60 text-muted-foreground hover:text-rose-600">
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
            <DialogTitle>{editing ? 'Editar Despesa' : 'Nova Despesa'}</DialogTitle>
          </DialogHeader>
          <ExpenseForm
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
        title="Remover despesa?"
        description="Esta ação não pode ser desfeita."
        confirmLabel="Remover"
        loading={submitting}
        onConfirm={handleDelete}
      />
    </>
  );
}
