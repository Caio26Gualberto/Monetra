using Monetra.Application.Common.Exceptions;
using Monetra.Application.DTOs.Dashboard;
using Monetra.Domain.Entities;
using Monetra.Domain.Enums;

namespace Monetra.Application.Services;

public partial class FinancialService
{
    // ===================== DASHBOARD =====================
    public async Task<DashboardSummaryDto> GetDashboardSummaryAsync(Guid userId, string? month, CancellationToken ct = default)
    {
        var m = string.IsNullOrWhiteSpace(month) ? CurrentMonth() : month;
        var account = await _accounts.GetByUserIdAsync(userId, ct);
        var balance = account?.CurrentBalance ?? 0m;

        var monthlyIncome = await _incomes.GetTotalByMonthAsync(userId, m, ct);
        var monthlyExpense = await _expenses.GetTotalByMonthAsync(userId, m, ct);
        var prev = PreviousMonth(m);
        var prevIncome = await _incomes.GetTotalByMonthAsync(userId, prev, ct);
        var prevExpense = await _expenses.GetTotalByMonthAsync(userId, prev, ct);

        var salaryNext = await _incomes.GetTotalByMonthAndTypeAsync(userId, m, IncomeType.Salary, ct);
        var pending = await _purchases.GetPendingInstallmentsByUserAsync(userId, ct);
        var nextMonthInstallments = pending.Sum(p => p.GetInstallmentValue());

        var projected = balance + salaryNext - nextMonthInstallments;

        var recent = await GetRecentTransactionsAsync(userId, ct);

        return new DashboardSummaryDto(
            balance,
            monthlyIncome,
            monthlyExpense,
            projected,
            Comparison(monthlyIncome, prevIncome),
            Comparison(monthlyExpense, prevExpense),
            recent
        );
    }

    public async Task<IEnumerable<EvolutionPointDto>> GetEvolutionAsync(Guid userId, int months, CancellationToken ct = default)
    {
        if (months < 1) months = 6;
        var result = new List<EvolutionPointDto>();
        var now = DateTime.UtcNow;
        for (int i = months - 1; i >= 0; i--)
        {
            var dt = now.AddMonths(-i);
            var m = dt.ToString("yyyy-MM");
            var inc = await _incomes.GetTotalByMonthAsync(userId, m, ct);
            var exp = await _expenses.GetTotalByMonthAsync(userId, m, ct);
            result.Add(new EvolutionPointDto(m, inc, exp));
        }
        return result;
    }

    public async Task<IEnumerable<CategoryDistributionDto>> GetDistributionAsync(Guid userId, string month, CancellationToken ct = default)
    {
        var dict = await _expenses.GetTotalByCategoryAsync(userId, month, ct);
        var total = dict.Sum(kv => kv.Value);
        return dict.Select(kv => new CategoryDistributionDto(
            kv.Key.ToString(),
            kv.Value,
            total == 0 ? 0 : Math.Round(kv.Value / total * 100m, 2)
        ));
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

        var incomeTx = incomes.Select(i => new TransactionDto(
            i.Id, "Income", i.Description, i.Type.ToString(), i.Amount, i.TransactionDate)).ToList();
        var expenseTx = expenses.Select(e => new TransactionDto(
            e.Id, "Expense", e.Description, e.Category.ToString(), e.Amount, e.TransactionDate)).ToList();

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
        var current = CurrentMonth();
        var salary = await _incomes.GetTotalByMonthAndTypeAsync(userId, current, IncomeType.Salary, ct);
        var pending = (await _purchases.GetPendingInstallmentsByUserAsync(userId, ct)).ToList();

        var result = new List<ProjectionDto>();
        var running = balance;
        decimal previousProjection = balance;

        for (int i = 1; i <= months; i++)
        {
            var dt = DateTime.UtcNow.AddMonths(i);
            var m = dt.ToString("yyyy-MM");
            var monthInstallments = pending
                .Where(p => p.GetRemainingInstallments() >= i)
                .Sum(p => p.GetInstallmentValue());

            var projectedIncome = salary;
            var projectedExpense = monthInstallments;
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
}
