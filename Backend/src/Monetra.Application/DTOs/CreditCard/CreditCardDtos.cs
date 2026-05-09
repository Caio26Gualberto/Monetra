namespace Monetra.Application.DTOs.CreditCard;

public record CreditCardDto(
    Guid Id,
    string CardName,
    int ClosingDay,
    int DueDay
);

public record CreateCreditCardDto(
    string CardName,
    int ClosingDay,
    int DueDay
);

public record UpdateCreditCardDto(
    string CardName,
    int ClosingDay,
    int DueDay
);

public record CreditCardPurchaseDto(
    Guid Id,
    Guid CreditCardId,
    string Description,
    decimal Amount,
    int TotalInstallments,
    int CurrentInstallment,
    decimal InstallmentValue,
    DateTime PurchaseDate,
    string FirstInvoiceMonth
);

public record CreatePurchaseDto(
    string Description,
    decimal Amount,
    int TotalInstallments,
    int CurrentInstallment,
    DateTime PurchaseDate
);

public record UpdatePurchaseDto(
    string Description,
    decimal Amount,
    int TotalInstallments,
    int CurrentInstallment,
    DateTime PurchaseDate
);

public record InvoiceLineDto(
    Guid PurchaseId,
    string Description,
    int InstallmentNumber,
    int TotalInstallments,
    decimal InstallmentValue,
    DateTime PurchaseDate
);

public record CreditCardInvoiceDto(
    Guid CreditCardId,
    string CardName,
    string Month,
    DateTime DueDate,
    decimal TotalAmount,
    bool IsPaid,
    IReadOnlyList<InvoiceLineDto> Lines
);

public record CreditCardSummaryDto(
    string Month,
    decimal TotalAmount,
    int CardCount,
    decimal PendingInstallmentsTotal,
    int PendingInstallmentsCount
);
