namespace Monetra.Application.DTOs.Expense;

public record FixedExpenseDto(
    Guid Id,
    string Description,
    decimal Amount,
    string Category,
    string PaymentMethod,
    string StartMonth
);

public record CreateFixedExpenseDto(
    string Description,
    decimal Amount,
    string Category,
    string PaymentMethod,
    string StartMonth
);

public record UpdateFixedExpenseDto(
    string Description,
    decimal Amount,
    string Category,
    string PaymentMethod,
    string StartMonth
);
