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
import { FixedIncomeForm } from '@/components/forms/FixedIncomeForm';
import { financialService } from '@/services/financial.service';
import { extractApiError } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { brl, formatMonth } from '@/lib/formatters';
import { incomeTypeLabels } from '@/lib/constants';
import type { CreateFixedIncomeRequest, FixedIncome } from '@/lib/types';

export function FixedIncomesPage() {
  const [items, setItems] = useState<FixedIncome[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FixedIncome | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { success, error: toastError } = useToast();

  const load = useCallback(() => {
    setLoading(true);
    financialService.getFixedIncomes()
      .then(setItems)
      .catch(err => toastError(extractApiError(err)))
      .finally(() => setLoading(false));
  }, [toastError]);

  useEffect(load, [load]);

  const monthlyTotal = useMemo(() => items.reduce((s, x) => s + x.amount, 0), [items]);

  const handleSubmit = useCallback(async (data: CreateFixedIncomeRequest) => {
    setSubmitting(true);
    try {
      if (editing) {
        await financialService.updateFixedIncome(editing.id, data);
        success('Receita fixa atualizada!');
      } else {
        await financialService.createFixedIncome(data);
        success('Receita fixa adicionada!');
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
      await financialService.deleteFixedIncome(deleteId);
      success('Receita fixa removida.');
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
      <Header title="Receitas Fixas" subtitle="Recorrentes mensais (salário, etc.)" action={action} />
      <PageTitle title="Receitas Fixas" subtitle="Recorrentes mensais (salário, etc.)" action={action} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StatCard title="Total Mensal" value={monthlyTotal} icon={Repeat} gradient="purple" subtitle="Soma das fixas ativas" />
        <StatCard title="Quantidade" value={items.length} icon={Repeat} subtitle={items.length === 1 ? 'receita fixa' : 'receitas fixas'} />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Cadastradas</CardTitle>
            <CardDescription>{items.length} {items.length === 1 ? 'receita fixa' : 'receitas fixas'}</CardDescription>
          </div>
        </CardHeader>

        {loading ? (
          <LoadingSpinner />
        ) : items.length === 0 ? (
          <EmptyState
            title="Nenhuma receita fixa"
            description="Cadastre seu salário e outras receitas recorrentes para projetar saldo dos próximos meses."
            action={<Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" /> Adicionar</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="py-2 pr-3">Desde</th>
                  <th className="py-2 pr-3">Descrição</th>
                  <th className="py-2 pr-3">Tipo</th>
                  <th className="py-2 pr-3 text-right">Valor mensal</th>
                  <th className="py-2 w-24"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/40">
                {items.map(i => (
                  <tr key={i.id} className="hover:bg-white/40 transition">
                    <td className="py-3 pr-3">{formatMonth(i.startMonth)}</td>
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
            <DialogTitle>{editing ? 'Editar Receita Fixa' : 'Nova Receita Fixa'}</DialogTitle>
          </DialogHeader>
          <FixedIncomeForm
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
        title="Remover receita fixa?"
        description="A receita deixa de ser considerada nas projeções a partir do próximo carregamento."
        confirmLabel="Remover"
        loading={submitting}
        onConfirm={handleDelete}
      />
    </>
  );
}
