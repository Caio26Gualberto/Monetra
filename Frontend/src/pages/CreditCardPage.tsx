import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Pencil, Trash2, CreditCard as CardIcon, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Header, PageTitle } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { financialService } from '@/services/financial.service';
import { extractApiError } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { brl, currentMonth, formatDate, formatMonth, monthRangeOptions } from '@/lib/formatters';
import type { CreditCard, CreditCardInvoice, CreditCardPurchase, CreatePurchaseRequest, CreateCreditCardRequest } from '@/lib/types';

const cardSchema = z.object({
  cardName: z.string().min(1, 'Nome obrigatório').max(80),
  closingDay: z.coerce.number().int().min(1).max(31),
  dueDay: z.coerce.number().int().min(1).max(31)
});

const purchaseSchema = z.object({
  description: z.string().min(1, 'Descrição obrigatória').max(255),
  amount: z.coerce.number().positive('Informe um valor maior que zero'),
  totalInstallments: z.coerce.number().int().min(1).max(24),
  currentInstallment: z.coerce.number().int().min(1).max(24),
  purchaseDate: z.string().min(1)
}).refine(v => v.currentInstallment <= v.totalInstallments, {
  message: 'Parcela atual não pode ser maior que o total',
  path: ['currentInstallment']
});

const dayOptions = Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }));

