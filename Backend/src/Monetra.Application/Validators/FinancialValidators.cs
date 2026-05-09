using FluentValidation;
using Monetra.Application.DTOs.Account;
using Monetra.Application.DTOs.CreditCard;
using Monetra.Application.DTOs.Expense;
using Monetra.Application.DTOs.Income;

namespace Monetra.Application.Validators;

public class UpdateAccountBalanceDtoValidator : AbstractValidator<UpdateAccountBalanceDto>
{
    public UpdateAccountBalanceDtoValidator()
    {
        RuleFor(x => x.NewBalance).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Notes).MaximumLength(255);
    }
}

public class CreateIncomeDtoValidator : AbstractValidator<CreateIncomeDto>
{
    public CreateIncomeDtoValidator()
    {
        RuleFor(x => x.Type).NotEmpty().Must(t => t == "Salary" || t == "Freelance");
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(255);
        RuleFor(x => x.TransactionDate).NotEmpty();
    }
}

public class UpdateIncomeDtoValidator : AbstractValidator<UpdateIncomeDto>
{
    public UpdateIncomeDtoValidator()
    {
        RuleFor(x => x.Type).NotEmpty();
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(255);
    }
}

public class CreateExpenseDtoValidator : AbstractValidator<CreateExpenseDto>
{
    public CreateExpenseDtoValidator()
    {
        RuleFor(x => x.Category).NotEmpty();
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.PaymentMethod).NotEmpty().Must(m => m == "Debit" || m == "Pix");
        RuleFor(x => x.Description).NotEmpty().MaximumLength(255);
        RuleFor(x => x.TransactionDate).NotEmpty();
    }
}

public class UpdateExpenseDtoValidator : AbstractValidator<UpdateExpenseDto>
{
    public UpdateExpenseDtoValidator()
    {
        RuleFor(x => x.Category).NotEmpty();
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.PaymentMethod).NotEmpty();
        RuleFor(x => x.Description).NotEmpty().MaximumLength(255);
    }
}

public class CreateCreditCardDtoValidator : AbstractValidator<CreateCreditCardDto>
{
    public CreateCreditCardDtoValidator()
    {
        RuleFor(x => x.CardName).NotEmpty().MaximumLength(80);
        RuleFor(x => x.ClosingDay).InclusiveBetween(1, 31);
        RuleFor(x => x.DueDay).InclusiveBetween(1, 31);
    }
}

public class UpdateCreditCardDtoValidator : AbstractValidator<UpdateCreditCardDto>
{
    public UpdateCreditCardDtoValidator()
    {
        RuleFor(x => x.CardName).NotEmpty().MaximumLength(80);
        RuleFor(x => x.ClosingDay).InclusiveBetween(1, 31);
        RuleFor(x => x.DueDay).InclusiveBetween(1, 31);
    }
}

public class CreatePurchaseDtoValidator : AbstractValidator<CreatePurchaseDto>
{
    public CreatePurchaseDtoValidator()
    {
        RuleFor(x => x.Description).NotEmpty().MaximumLength(255);
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.TotalInstallments).InclusiveBetween(1, 24);
        RuleFor(x => x.CurrentInstallment).GreaterThanOrEqualTo(1);
        RuleFor(x => x).Must(d => d.CurrentInstallment <= d.TotalInstallments)
            .WithMessage("CurrentInstallment must be less than or equal to TotalInstallments.");
        RuleFor(x => x.PurchaseDate).NotEmpty();
    }
}

public class UpdatePurchaseDtoValidator : AbstractValidator<UpdatePurchaseDto>
{
    public UpdatePurchaseDtoValidator()
    {
        RuleFor(x => x.Description).NotEmpty().MaximumLength(255);
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.TotalInstallments).InclusiveBetween(1, 24);
        RuleFor(x => x.CurrentInstallment).GreaterThanOrEqualTo(1);
        RuleFor(x => x).Must(d => d.CurrentInstallment <= d.TotalInstallments)
            .WithMessage("CurrentInstallment must be less than or equal to TotalInstallments.");
    }
}
