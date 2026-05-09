namespace Monetra.Application.DTOs.Income;

public record IncomeDto(
    Guid Id,
    string Type,
    decimal Amount,
    string Description,
    DateTime TransactionDate
);

public record CreateIncomeDto(
    string Type,
    decimal Amount,
    string Description,
    DateTime TransactionDate
);

public record UpdateIncomeDto(
    string Type,
    decimal Amount,
    string Description,
    DateTime TransactionDate
);

public record IncomeSummaryDto(
    string Month,
    decimal Total,
    decimal SalaryTotal,
    decimal FreelanceTotal,
    decimal PreviousMonthTotal,
    decimal ComparisonPercentage,
    decimal DailyAverage
);
