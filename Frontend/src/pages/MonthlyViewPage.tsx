import { useEffect, useMemo, useState } from 'react';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import { Header, PageTitle } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { financialService } from '@/services/financial.service';
import { extractApiError } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { brl, currentMonth, formatDate, formatMonth, monthRangeOptions } from '@/lib/formatters';
import { expenseCategoryLabels, expenseCategoryList, labelFromCategory } from '@/lib/constants';
import type { ExpenseCategory, MonthlyOverview, Transaction } from '@/lib/types';

export function MonthlyViewPage() {
  const [month, setMonth] = useState(currentMonth());
  const [type, setType] = useState<'All' | 'Income' | 'Expense'>('All');
  const [category, setCategory] = useState<'All' | ExpenseCategory>('All');
  const [sort, setSort] = useState('date_desc');
  const [search, setSearch] = useState('');
  const [data, setData] = useState<MonthlyOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [showIncomes, setShowIncomes] = useState(true);
  const [showExpenses, setShowExpenses] = useState(true);
  const { error: toastError } = useToast();

  useEffect(() => {
    setLoading(true);
    const params: { type?: string; category?: string; sort?: string } = { sort };
    if (type !== 'All') params.type = type;
    if (category !== 'All') params.category = category;
    financialService.getMonthlyView(month, params)
      .then(setData)
      .catch(err => toastError(extractApiError(err)))
      .finally(() => setLoading(false));
  }, [month, type, category, sort, toastError]);

  const filterBySearch = (list: Transaction[]) =>
    !search ? list : list.filter(t => t.description.toLowerCase().includes(search.toLowerCase()));

  const incomes = useMemo(() => filterBySearch(data?.incomes ?? []), [data, search]);
  const expenses = useMemo(() => filterBySearch(data?.expenses ?? []), [data, search]);

  return (
    <>
      <Header title="Visão Mensal" subtitle={formatMonth(month)} />
      <PageTitle title="Visão Mensal" subtitle={formatMonth(month)} />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        <CustomSelect value={month} onChange={setMonth} options={monthRangeOptions(12, 12)} />
        <CustomSelect
          value={type}
          onChange={(v) => setType(v as typeof type)}
          options={[
            { value: 'All', label: 'Receitas e Despesas' },
            { value: 'Income', label: 'Receitas' },
            { value: 'Expense', label: 'Despesas' }
          ]}
        />
        <CustomSelect
          value={category}
          onChange={(v) => setCategory(v as 'All' | ExpenseCategory)}
          options={[
            { value: 'All', label: 'Todas categorias' },
            ...expenseCategoryList.map(c => ({ value: c, label: expenseCategoryLabels[c] }))
          ]}
        />
        <CustomSelect
          value={sort}
          onChange={setSort}
          options={[
            { value: 'date_desc', label: 'Data ↓' },
            { value: 'date_asc', label: 'Data ↑' },
            { value: 'amount_desc', label: 'Valor ↓' },
            { value: 'amount_asc', label: 'Valor ↑' },
            { value: 'category', label: 'Categoria' }
          ]}
        />
        <div className="relative col-span-2 lg:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-10" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : !data ? (
        <EmptyState title="Sem dados" />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card>
              <div className="text-xs text-muted-foreground">Receitas</div>
              <div className="text-2xl font-bold text-emerald-600 mt-1">{brl(data.incomeTotal)}</div>
            </Card>
            <Card>
              <div className="text-xs text-muted-foreground">Despesas</div>
              <div className="text-2xl font-bold text-rose-600 mt-1">{brl(data.expenseTotal)}</div>
            </Card>
            <Card className={data.balance >= 0 ? '' : '!border-rose-300'}>
              <div className="text-xs text-muted-foreground">Saldo do Mês</div>
              <div className={`text-2xl font-bold mt-1 ${data.balance >= 0 ? 'text-foreground' : 'text-rose-600'}`}>{brl(data.balance)}</div>
            </Card>
          </div>

          {(type === 'All' || type === 'Income') && (
            <Card className="mb-4">
              <CardHeader>
                <button onClick={() => setShowIncomes(s => !s)} className="flex items-center gap-2 text-left">
                  {showIncomes ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <div>
                    <CardTitle>Receitas</CardTitle>
                    <CardDescription>{incomes.length} item{incomes.length !== 1 ? 's' : ''} · Subtotal: {brl(incomes.reduce((s, i) => s + i.amount, 0))}</CardDescription>
                  </div>
                </button>
              </CardHeader>
              {showIncomes && (
                incomes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma receita encontrada.</p>
                ) : (
                  <ul className="divide-y divide-white/40">
                    {incomes.map(i => (
                      <li key={i.id} className="flex items-center justify-between py-2.5">
                        <div>
                          <div className="font-medium text-sm">{i.description}</div>
                          <div className="text-xs text-muted-foreground">{formatDate(i.transactionDate)} · {labelFromCategory(i.category)}</div>
                        </div>
                        <span className="font-semibold text-emerald-600">+ {brl(i.amount)}</span>
                      </li>
                    ))}
                  </ul>
                )
              )}
            </Card>
          )}

          {(type === 'All' || type === 'Expense') && (
            <Card>
              <CardHeader>
                <button onClick={() => setShowExpenses(s => !s)} className="flex items-center gap-2 text-left">
                  {showExpenses ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <div>
                    <CardTitle>Despesas</CardTitle>
                    <CardDescription>{expenses.length} item{expenses.length !== 1 ? 's' : ''} · Subtotal: {brl(expenses.reduce((s, e) => s + e.amount, 0))}</CardDescription>
                  </div>
                </button>
              </CardHeader>
              {showExpenses && (
                expenses.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma despesa encontrada.</p>
                ) : (
                  <ul className="divide-y divide-white/40">
                    {expenses.map(e => (
                      <li key={e.id} className="flex items-center justify-between py-2.5">
                        <div>
                          <div className="font-medium text-sm">{e.description}</div>
                          <div className="text-xs text-muted-foreground">{formatDate(e.transactionDate)} · {labelFromCategory(e.category)}</div>
                        </div>
                        <span className="font-semibold text-rose-600">− {brl(e.amount)}</span>
                      </li>
                    ))}
                  </ul>
                )
              )}
            </Card>
          )}
        </>
      )}
    </>
  );
}