const openInvoiceMonth = (closingDay: number, today: Date = new Date()): string => {
  const ahead = today.getDate() > closingDay ? 1 : 0;
  const d = new Date(today.getFullYear(), today.getMonth() + ahead, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export function CreditCardPage() {
  const [month, setMonth] = useState(currentMonth());
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [purchases, setPurchases] = useState<CreditCardPurchase[]>([]);
  const [invoice, setInvoice] = useState<CreditCardInvoice | null>(null);
  const [loading, setLoading] = useState(true);

  const [cardDialog, setCardDialog] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [purchaseDialog, setPurchaseDialog] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<CreditCardPurchase | null>(null);
  const [deleteCardId, setDeleteCardId] = useState<string | null>(null);
  const [deletePurchaseId, setDeletePurchaseId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const userPickedMonth = useRef(false);

  const { success, error: toastError } = useToast();

  const selectedCard = useMemo(() => cards.find(c => c.id === selectedCardId), [cards, selectedCardId]);

  useEffect(() => {
    if (selectedCard && !userPickedMonth.current) {
      setMonth(openInvoiceMonth(selectedCard.closingDay));
    }
  }, [selectedCard]);

  const handleMonthChange = (v: string) => {
    userPickedMonth.current = true;
    setMonth(v);
  };

  const handleCardChange = (id: string) => {
    userPickedMonth.current = false;
    setSelectedCardId(id);
  };
  const cardOptions = useMemo(() => cards.map(c => ({ value: c.id, label: c.cardName })), [cards]);
  const monthOpts = useMemo(() => monthRangeOptions(6, 12), []);

  const loadCards = () => {
    setLoading(true);
    financialService.getCreditCards()
      .then(list => {
        setCards(list);
        if (list.length > 0 && !list.find(c => c.id === selectedCardId)) {
          setSelectedCardId(list[0].id);
        }
      })
      .catch(err => toastError(extractApiError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(loadCards, []); // eslint-disable-line react-hooks/exhaustive-deps

  const reloadPurchases = (cardId: string) => {
    financialService.getPurchases(cardId)
      .then(setPurchases)
      .catch(err => toastError(extractApiError(err)));
  };

  const reloadInvoice = (cardId: string, m: string) => {
    financialService.getInvoice(cardId, m)
      .then(setInvoice)
      .catch(err => toastError(extractApiError(err)));
  };

  useEffect(() => {
    if (!selectedCardId) { setPurchases([]); setInvoice(null); return; }
    reloadPurchases(selectedCardId);
    reloadInvoice(selectedCardId, month);
  }, [selectedCardId, month]); // eslint-disable-line react-hooks/exhaustive-deps

  // ----- Card form -----
  const cardForm = useForm<z.infer<typeof cardSchema>>({
    resolver: zodResolver(cardSchema),
    defaultValues: { cardName: '', closingDay: 3, dueDay: 10 }
  });

  useEffect(() => {
    if (cardDialog) {
      cardForm.reset(editingCard ? {
        cardName: editingCard.cardName,
        closingDay: editingCard.closingDay,
        dueDay: editingCard.dueDay
      } : { cardName: '', closingDay: 3, dueDay: 10 });
    }
  }, [cardDialog, editingCard]); // eslint-disable-line react-hooks/exhaustive-deps

  const submitCard = async (v: z.infer<typeof cardSchema>) => {
    setSubmitting(true);
    try {
      const data: CreateCreditCardRequest = v;
      if (editingCard) {
        await financialService.updateCreditCard(editingCard.id, data);
        success('Cartão atualizado!');
      } else {
        await financialService.createCreditCard(data);
        success('Cartão adicionado!');
      }
      setCardDialog(false);
      setEditingCard(null);
      loadCards();
      if (selectedCardId) reloadInvoice(selectedCardId, month);
    } catch (err) { toastError(extractApiError(err)); }
    finally { setSubmitting(false); }
  };

  const deleteCard = async () => {
    if (!deleteCardId) return;
    setSubmitting(true);
    try {
      await financialService.deleteCreditCard(deleteCardId);
      success('Cartão removido.');
      setDeleteCardId(null);
      if (selectedCardId === deleteCardId) setSelectedCardId('');
      loadCards();
    } catch (err) { toastError(extractApiError(err)); }
    finally { setSubmitting(false); }
  };

  const togglePaid = async () => {
    if (!selectedCardId || !invoice) return;
    try {
      if (invoice.isPaid) {
        await financialService.unpayInvoice(selectedCardId, month);
        success('Fatura desmarcada como paga.');
      } else {
        await financialService.payInvoice(selectedCardId, month);
        success('Fatura marcada como paga.');
      }
      reloadInvoice(selectedCardId, month);
    } catch (err) { toastError(extractApiError(err)); }
  };

  // ----- Purchase form -----
  const purchaseForm = useForm<z.infer<typeof purchaseSchema>>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: { description: '', amount: 0, totalInstallments: 1, currentInstallment: 1, purchaseDate: new Date().toISOString().slice(0, 10) }
  });
  const watchedAmount = purchaseForm.watch('amount');
  const watchedTotal = purchaseForm.watch('totalInstallments');
  const watchedCurrent = purchaseForm.watch('currentInstallment');
  const watchedDate = purchaseForm.watch('purchaseDate');
  const installmentValue = (watchedAmount || 0) / Math.max(1, watchedTotal || 1);

  const previewFirstInvoice = useMemo(() => {
    if (!selectedCard || !watchedDate) return '';
    const d = new Date(watchedDate);
    if (isNaN(d.getTime())) return '';
    const closing = selectedCard.closingDay;
    const closesThisMonth = d.getDate() <= closing;
    const baseYear = d.getFullYear();
    const baseMonth = d.getMonth() + (closesThisMonth ? 0 : 1);
    const normalized = new Date(baseYear, baseMonth, 1);
    const yyyymm = `${normalized.getFullYear()}-${String(normalized.getMonth() + 1).padStart(2, '0')}`;
    return formatMonth(yyyymm);
  }, [selectedCard, watchedDate]);

  const totalInstallmentOptions = useMemo(
    () => Array.from({ length: 24 }, (_, i) => ({ value: String(i + 1), label: `${i + 1}x` })),
    []
  );
  const currentInstallmentOptions = useMemo(() => {
    const max = Math.max(1, watchedTotal || 1);
    return Array.from({ length: max }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }));
  }, [watchedTotal]);

  useEffect(() => {
    if (watchedCurrent > watchedTotal) {
      purchaseForm.setValue('currentInstallment', watchedTotal);
    }
  }, [watchedTotal]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (purchaseDialog) {
      purchaseForm.reset(editingPurchase ? {
        description: editingPurchase.description,
        amount: editingPurchase.amount,
        totalInstallments: editingPurchase.totalInstallments,
        currentInstallment: editingPurchase.currentInstallment,
        purchaseDate: editingPurchase.purchaseDate.slice(0, 10)
      } : { description: '', amount: 0, totalInstallments: 1, currentInstallment: 1, purchaseDate: new Date().toISOString().slice(0, 10) });
    }
  }, [purchaseDialog, editingPurchase]); // eslint-disable-line react-hooks/exhaustive-deps

  const submitPurchase = async (v: z.infer<typeof purchaseSchema>) => {
    if (!selectedCardId) return;
    setSubmitting(true);
    try {
      const data: CreatePurchaseRequest = { ...v, purchaseDate: new Date(v.purchaseDate).toISOString() };
      if (editingPurchase) {
        await financialService.updatePurchase(editingPurchase.id, data);
        success('Compra atualizada!');
      } else {
        await financialService.createPurchase(selectedCardId, data);
        success('Compra adicionada!');
      }
      setPurchaseDialog(false);
      setEditingPurchase(null);
      reloadPurchases(selectedCardId);
      reloadInvoice(selectedCardId, month);
    } catch (err) { toastError(extractApiError(err)); }
    finally { setSubmitting(false); }
  };

  const deletePurchase = async () => {
    if (!deletePurchaseId) return;
    setSubmitting(true);
    try {
      await financialService.deletePurchase(deletePurchaseId);
      success('Compra removida.');
      setDeletePurchaseId(null);
      if (selectedCardId) {
        reloadPurchases(selectedCardId);
        reloadInvoice(selectedCardId, month);
      }
    } catch (err) { toastError(extractApiError(err)); }
    finally { setSubmitting(false); }
  };

  const action = (
    <Button onClick={() => { setEditingCard(null); setCardDialog(true); }}>
      <Plus className="h-4 w-4" /> Cartão
    </Button>
  );

  const invoicePurchaseIds = useMemo(
    () => new Set((invoice?.lines ?? []).map(l => l.purchaseId)),
    [invoice]
  );

  return (
    <>
      <Header title="Cartão de Crédito" subtitle={formatMonth(month)} action={action} />
      <PageTitle title="Cartão de Crédito" subtitle={formatMonth(month)} action={action} />

      {loading ? <LoadingSpinner /> : cards.length === 0 ? (
        <Card>
          <EmptyState
            title="Nenhum cartão cadastrado"
            description="Adicione seu primeiro cartão para acompanhar suas compras e faturas."
            action={<Button onClick={() => setCardDialog(true)}><Plus className="h-4 w-4" /> Adicionar Cartão</Button>}
          />
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="w-56">
              <CustomSelect
                value={selectedCardId}
                onChange={handleCardChange}
                options={cardOptions}
              />
            </div>
            <div className="w-44">
              <CustomSelect
                value={month}
                onChange={handleMonthChange}
                options={monthOpts}
              />
            </div>
          </div>

          {selectedCard && invoice && (
            <Card className="mb-6 gradient-mix !text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-white/85 flex items-center gap-1.5">
                    <CardIcon className="h-3.5 w-3.5" /> Fatura {formatMonth(invoice.month)}
                  </div>
                  <h3 className="text-xl font-bold mt-1 text-white">{invoice.cardName}</h3>
                  <div className="text-3xl font-bold mt-3">{brl(invoice.totalAmount)}</div>
                  <div className="text-xs text-white/85 mt-1">
                    Vencimento: {formatDate(invoice.dueDate)}
                    <span className="mx-2 opacity-60">•</span>
                    Fecha dia {selectedCard.closingDay}
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <span className={`px-2 py-1 rounded-full text-[11px] font-medium ${invoice.isPaid ? 'bg-emerald-500/30 text-white' : 'bg-amber-500/40 text-white'}`}>
                    {invoice.isPaid ? 'Paga' : 'Pendente'}
                  </span>
                  <Button size="sm" variant="secondary" onClick={togglePaid}>
                    {invoice.isPaid
                      ? <><XCircle className="h-4 w-4" /> Desmarcar</>
                      : <><CheckCircle2 className="h-4 w-4" /> Marcar paga</>}
                  </Button>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingCard(selectedCard); setCardDialog(true); }} className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeleteCardId(selectedCard.id)} className="p-1.5 rounded-lg bg-white/15 hover:bg-rose-500/40 transition">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Compras</CardTitle>
                <CardDescription>
                  {purchases.length} compra{purchases.length !== 1 ? 's' : ''}
                  {invoice ? ` • ${invoice.lines.length} nesta fatura` : ''}
                </CardDescription>
              </div>
              <Button onClick={() => { setEditingPurchase(null); setPurchaseDialog(true); }}>
                <Plus className="h-4 w-4" /> Compra
              </Button>
            </CardHeader>

            {purchases.length === 0 ? (
              <EmptyState title="Nenhuma compra" description="Adicione compras parceladas ou à vista neste cartão." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs text-muted-foreground uppercase">
                    <tr>
                      <th className="py-2 pr-3">Data</th>
                      <th className="py-2 pr-3">Descrição</th>
                      <th className="py-2 pr-3">Parcelas</th>
                      <th className="py-2 pr-3 text-right">Parcela</th>
                      <th className="py-2 pr-3 text-right">Total</th>
                      <th className="py-2 w-24"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/40">
                    {purchases.map(p => {
                      const progress = (p.currentInstallment / p.totalInstallments) * 100;
                      const inInvoice = invoicePurchaseIds.has(p.id);
                      return (
                        <tr key={p.id} className={`transition ${inInvoice ? 'bg-purple-50/60' : 'hover:bg-white/40'}`}>
                          <td className="py-3 pr-3">{formatDate(p.purchaseDate)}</td>
                          <td className="py-3 pr-3 font-medium">
                            {p.description}
                            {inInvoice && <span className="ml-2 text-[10px] uppercase tracking-wide text-purple-700">nesta fatura</span>}
                          </td>
                          <td className="py-3 pr-3">
                            <div className="text-xs mb-1">{p.currentInstallment}/{p.totalInstallments}</div>
                            <div className="h-1.5 w-24 bg-white/60 rounded-full overflow-hidden">
                              <div className="h-full gradient-mix" style={{ width: `${progress}%` }} />
                            </div>
                          </td>
                          <td className="py-3 pr-3 text-right">{brl(p.installmentValue)}</td>
                          <td className="py-3 pr-3 text-right font-semibold">{brl(p.amount)}</td>
                          <td className="py-3 flex justify-end gap-1">
                            <button onClick={() => { setEditingPurchase(p); setPurchaseDialog(true); }} className="p-1.5 rounded-lg hover:bg-white/60 text-muted-foreground hover:text-primary">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button onClick={() => setDeletePurchaseId(p.id)} className="p-1.5 rounded-lg hover:bg-white/60 text-muted-foreground hover:text-rose-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}

      {/* Card dialog */}
      <Dialog open={cardDialog} onOpenChange={(v) => { setCardDialog(v); if (!v) setEditingCard(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCard ? 'Editar Cartão' : 'Novo Cartão'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={cardForm.handleSubmit(submitCard)} className="flex flex-col gap-3">
            <div>
              <Label>Nome do Cartão</Label>
              <Input className="mt-1" placeholder="Ex: Nubank, Itaú..." {...cardForm.register('cardName')} />
              {cardForm.formState.errors.cardName && <span className="text-xs text-rose-600">{cardForm.formState.errors.cardName.message}</span>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Dia de fechamento</Label>
                <div className="mt-1">
                  <Controller
                    control={cardForm.control}
                    name="closingDay"
                    render={({ field }) => (
                      <CustomSelect
                        options={dayOptions}
                        value={String(field.value)}
                        onChange={(v) => field.onChange(Number(v))}
                      />
                    )}
                  />
                </div>
              </div>
              <div>
                <Label>Dia de vencimento</Label>
                <div className="mt-1">
                  <Controller
                    control={cardForm.control}
                    name="dueDay"
                    render={({ field }) => (
                      <CustomSelect
                        options={dayOptions}
                        value={String(field.value)}
                        onChange={(v) => field.onChange(Number(v))}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground glass p-2">
              Compras feitas após o dia {cardForm.watch('closingDay')} entram na fatura do mês seguinte, com vencimento dia {cardForm.watch('dueDay')}.
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button type="button" variant="secondary" onClick={() => { setCardDialog(false); setEditingCard(null); }}>Cancelar</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Purchase dialog */}
      <Dialog open={purchaseDialog} onOpenChange={(v) => { setPurchaseDialog(v); if (!v) setEditingPurchase(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPurchase ? 'Editar Compra' : 'Nova Compra'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={purchaseForm.handleSubmit(submitPurchase)} className="flex flex-col gap-3">
            <div>
              <Label>Descrição</Label>
              <Input className="mt-1" placeholder="Ex: Eletrônico, viagem..." {...purchaseForm.register('description')} />
              {purchaseForm.formState.errors.description && <span className="text-xs text-rose-600">{purchaseForm.formState.errors.description.message}</span>}
            </div>
            <div>
              <Label>Valor (R$)</Label>
              <div className="mt-1">
                <Controller
                  control={purchaseForm.control}
                  name="amount"
                  render={({ field }) => (
                    <CurrencyInput value={field.value} onChange={field.onChange} />
                  )}
                />
              </div>
              {purchaseForm.formState.errors.amount && <span className="text-xs text-rose-600">{purchaseForm.formState.errors.amount.message}</span>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Total de parcelas</Label>
                <div className="mt-1">
                  <Controller
                    control={purchaseForm.control}
                    name="totalInstallments"
                    render={({ field }) => (
                      <CustomSelect
                        options={totalInstallmentOptions}
                        value={String(field.value)}
                        onChange={(v) => field.onChange(Number(v))}
                      />
                    )}
                  />
                </div>
              </div>
              <div>
                <Label>Parcela atual</Label>
                <div className="mt-1">
                  <Controller
                    control={purchaseForm.control}
                    name="currentInstallment"
                    render={({ field }) => (
                      <CustomSelect
                        options={currentInstallmentOptions}
                        value={String(field.value)}
                        onChange={(v) => field.onChange(Number(v))}
                      />
                    )}
                  />
                </div>
                {purchaseForm.formState.errors.currentInstallment && <span className="text-xs text-rose-600">{purchaseForm.formState.errors.currentInstallment.message}</span>}
              </div>
            </div>
            <div>
              <Label>Data da Compra</Label>
              <Input type="date" className="mt-1" {...purchaseForm.register('purchaseDate')} />
            </div>
            <div className="text-xs text-muted-foreground glass p-2 leading-relaxed">
              Valor da parcela: <strong className="text-foreground">{brl(installmentValue)}</strong>
              {previewFirstInvoice && (
                <>
                  <br />
                  Primeira fatura considerada: <strong className="text-foreground">{previewFirstInvoice}</strong>
                  {watchedCurrent > 1 && <> (parcela {watchedCurrent}/{watchedTotal})</>}
                </>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button type="button" variant="secondary" onClick={() => { setPurchaseDialog(false); setEditingPurchase(null); }}>Cancelar</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteCardId} onOpenChange={(v) => !v && setDeleteCardId(null)}
        title="Remover cartão?" description="Todas as compras vinculadas serão removidas."
        confirmLabel="Remover" loading={submitting} onConfirm={deleteCard} />

      <ConfirmDialog open={!!deletePurchaseId} onOpenChange={(v) => !v && setDeletePurchaseId(null)}
        title="Remover compra?" description="Esta ação não pode ser desfeita."
        confirmLabel="Remover" loading={submitting} onConfirm={deletePurchase} />
    </>
  );
}
