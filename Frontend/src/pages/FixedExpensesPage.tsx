import { useEffect, useState, useCallback, useMemo } from 'react';
import { Plus, Pencil, Trash2, Repeat } from 'lucide-react';
import { Header, PageTitle } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { StatCard } from '@/components/cards/StatCard';
import { FixedExpenseForm } from '@/components/forms/FixedExpenseForm';
import { financialService } from '@/services/financial.service';
import { extractApiError } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { brl, formatMonth } from '@/lib/formatters';
import { expenseCategoryColors, expenseCategoryLabels, paymentMethodLabels } from '@/lib/constants';
import type { CreateFixedExpenseRequest, FixedExpense } from '@/lib/types';

export function FixedExpensesPage() {
  const [items, setItems] = useState<FixedExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FixedExpense | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { success, error: toastError } = useToast();

  const load = useCallback(() => {
    setLoading(true);
    financialService.getFixedExpenses()
      .then(setItems)
      .catch(err => toastError(extractApiError(err)))
      .finally(() => setLoading(false));
  }, [toastError]);

  useEffect(load, [load]);

  const monthlyTotal = useMemo(() => items.reduce((s, x) => s + x.amount, 0), [items]);

  const handleSubmit = useCallback(async (data: CreateFixedExpenseRequest) => {
    setSubmitting(true);
    try {
      if (editing) {
        await financialService.updateFixedExpense(editing.id, data);
        success('Despesa fixa atualizada!');
      } else {
        await financialService.createFixedExpense(data);
        success('Despesa fixa adicionada!');
      }
      setDialogOpen(false);
      setEditing(null);
      load();
    } catch (err) { toastError(extractApiError(err)); }
    finally { setSubmitting(false); }
  }, [editing, load, success, toastError]);

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    setSubmitting(true);
    try {
      await financialService.deleteFixedExpense(deleteId);
      success('Despesa fixa removida.');
      setDeleteId(null);
      load();
    } catch (err) { toastError(extractApiError(err)); }
    finally { setSubmitting(false); }
  }, [deleteId, load, success, toastError]);

  const action = (
    <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
      <Plus className="h-4 w-4" /> Adicionar
    </Button>
  );

  return (
    <>
      <Header title="Despesas Fixas" subtitle="Recorrentes mensais" action={action} />
      <PageTitle title="Despesas Fixas" subtitle="Recorrentes mensais" action={action} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StatCard title="Total Mensal" value={monthlyTotal} icon={Repeat} gradient="pink" subtitle="Soma de todas as fixas ativas" />
        <StatCard title="Quantidade" value={items.length} icon={Repeat} subtitle={items.length === 1 ? 'despesa fixa' : 'despesas fixas'} />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Cadastradas</CardTitle>
            <CardDescription>{items.length} {items.length === 1 ? 'despesa fixa' : 'despesas fixas'}</CardDescription>
          </div>
        </CardHeader>

        {loading ? (
          <LoadingSpinner />
        ) : items.length === 0 ? (
          <EmptyState
            title="Nenhuma despesa fixa"
            description="Cadastre seus gastos recorrentes (aluguel, planos, ajuda mensal, etc.) para projetar saldo dos próximos meses."
            action={<Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" /> Adicionar</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="py-2 pr-3">Desde</th>
                  <th className="py-2 pr-3">Descrição</th>
                  <th className="py-2 pr-3">Categoria</th>
                  <th className="py-2 pr-3">Método</th>
                  <th className="py-2 pr-3 text-right">Valor mensal</th>
                  <th className="py-2 w-24"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/40">
                {items.map(e => (
                  <tr key={e.id} className="hover:bg-white/40 transition">
                    <td className="py-3 pr-3">{formatMonth(e.startMonth)}</td>
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
            <DialogTitle>{editing ? 'Editar Despesa Fixa' : 'Nova Despesa Fixa'}</DialogTitle>
          </DialogHeader>
          <FixedExpenseForm
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
        title="Remover despesa fixa?"
        description="A despesa deixa de ser considerada nas projeções a partir do próximo carregamento."
        confirmLabel="Remover"
        loading={submitting}
        onConfirm={handleDelete}
      />
    </>
  );
}
