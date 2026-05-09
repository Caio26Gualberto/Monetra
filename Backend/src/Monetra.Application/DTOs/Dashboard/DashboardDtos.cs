namespace Monetra.Application.DTOs.Dashboard;

public record TransactionDto(
    Guid Id,
    string Type,
    string Description,
    string Category,
    decimal Amount,
    DateTime TransactionDate
);

public record DashboardSummaryDto(
    decimal CurrentBalance,
    decimal MonthlyIncome,
    decimal MonthlyExpense,
    decimal ProjectedBalance,
    decimal IncomeComparison,
    decimal ExpenseComparison,
    IEnumerable<TransactionDto> RecentTransactions
);

public record EvolutionPointDto(string Month, decimal Income, decimal Expense);

public record CategoryDistributionDto(string Category, decimal Total, decimal Percentage);

public record ProjectionDto(
    string Month,
    decimal ProjectedIncome,
    decimal ProjectedExpense,
    decimal ProjectedBalance,
    decimal Trend
);

public record ProjectionAnalysisDto(
    string Trend,
    string Description,
    bool HasNegativeProjection,
    IEnumerable<string> Suggestions
);

public record MonthlyOverviewDto(
    string Month,
    decimal IncomeTotal,
    decimal ExpenseTotal,
    decimal Balance,
    IEnumerable<TransactionDto> Incomes,
    IEnumerable<TransactionDto> Expenses
);
