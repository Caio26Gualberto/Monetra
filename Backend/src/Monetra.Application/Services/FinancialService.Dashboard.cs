using Monetra.Application.DTOs.Dashboard;
using Monetra.Domain.Entities;
using Monetra.Domain.Services;

namespace Monetra.Application.Services;

public partial class FinancialService
{
    // ===================== DASHBOARD =====================
    public async Task<DashboardSummaryDto> GetDashboardSummaryAsync(Guid userId, string? month, CancellationToken ct = default)
    {
        var displayed = string.IsNullOrWhiteSpace(month) ? CurrentMonth() : month;
        var prev = PreviousMonth(displayed);
        var next = NextMonth(displayed);
        var todayMonth = CurrentMonth();

        var account = await _accounts.GetByUserIdAsync(userId, ct);
        var actualBalance = account?.CurrentBalance ?? 0m;

        // Calcula o saldo previsto ao fim de um mês alvo:
        // parte do saldo atual e soma o fluxo real de cada mês de hoje até o alvo (inclusive).
        // O fluxo do mês corrente é incluído, pois receitas/despesas registradas
        // ainda não foram refletidas no saldo da conta.
        // Receitas e despesas fixas já se replicam automaticamente nos meses futuros
        // via ComputeMonthlyIncome/ExpenseAsync, então NÃO extrapolamos valores.
        // Para meses passados, retorna o saldo atual (sem reconstrução histórica).
        async Task<decimal> SaldoFimDoMes(string target)
        {
            if (string.CompareOrdinal(target, todayMonth) < 0) return actualBalance;
            var b = actualBalance;
            var cursor = todayMonth;
            while (string.CompareOrdinal(cursor, target) <= 0)
            {
                var inc = await ComputeMonthlyIncomeAsync(userId, cursor, ct);
                var exp = await ComputeMonthlyExpenseAsync(userId, cursor, ct);
                b = b + inc - exp;
                cursor = InvoiceMonthCalculator.AddMonths(cursor, 1);
            }
            return b;
        }

        // Saldo do card "Saldo em Conta / Saldo Estimado":
        // - Mês atual ou passado: saldo atual (real, da conta).
        // - Mês futuro: saldo estimado no início do mês exibido (= fim do mês anterior).
        var displayedBalance = string.CompareOrdinal(displayed, todayMonth) > 0
            ? await SaldoFimDoMes(prev)
            : actualBalance;

        var monthlyIncome = await ComputeMonthlyIncomeAsync(userId, displayed, ct);
        var monthlyExpense = await ComputeMonthlyExpenseAsync(userId, displayed, ct);
        var prevIncome = await ComputeMonthlyIncomeAsync(userId, prev, ct);
        var prevExpense = await ComputeMonthlyExpenseAsync(userId, prev, ct);

        // Projeção: saldo estimado ao fim do mês exibido
        // (saldo atual + fluxo acumulado dos meses entre hoje e o exibido, inclusive).
        var projected = await SaldoFimDoMes(displayed);

        var recent = await GetRecentTransactionsAsync(userId, ct);

        return new DashboardSummaryDto(
            displayedBalance,
            monthlyIncome,
            monthlyExpense,
            projected,
            Comparison(monthlyIncome, prevIncome),
            Comparison(monthlyExpense, prevExpense),
            recent
        );
    }

    public async Task<IEnumerable<EvolutionPointDto>> GetEvolutionAsync(Guid userId, int months, string? baseMonth = null, CancellationToken ct = default)
    {
        if (months < 1) months = 6;
        var result = new List<EvolutionPointDto>();
        var todayMonth = CurrentMonth();
        var targetMonth = string.IsNullOrWhiteSpace(baseMonth) ? todayMonth : baseMonth;
        
        // Calcula o range: (months - 1) meses atrás até o mês alvo
        var dataPoints = new List<(string month, decimal inc, decimal exp)>();
        for (int i = -(months - 1); i <= 0; i++)
        {
            var m = InvoiceMonthCalculator.AddMonths(targetMonth, i);
            var inc = await ComputeMonthlyIncomeAsync(userId, m, ct);
            var exp = await ComputeMonthlyExpenseAsync(userId, m, ct);
            dataPoints.Add((m, inc, exp));
        }
        
        // Aplica extrapolação para meses futuros
        var lastInc = 0m;
        var lastExp = 0m;
        
        foreach (var point in dataPoints)
        {
            var inc = point.inc;
            var exp = point.exp;
            
            // Se for mês futuro sem entradas, extrapola usando o último fluxo conhecido
            if (string.CompareOrdinal(point.month, todayMonth) > 0)
            {
                if (inc == 0m && lastInc > 0m) inc = lastInc;
                if (exp == 0m && lastExp > 0m) exp = lastExp;
            }
            
            // Atualiza o último fluxo conhecido
            if (inc > 0m) lastInc = inc;
            if (exp > 0m) lastExp = exp;
            
            result.Add(new EvolutionPointDto(point.month, inc, exp));
        }
        
        return result;
    }

