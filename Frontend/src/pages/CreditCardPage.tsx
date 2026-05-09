import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, CreditCard as CardIcon, CheckCircle2, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Header, PageTitle } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { financialService } from '@/services/financial.service';
import { extractApiError } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { brl, currentMonth, formatDate, formatMonth, monthOptions } from '@/lib/formatters';
import type { CreditCard, CreditCardPurchase, CreatePurchaseRequest, CreateCreditCardRequest } from '@/lib/types';

const cardSchema = z.object({
  cardName: z.string().min(1, 'Nome obrigatório').max(80),
  totalAmount: z.coerce.number().min(0),
  dueDate: z.string().min(1, 'Data obrigatória'),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Formato yyyy-MM')
});

const purchaseSchema = z.object({
  description: z.string().min(1, 'Descrição obrigatória').max(255),
  amount: z.coerce.number().positive(),
  totalInstallments: z.coerce.number().int().min(1).max(24),
  purchaseDate: z.string().min(1)
});

export function CreditCardPage() {
  const [month, setMonth] = useState(currentMonth());
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [purchases, setPurchases] = useState<CreditCardPurchase[]>([]);
  const [loading, setLoading] = useState(true);

  const [cardDialog, setCardDialog] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [purchaseDialog, setPurchaseDialog] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<CreditCardPurchase | null>(null);
  const [deleteCardId, setDeleteCardId] = useState<string | null>(null);
  const [deletePurchaseId, setDeletePurchaseId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { success, error: toastError } = useToast();

  const selectedCard = useMemo(() => cards.find(c => c.id === selectedCardId), [cards, selectedCardId]);

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

  useEffect(() => {
    if (!selectedCardId) { setPurchases([]); return; }
    financialService.getPurchases(selectedCardId)
      .then(setPurchases)
      .catch(err => toastError(extractApiError(err)));
  }, [selectedCardId, toastError]);

  // ----- Card form -----
  const cardForm = useForm<z.infer<typeof cardSchema>>({
    resolver: zodResolver(cardSchema),
    defaultValues: { cardName: '', totalAmount: 0, dueDate: new Date().toISOString().slice(0, 10), month: currentMonth() }
  });

  useEffect(() => {
    if (cardDialog) {
      cardForm.reset(editingCard ? {
        cardName: editingCard.cardName,
        totalAmount: editingCard.totalAmount,
        dueDate: editingCard.dueDate.slice(0, 10),
        month: editingCard.month
      } : {
        cardName: '', totalAmount: 0,
        dueDate: new Date().toISOString().slice(0, 10),
        month: currentMonth()
      });
    }
  }, [cardDialog, editingCard]); // eslint-disable-line react-hooks/exhaustive-deps

  const submitCard = async (v: z.infer<typeof cardSchema>) => {
    setSubmitting(true);
    try {
      const data: CreateCreditCardRequest = { ...v, dueDate: new Date(v.dueDate).toISOString() };
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
      loadCards();
    } catch (err) { toastError(extractApiError(err)); }
    finally { setSubmitting(false); }
  };

  const markPaid = async (id: string) => {
    try {
      await financialService.markCardAsPaid(id);
      success('Fatura marcada como paga.');
      loadCards();
    } catch (err) { toastError(extractApiError(err)); }
  };

  // ----- Purchase form -----
  const purchaseForm = useForm<z.infer<typeof purchaseSchema>>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: { description: '', amount: 0, totalInstallments: 1, purchaseDate: new Date().toISOString().slice(0, 10) }
  });
  const installmentValue = (purchaseForm.watch('amount') || 0) / Math.max(1, purchaseForm.watch('totalInstallments') || 1);

  useEffect(() => {
    if (purchaseDialog) {
      purchaseForm.reset(editingPurchase ? {
        description: editingPurchase.description,
        amount: editingPurchase.amount,
        totalInstallments: editingPurchase.totalInstallments,
        purchaseDate: editingPurchase.purchaseDate.slice(0, 10)
      } : { description: '', amount: 0, totalInstallments: 1, purchaseDate: new Date().toISOString().slice(0, 10) });
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
      financialService.getPurchases(selectedCardId).then(setPurchases);
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
      if (selectedCardId) financialService.getPurchases(selectedCardId).then(setPurchases);
    } catch (err) { toastError(extractApiError(err)); }
    finally { setSubmitting(false); }
  };

  const action = (
    <Button onClick={() => { setEditingCard(null); setCardDialog(true); }}>
      <Plus className="h-4 w-4" /> Cartão
    </Button>
  );

  return (
    <>
      <Header title="Cartão de Crédito" subtitle={formatMonth(month)} action={action} />
      <PageTitle title="Cartão de Crédito" subtitle={formatMonth(month)} action={action} />

      {loading ? <LoadingSpinner /> : cards.length === 0 ? (
        <Card>
          <EmptyState
            title="Nenhum cartão cadastrado"
            description="Adicione seu primeiro cartão para acompanhar a fatura e parcelas."
            action={<Button onClick={() => setCardDialog(true)}><Plus className="h-4 w-4" /> Adicionar Cartão</Button>}
          />
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap gap-3 mb-4">
            <Select value={selectedCardId} onChange={(e) => setSelectedCardId(e.target.value)} className="w-56">
              {cards.map(c => <option key={c.id} value={c.id}>{c.cardName}</option>)}
            </Select>
            <Select value={month} onChange={(e) => setMonth(e.target.value)} className="w-44">
              {monthOptions(12).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </div>

          {selectedCard && (
            <Card className="mb-6 gradient-mix !text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-white/85 flex items-center gap-1.5"><CardIcon className="h-3.5 w-3.5" /> Fatura {formatMonth(selectedCard.month)}</div>
                  <h3 className="text-xl font-bold mt-1 text-white">{selectedCard.cardName}</h3>
                  <div className="text-3xl font-bold mt-3">{brl(selectedCard.totalAmount)}</div>
                  <div className="text-xs text-white/85 mt-1">Vencimento: {formatDate(selectedCard.dueDate)}</div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <span className={`px-2 py-1 rounded-full text-[11px] font-medium ${selectedCard.isPaid ? 'bg-emerald-500/30 text-white' : 'bg-amber-500/40 text-white'}`}>
                    {selectedCard.isPaid ? 'Paga' : 'Pendente'}
                  </span>
                  {!selectedCard.isPaid && (
                    <Button size="sm" variant="secondary" onClick={() => markPaid(selectedCard.id)}>
                      <CheckCircle2 className="h-4 w-4" /> Marcar paga
                    </Button>
                  )}
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
                <CardDescription>{purchases.length} compra{purchases.length !== 1 ? 's' : ''}</CardDescription>
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
                      return (
                        <tr key={p.id} className="hover:bg-white/40 transition">
                          <td className="py-3 pr-3">{formatDate(p.purchaseDate)}</td>
                          <td className="py-3 pr-3 font-medium">{p.description}</td>
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
                <Label>Valor da Fatura (R$)</Label>
                <Input type="number" step="0.01" className="mt-1" {...cardForm.register('totalAmount')} />
              </div>
              <div>
                <Label>Mês</Label>
                <Select className="mt-1" {...cardForm.register('month')}>
                  {monthOptions(12).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </Select>
              </div>
            </div>
            <div>
              <Label>Vencimento</Label>
              <Input type="date" className="mt-1" {...cardForm.register('dueDate')} />
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
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Valor (R$)</Label>
                <Input type="number" step="0.01" className="mt-1" {...purchaseForm.register('amount')} />
              </div>
              <div>
                <Label>Parcelas (1–24)</Label>
                <Select className="mt-1" {...purchaseForm.register('totalInstallments')}>
                  {Array.from({ length: 24 }, (_, i) => i + 1).map(n => (
                    <option key={n} value={n}>{n}x</option>
                  ))}
                </Select>
              </div>
            </div>
            <div>
              <Label>Data da Compra</Label>
              <Input type="date" className="mt-1" {...purchaseForm.register('purchaseDate')} />
            </div>
            <div className="text-xs text-muted-foreground glass p-2">
              Valor da parcela: <strong className="text-foreground">{brl(installmentValue)}</strong>
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
