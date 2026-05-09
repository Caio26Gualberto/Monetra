namespace Monetra.Application.DTOs.Account;

public record AccountDto(Guid Id, decimal CurrentBalance, DateTime UpdatedAt);

public record UpdateAccountBalanceDto(decimal NewBalance, string? Notes);

public record AccountBalanceHistoryDto(
    Guid Id,
    decimal PreviousBalance,
    decimal NewBalance,
    string? Notes,
    DateTime CreatedAt
);
