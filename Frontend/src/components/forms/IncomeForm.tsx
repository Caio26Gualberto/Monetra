import { useEffect, memo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { Label } from '@/components/ui/Label';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { incomeTypeLabels, incomeTypeList } from '@/lib/constants';
import type { CreateIncomeRequest, Income, IncomeType } from '@/lib/types';

const schema = z.object({
  type: z.enum(['Salary', 'Freelance']),
  amount: z.coerce.number().positive('Informe um valor maior que zero'),
  description: z.string().min(1, 'Descrição obrigatória').max(255),
  transactionDate: z.string().min(1, 'Data obrigatória')
});
type FormValues = z.infer<typeof schema>;

interface Props {
  initial?: Income;
  onSubmit: (data: CreateIncomeRequest) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export const IncomeForm = memo(function IncomeForm({ initial, onSubmit, onCancel, submitting }: Props) {
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: (initial?.type as IncomeType) ?? 'Salary',
      amount: initial?.amount ?? 0,
      description: initial?.description ?? '',
      transactionDate: initial?.transactionDate?.slice(0, 10) ?? new Date().toISOString().slice(0, 10)
    }
  });

  useEffect(() => {
    if (initial) {
      reset({
        type: initial.type as IncomeType,
        amount: initial.amount,
        description: initial.description,
        transactionDate: initial.transactionDate.slice(0, 10)
      });
    }
  }, [initial, reset]);

  return (
    <form onSubmit={handleSubmit(async (v) => onSubmit({ ...v, transactionDate: new Date(v.transactionDate).toISOString() }))} className="flex flex-col gap-3">
      <div>
        <Label>Tipo</Label>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <CustomSelect
              className="mt-1"
              value={field.value}
              onChange={field.onChange}
              options={incomeTypeList.map(t => ({ value: t, label: incomeTypeLabels[t] }))}
            />
          )}
        />
      </div>
      <div>
        <Label>Valor (R$)</Label>
        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              className="mt-1"
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        {errors.amount && <span className="text-xs text-rose-600">{errors.amount.message}</span>}
      </div>
      <div>
        <Label>Descrição</Label>
        <Input className="mt-1" placeholder="Ex: Salário Outubro" {...register('description')} />
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
});
