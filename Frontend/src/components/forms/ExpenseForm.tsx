import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { expenseCategoryLabels, expenseCategoryList, paymentMethodLabels, paymentMethodList } from '@/lib/constants';
import type { CreateExpenseRequest, Expense, ExpenseCategory, PaymentMethod } from '@/lib/types';

const schema = z.object({
  category: z.enum(['Food', 'Transport', 'Entertainment', 'Health', 'Shopping', 'Utilities', 'Other']),
  paymentMethod: z.enum(['Debit', 'Pix']),
  amount: z.coerce.number().positive('Informe um valor maior que zero'),
  description: z.string().min(1, 'Descrição obrigatória').max(255),
  transactionDate: z.string().min(1, 'Data obrigatória')
});
type FormValues = z.infer<typeof schema>;

interface Props {
  initial?: Expense;
  onSubmit: (data: CreateExpenseRequest) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export function ExpenseForm({ initial, onSubmit, onCancel, submitting }: Props) {
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: (initial?.category as ExpenseCategory) ?? 'Food',
      paymentMethod: (initial?.paymentMethod as PaymentMethod) ?? 'Debit',
      amount: initial?.amount ?? 0,
      description: initial?.description ?? '',
      transactionDate: initial?.transactionDate?.slice(0, 10) ?? new Date().toISOString().slice(0, 10)
    }
  });

  const categoryOptions = useMemo(
    () => expenseCategoryList.map(c => ({ value: c, label: expenseCategoryLabels[c] })),
    []
  );
  const methodOptions = useMemo(
    () => paymentMethodList.map(m => ({ value: m, label: paymentMethodLabels[m] })),
    []
  );

  useEffect(() => {
    if (initial) {
      reset({
        category: initial.category as ExpenseCategory,
        paymentMethod: initial.paymentMethod as PaymentMethod,
        amount: initial.amount,
        description: initial.description,
        transactionDate: initial.transactionDate.slice(0, 10)
      });
    }
  }, [initial, reset]);

  return (
    <form onSubmit={handleSubmit(async (v) => onSubmit({ ...v, transactionDate: new Date(v.transactionDate).toISOString() }))} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Categoria</Label>
          <div className="mt-1">
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <CustomSelect
                  options={categoryOptions}
                  value={field.value}
                  onChange={(v) => field.onChange(v as ExpenseCategory)}
                />
              )}
            />
          </div>
        </div>
        <div>
          <Label>Método</Label>
          <div className="mt-1">
            <Controller
              control={control}
              name="paymentMethod"
              render={({ field }) => (
                <CustomSelect
                  options={methodOptions}
                  value={field.value}
                  onChange={(v) => field.onChange(v as PaymentMethod)}
                />
              )}
            />
          </div>
        </div>
      </div>
      <div>
        <Label>Valor (R$)</Label>
        <div className="mt-1">
          <Controller
            control={control}
            name="amount"
            render={({ field }) => (
              <CurrencyInput value={field.value} onChange={field.onChange} />
            )}
          />
        </div>
        {errors.amount && <span className="text-xs text-rose-600">{errors.amount.message}</span>}
      </div>
      <div>
        <Label>Descrição</Label>
        <Input className="mt-1" placeholder="Ex: Mercado" {...register('description')} />
        {errors.description && <span className="text-xs text-rose-600">{errors.description.message}</span>}
      </div>
      <div>
        <Label>Data</Label>
        <Input type="date" className="mt-1" {...register('transactionDate')} />
        {errors.transactionDate && <span className="text-xs text-rose-600">{errors.transactionDate.message}</span>}
      </div>
      <div className="flex justify-end gap-2 mt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
        </Button>
      </div>
    </form>
  );
}
