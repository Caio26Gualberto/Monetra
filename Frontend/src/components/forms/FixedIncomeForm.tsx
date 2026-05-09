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
import { incomeTypeLabels, incomeTypeList } from '@/lib/constants';
import { currentMonth, monthRangeOptions } from '@/lib/formatters';
import type { CreateFixedIncomeRequest, FixedIncome, IncomeType } from '@/lib/types';

const schema = z.object({
  type: z.enum(['Salary', 'Freelance']),
  amount: z.coerce.number().positive('Informe um valor maior que zero'),
  description: z.string().min(1, 'Descrição obrigatória').max(255),
  startMonth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Mês inválido')
});
type FormValues = z.infer<typeof schema>;

interface Props {
  initial?: FixedIncome;
  onSubmit: (data: CreateFixedIncomeRequest) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export function FixedIncomeForm({ initial, onSubmit, onCancel, submitting }: Props) {
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: (initial?.type as IncomeType) ?? 'Salary',
      amount: initial?.amount ?? 0,
      description: initial?.description ?? '',
      startMonth: initial?.startMonth ?? currentMonth()
    }
  });

  const typeOptions = useMemo(
    () => incomeTypeList.map(t => ({ value: t, label: incomeTypeLabels[t] })),
    []
  );
  const monthOpts = useMemo(() => monthRangeOptions(24, 12), []);

  useEffect(() => {
    if (initial) {
      reset({
        type: initial.type as IncomeType,
        amount: initial.amount,
        description: initial.description,
        startMonth: initial.startMonth
      });
    }
  }, [initial, reset]);

  return (
    <form onSubmit={handleSubmit(async (v) => onSubmit(v))} className="flex flex-col gap-3">
      <div>
        <Label>Tipo</Label>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <CustomSelect
              className="mt-1"
              value={field.value}
              onChange={(v) => field.onChange(v as IncomeType)}
              options={typeOptions}
            />
          )}
        />
      </div>
      <div>
        <Label>Valor mensal (R$)</Label>
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
        <Input className="mt-1" placeholder="Ex: Salário CLT" {...register('description')} />
        {errors.description && <span className="text-xs text-rose-600">{errors.description.message}</span>}
      </div>
      <div>
        <Label>A partir de</Label>
        <div className="mt-1">
          <Controller
            control={control}
            name="startMonth"
            render={({ field }) => (
              <CustomSelect options={monthOpts} value={field.value} onChange={field.onChange} />
            )}
          />
        </div>
        {errors.startMonth && <span className="text-xs text-rose-600">{errors.startMonth.message}</span>}
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
