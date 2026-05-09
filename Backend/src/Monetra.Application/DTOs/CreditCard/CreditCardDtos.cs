namespace Monetra.Application.DTOs.CreditCard;

public record CreditCardDto(
    Guid Id,
    string CardName,
    decimal TotalAmount,
    DateTime DueDate,
    string Month,
    bool IsPaid
);

public record CreateCreditCardDto(
    string CardName,
    decimal TotalAmount,
    DateTime DueDate,
    string Month
);

public record UpdateCreditCardDto(
    string CardName,
    decimal TotalAmount,
    DateTime DueDate,
    string Month
);

public record CreditCardPurchaseDto(
    Guid Id,
    Guid CreditCardId,
    string Description,
    decimal Amount,
    int TotalInstallments,
    int CurrentInstallment,
    decimal InstallmentValue,
    DateTime PurchaseDate
);

public record CreatePurchaseDto(
    string Description,
    decimal Amount,
    int TotalInstallments,
    DateTime PurchaseDate
);

public record UpdatePurchaseDto(
    string Description,
    decimal Amount,
    int TotalInstallments,
    DateTime PurchaseDate
);

public record CreditCardSummaryDto(
    string Month,
    decimal TotalAmount,
    int CardCount,
    decimal PendingInstallmentsTotal,
    int PendingInstallmentsCount
);
