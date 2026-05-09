namespace Monetra.Application.DTOs.Expense;

public record ExpenseDto(
    Guid Id,
    string Category,
    decimal Amount,
    string PaymentMethod,
    string Description,
    DateTime TransactionDate
);

public record CreateExpenseDto(
    string Category,
    decimal Amount,
    string PaymentMethod,
    string Description,
    DateTime TransactionDate
);

public record UpdateExpenseDto(
    string Category,
    decimal Amount,
    string PaymentMethod,
    string Description,
    DateTime TransactionDate
);

public record CategoryTotalDto(string Category, decimal Total, decimal Percentage);

public record ExpenseSummaryDto(
    string Month,
    decimal Total,
    decimal PreviousMonthTotal,
    decimal ComparisonPercentage,
    IEnumerable<CategoryTotalDto> ByCategory
);