    public async Task<IEnumerable<CategoryDistributionDto>> GetDistributionAsync(Guid userId, string month, CancellationToken ct = default)
    {
        var dict = await _expenses.GetTotalByCategoryAsync(userId, month, ct);
        var totals = new Dictionary<string, decimal>();
        foreach (var kv in dict) totals[kv.Key.ToString()] = kv.Value;

        var fixedList = await _fixedExpenses.GetActiveForMonthAsync(userId, month, ct);
        foreach (var f in fixedList)
        {
            var key = f.Category.ToString();
            totals[key] = totals.TryGetValue(key, out var v) ? v + f.Amount : f.Amount;
        }

        var total = totals.Values.Sum();
        return totals.Select(kv => new CategoryDistributionDto(
            kv.Key,
            kv.Value,
            total == 0 ? 0 : Math.Round(kv.Value / total * 100m, 2)
        )).ToList();
    }

    public async Task<IEnumerable<TransactionDto>> GetRecentTransactionsAsync(Guid userId, CancellationToken ct = default)
    {
        var incomes = (await _incomes.GetByUserIdAsync(userId, ct)).Take(10);
        var expenses = (await _expenses.GetByUserIdAsync(userId, ct)).Take(10);

        var merged = incomes.Select(i => new TransactionDto(
                i.Id, "Income", i.Description, i.Type.ToString(), i.Amount, i.TransactionDate))
            .Concat(expenses.Select(e => new TransactionDto(
                e.Id, "Expense", e.Description, e.Category.ToString(), e.Amount, e.TransactionDate)))
            .OrderByDescending(t => t.TransactionDate)
            .Take(5);

        return merged.ToList();
    }

    // ===================== MONTHLY VIEW =====================
    public async Task<MonthlyOverviewDto> GetMonthlyOverviewAsync(Guid userId, string month, string? type, string? category, string? sort, CancellationToken ct = default)
    {
        var incomes = await _incomes.GetByMonthAsync(userId, month, ct);
        var expenses = await _expenses.GetByMonthAsync(userId, month, ct);
        var fixedIncomes = await _fixedIncomes.GetActiveForMonthAsync(userId, month, ct);
        var fixedExpenses = await _fixedExpenses.GetActiveForMonthAsync(userId, month, ct);
        var monthFirstDay = ParseMonthAsDate(month);

        var incomeTx = incomes.Select(i => new TransactionDto(
            i.Id, "Income", i.Description, i.Type.ToString(), i.Amount, i.TransactionDate)).ToList();
        incomeTx.AddRange(fixedIncomes.Select(f => new TransactionDto(
            f.Id, "Income", f.Description + " (Fixa)", f.Type.ToString(), f.Amount, monthFirstDay)));

        var expenseTx = expenses.Select(e => new TransactionDto(
            e.Id, "Expense", e.Description, e.Category.ToString(), e.Amount, e.TransactionDate)).ToList();
        expenseTx.AddRange(fixedExpenses.Select(f => new TransactionDto(
            f.Id, "Expense", f.Description + " (Fixa)", f.Category.ToString(), f.Amount, monthFirstDay)));

        if (!string.IsNullOrWhiteSpace(category))
        {
            expenseTx = expenseTx.Where(e => string.Equals(e.Category, category, StringComparison.OrdinalIgnoreCase)).ToList();
            incomeTx = incomeTx.Where(i => string.Equals(i.Category, category, StringComparison.OrdinalIgnoreCase)).ToList();
        }

        if (string.Equals(type, "Income", StringComparison.OrdinalIgnoreCase)) expenseTx = new();
        else if (string.Equals(type, "Expense", StringComparison.OrdinalIgnoreCase)) incomeTx = new();

        IEnumerable<TransactionDto> Sort(IEnumerable<TransactionDto> src) => sort?.ToLowerInvariant() switch
        {
            "date_asc" => src.OrderBy(t => t.TransactionDate),
            "amount_asc" => src.OrderBy(t => t.Amount),
            "amount_desc" => src.OrderByDescending(t => t.Amount),
            "category" => src.OrderBy(t => t.Category),
            _ => src.OrderByDescending(t => t.TransactionDate)
        };

        var sortedIncomes = Sort(incomeTx).ToList();
        var sortedExpenses = Sort(expenseTx).ToList();
        var incTotal = sortedIncomes.Sum(i => i.Amount);
        var expTotal = sortedExpenses.Sum(e => e.Amount);

        return new MonthlyOverviewDto(month, incTotal, expTotal, incTotal - expTotal, sortedIncomes, sortedExpenses);
    }

    public async Task<IEnumerable<TransactionDto>> SearchTransactionsAsync(Guid userId, string query, string? month, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(query)) return Enumerable.Empty<TransactionDto>();
        var incomes = string.IsNullOrWhiteSpace(month)
            ? await _incomes.GetByUserIdAsync(userId, ct)
            : await _incomes.GetByMonthAsync(userId, month, ct);
        var expenses = string.IsNullOrWhiteSpace(month)
            ? await _expenses.GetByUserIdAsync(userId, ct)
            : await _expenses.GetByMonthAsync(userId, month, ct);

