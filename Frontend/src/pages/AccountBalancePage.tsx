import { useEffect, useState } from 'react';
import { Wallet, RefreshCw, Loader2 } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Header, PageTitle } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { Label } from '@/components/ui/Label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { financialService } from '@/services/financial.service';
import { extractApiError } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { brl, formatDateTime } from '@/lib/formatters';
import type { Account, AccountBalanceHistory } from '@/lib/types';

const schema = z.object({
  newBalance: z.coerce.number().min(0, 'Saldo não pode ser negativo'),
  notes: z.string().max(255).optional()
});

export function AccountBalancePage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [history, setHistory] = useState<AccountBalanceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { success, error: toastError } = useToast();

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { newBalance: 0, notes: '' }
  });

  const load = () => {
    setLoading(true);
    Promise.all([financialService.getAccount(), financialService.getAccountHistory()])
      .then(([a, h]) => { setAccount(a); setHistory(h); reset({ newBalance: a.currentBalance, notes: '' }); })
      .catch(err => toastError(extractApiError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (v: z.infer<typeof schema>) => {
    setSubmitting(true);
    try {
      await financialService.updateBalance(v.newBalance, v.notes);
      success('Saldo atualizado!');
      setDialogOpen(false);
      load();
    } catch (err) { toastError(extractApiError(err)); }
    finally { setSubmitting(false); }
  };

  return (
    <>
      <Header title="Saldo em Conta" subtitle="Acompanhe e atualize seu saldo" />
      <PageTitle title="Saldo em Conta" subtitle="Acompanhe e atualize seu saldo" />

      {loading ? <LoadingSpinner /> : !account ? (
        <EmptyState title="Sem conta" />
      ) : (
        <>
          <div className="glass-strong p-8 mb-6 animate-fade-in gradient-mix !text-white">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Wallet className="h-7 w-7" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white/85">Saldo Atual</div>
                <div className="text-4xl md:text-5xl font-bold mt-1">{brl(account.currentBalance)}</div>
                <div className="text-xs text-white/85 mt-2">Atualizado em {formatDateTime(account.updatedAt)}</div>
              </div>
              <Button variant="secondary" onClick={() => setDialogOpen(true)}>
                <RefreshCw className="h-4 w-4" /> Atualizar
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Histórico de Alterações</CardTitle>
                <CardDescription>{history.length} registro{history.length !== 1 ? 's' : ''}</CardDescription>
              </div>
            </CardHeader>

            {history.length === 0 ? (
              <EmptyState title="Sem alterações" description="O histórico aparecerá aqui após a primeira atualização." />
            ) : (
              <ul className="divide-y divide-white/40">
                {history.map(h => {
                  const diff = h.newBalance - h.previousBalance;
                  const positive = diff >= 0;
                  return (
                    <li key={h.id} className="flex items-center justify-between py-3 gap-3">
                      <div className="min-w-0">
                        <div className="font-medium text-sm">{h.notes || 'Atualização de saldo'}</div>
                        <div className="text-xs text-muted-foreground">{formatDateTime(h.createdAt)}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{brl(h.newBalance)}</div>
                        <div className={`text-xs ${positive ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {positive ? '+' : ''}{brl(diff)}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar Saldo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
            <div>
              <Label>Novo Saldo (R$)</Label>
              <div className="mt-1">
                <Controller
                  control={control}
                  name="newBalance"
                  render={({ field }) => (
                    <CurrencyInput value={field.value} onChange={field.onChange} />
                  )}
                />
              </div>
              {errors.newBalance && <span className="text-xs text-rose-600">{errors.newBalance.message}</span>}
            </div>
            <div>
              <Label>Observações (opcional)</Label>
              <Input className="mt-1" placeholder="Ex: sincronia com banco" {...register('notes')} />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
