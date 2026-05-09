using AutoMapper;
using Monetra.Application.DTOs.Account;
using Monetra.Application.DTOs.Auth;
using Monetra.Application.DTOs.CreditCard;
using Monetra.Application.DTOs.Expense;
using Monetra.Application.DTOs.Income;
using Monetra.Domain.Entities;

namespace Monetra.Application.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<User, UserDto>();

        CreateMap<Domain.Entities.Account, AccountDto>();

        CreateMap<AccountBalanceHistory, AccountBalanceHistoryDto>();

        CreateMap<Domain.Entities.Income, IncomeDto>()
            .ForCtorParam(nameof(IncomeDto.Type), o => o.MapFrom(s => s.Type.ToString()));

        CreateMap<Domain.Entities.Expense, ExpenseDto>()
            .ForCtorParam(nameof(ExpenseDto.Category), o => o.MapFrom(s => s.Category.ToString()))
            .ForCtorParam(nameof(ExpenseDto.PaymentMethod), o => o.MapFrom(s => s.PaymentMethod.ToString()));

        CreateMap<Domain.Entities.CreditCard, CreditCardDto>();

        CreateMap<Domain.Entities.CreditCardPurchase, CreditCardPurchaseDto>()
            .ForCtorParam(nameof(CreditCardPurchaseDto.InstallmentValue),
                o => o.MapFrom(s => s.GetInstallmentValue()))
            .ForCtorParam(nameof(CreditCardPurchaseDto.FirstInvoiceMonth),
                o => o.MapFrom<string>(s => string.Empty));

        CreateMap<Domain.Entities.FixedExpense, FixedExpenseDto>()
            .ForCtorParam(nameof(FixedExpenseDto.Category), o => o.MapFrom(s => s.Category.ToString()))
            .ForCtorParam(nameof(FixedExpenseDto.PaymentMethod), o => o.MapFrom(s => s.PaymentMethod.ToString()));

        CreateMap<Domain.Entities.FixedIncome, FixedIncomeDto>()
            .ForCtorParam(nameof(FixedIncomeDto.Type), o => o.MapFrom(s => s.Type.ToString()));
    }
}