        var q = query.Trim();
        var incTx = incomes.Where(i => i.Description.Contains(q, StringComparison.OrdinalIgnoreCase))
            .Select(i => new TransactionDto(i.Id, "Income", i.Description, i.Type.ToString(), i.Amount, i.TransactionDate));
        var expTx = expenses.Where(e => e.Description.Contains(q, StringComparison.OrdinalIgnoreCase))
            .Select(e => new TransactionDto(e.Id, "Expense", e.Description, e.Category.ToString(), e.Amount, e.TransactionDate));
        return incTx.Concat(expTx).OrderByDescending(t => t.TransactionDate);
    }

    // ===================== PROJECTIONS =====================
    public async Task<IEnumerable<ProjectionDto>> GetProjectionsAsync(Guid userId, int months = 4, CancellationToken ct = default)
    {
        if (months < 1) months = 4;
        var account = await _accounts.GetByUserIdAsync(userId, ct);
        var balance = account?.CurrentBalance ?? 0m;

        // Projeção mensal partindo do saldo atual + fluxo do mês corrente
        // (que ainda não foi refletido no saldo da conta).
        // Receitas/despesas fixas já se replicam automaticamente, então NÃO extrapolamos.
        var result = new List<ProjectionDto>();
        var startMonth = CurrentMonth();
        var todayInc = await ComputeMonthlyIncomeAsync(userId, startMonth, ct);
        var todayExp = await ComputeMonthlyExpenseAsync(userId, startMonth, ct);
        var running = balance + todayInc - todayExp;
        var previousProjection = balance;

        for (int i = 1; i <= months; i++)
        {
            var m = InvoiceMonthCalculator.AddMonths(startMonth, i);
            var projectedIncome = await ComputeMonthlyIncomeAsync(userId, m, ct);
            var projectedExpense = await ComputeMonthlyExpenseAsync(userId, m, ct);
            running = running + projectedIncome - projectedExpense;
            var trend = Comparison(running, previousProjection);
            previousProjection = running;
            result.Add(new ProjectionDto(m, projectedIncome, projectedExpense, running, trend));
        }
        return result;
    }

    public async Task<ProjectionAnalysisDto> GetProjectionAnalysisAsync(Guid userId, CancellationToken ct = default)
    {
        var projections = (await GetProjectionsAsync(userId, 4, ct)).ToList();
        var hasNegative = projections.Any(p => p.ProjectedBalance < 0);
        var trend = projections.Count >= 2 && projections.Last().ProjectedBalance > projections.First().ProjectedBalance
            ? "Up"
            : "Down";

        var suggestions = new List<string>();
        if (hasNegative)
        {
            suggestions.Add("Reduza despesas variáveis para evitar saldo negativo nos próximos meses.");
            suggestions.Add("Revise compras parceladas e considere quitar antecipadamente.");
        }
        if (trend == "Up")
        {
            suggestions.Add("Aproveite a tendência positiva para construir uma reserva de emergência.");
        }
        else
        {
            suggestions.Add("Avalie cortar gastos não essenciais para reverter a tendência negativa.");
        }

        var description = hasNegative
            ? "Atenção: pelo menos um dos próximos meses pode ficar com saldo negativo."
            : trend == "Up"
                ? "Sua projeção indica crescimento de saldo nos próximos meses."
                : "Sua projeção indica leve queda de saldo nos próximos meses.";

        return new ProjectionAnalysisDto(trend, description, hasNegative, suggestions);
    }

    // ===================== HELPERS =====================
    private static string NextMonth(string month) => InvoiceMonthCalculator.AddMonths(month, 1);

    private static DateTime ParseMonthAsDate(string month) =>
        DateTime.ParseExact(month + "-01", "yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture);

    private async Task<decimal> ComputeMonthlyIncomeAsync(Guid userId, string month, CancellationToken ct)
    {
        var regular = await _incomes.GetTotalByMonthAsync(userId, month, ct);
        var fixedTotal = await _fixedIncomes.GetTotalForMonthAsync(userId, month, ct);
        return regular + fixedTotal;
    }

    private async Task<decimal> ComputeMonthlyExpenseAsync(Guid userId, string month, CancellationToken ct)
    {
        var regular = await _expenses.GetTotalByMonthAsync(userId, month, ct);
        var fixedTotal = await _fixedExpenses.GetTotalForMonthAsync(userId, month, ct);
        var cardTotal = await ComputeCardInstallmentsForMonthAsync(userId, month, ct);
        return regular + fixedTotal + cardTotal;
    }

    private async Task<decimal> ComputeCardInstallmentsForMonthAsync(Guid userId, string month, CancellationToken ct)
    {
        var cards = (await _cards.GetByUserIdAsync(userId, ct)).ToList();
        if (cards.Count == 0) return 0m;
        var allPurchases = (await _purchases.GetByUserIdAsync(userId, ct)).ToList();
        decimal total = 0m;
        foreach (var card in cards)
        {
            var cardPurchases = allPurchases.Where(p => p.CreditCardId == card.Id);
            var lines = BuildInvoiceLines(cardPurchases, month);
            total += lines.Sum(l => l.InstallmentValue);
        }
        return total;
    }
}
