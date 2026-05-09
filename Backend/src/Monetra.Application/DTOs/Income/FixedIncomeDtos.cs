namespace Monetra.Application.DTOs.Income;

public record FixedIncomeDto(
    Guid Id,
    string Description,
    decimal Amount,
    string Type,
    string StartMonth
);

public record CreateFixedIncomeDto(
    string Description,
    decimal Amount,
    string Type,
    string StartMonth
);

public record UpdateFixedIncomeDto(
    string Description,
    decimal Amount,
    string Type,
    string StartMonth
);
