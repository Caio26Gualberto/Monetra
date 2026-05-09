using AutoMapper;
using Monetra.Application.Common.Exceptions;
using Monetra.Application.DTOs.Account;
using Monetra.Application.DTOs.CreditCard;
using Monetra.Application.DTOs.Dashboard;
using Monetra.Application.DTOs.Expense;
using Monetra.Application.DTOs.Income;
using Monetra.Domain.Entities;
using Monetra.Domain.Enums;
using Monetra.Domain.Repositories;

namespace Monetra.Application.Services;

public partial class FinancialService : IFinancialService
{
    private readonly IAccountRepository _accounts;
    private readonly IIncomeRepository _incomes;
    private readonly IExpenseRepository _expenses;
    private readonly ICreditCardRepository _cards;
    private readonly ICreditCardPurchaseRepository _purchases;
    private readonly ICreditCardInvoicePaymentRepository _invoicePayments;
    private readonly IFixedExpenseRepository _fixedExpenses;
    private readonly IFixedIncomeRepository _fixedIncomes;
    private readonly IMapper _mapper;

    public FinancialService(
        IAccountRepository accounts,
        IIncomeRepository incomes,
        IExpenseRepository expenses,
        ICreditCardRepository cards,
        ICreditCardPurchaseRepository purchases,
        ICreditCardInvoicePaymentRepository invoicePayments,
        IFixedExpenseRepository fixedExpenses,
        IFixedIncomeRepository fixedIncomes,
        IMapper mapper)
    {
        _accounts = accounts;
        _incomes = incomes;
        _expenses = expenses;
        _cards = cards;
        _purchases = purchases;
        _invoicePayments = invoicePayments;
        _fixedExpenses = fixedExpenses;
        _fixedIncomes = fixedIncomes;
        _mapper = mapper;
    }

    private static string CurrentMonth() => DateTime.UtcNow.ToString("yyyy-MM");

    private static string PreviousMonth(string month)
    {
        var dt = DateTime.ParseExact(month, "yyyy-MM", System.Globalization.CultureInfo.InvariantCulture);
        return dt.AddMonths(-1).ToString("yyyy-MM");
    }

    private static decimal Comparison(decimal current, decimal previous)
    {
        if (previous == 0) return current == 0 ? 0 : 100m;
        return Math.Round((current - previous) / previous * 100m, 2);
    }

    private static IncomeType ParseIncomeType(string type) =>
        Enum.TryParse<IncomeType>(type, true, out var v) ? v : throw new AppException($"Invalid income type: {type}");

    private static ExpenseCategory ParseCategory(string category) =>
        Enum.TryParse<ExpenseCategory>(category, true, out var v) ? v : throw new AppException($"Invalid expense category: {category}");

    private static PaymentMethod ParsePaymentMethod(string method) =>
        Enum.TryParse<PaymentMethod>(method, true, out var v) ? v : throw new AppException($"Invalid payment method: {method}");

    // ===================== ACCOUNT =====================
    public async Task<AccountDto> GetAccountAsync(Guid userId, CancellationToken ct = default)
    {
        var account = await _accounts.GetByUserIdAsync(userId, ct)
                      ?? throw new NotFoundException("Account not found.");
        return _mapper.Map<AccountDto>(account);
    }

    public async Task UpdateAccountBalanceAsync(Guid userId, UpdateAccountBalanceDto dto, CancellationToken ct = default)
    {
        var account = await _accounts.GetByUserIdAsync(userId, ct)
                      ?? throw new NotFoundException("Account not found.");
        var previous = account.CurrentBalance;
        account.SetBalance(dto.NewBalance);
        await _accounts.UpdateAsync(account, ct);
        await _accounts.AddHistoryAsync(new AccountBalanceHistory(account.Id, previous, dto.NewBalance, dto.Notes), ct);
    }

    public async Task<IEnumerable<AccountBalanceHistoryDto>> GetAccountHistoryAsync(Guid userId, CancellationToken ct = default)
    {
        var account = await _accounts.GetByUserIdAsync(userId, ct)
                      ?? throw new NotFoundException("Account not found.");
        var history = await _accounts.GetHistoryAsync(account.Id, ct);
        return history.Select(h => _mapper.Map<AccountBalanceHistoryDto>(h));
    }

    // ===================== INCOME =====================
    public async Task<IncomeDto> CreateIncomeAsync(Guid userId, CreateIncomeDto dto, CancellationToken ct = default)
    {
        var income = new Income(userId, ParseIncomeType(dto.Type), dto.Amount, dto.Description, dto.TransactionDate);
        await _incomes.AddAsync(income, ct);
        return _mapper.Map<IncomeDto>(income);
    }

    public async Task<IEnumerable<IncomeDto>> GetIncomesAsync(Guid userId, CancellationToken ct = default)
    {
        var list = await _incomes.GetByUserIdAsync(userId, ct);
        return list.Select(i => _mapper.Map<IncomeDto>(i));
    }

    public async Task<IEnumerable<IncomeDto>> GetIncomesByMonthAsync(Guid userId, string month, CancellationToken ct = default)
    {
        var list = await _incomes.GetByMonthAsync(userId, month, ct);
        return list.Select(i => _mapper.Map<IncomeDto>(i));
    }

    public async Task<IEnumerable<IncomeDto>> GetIncomesByTypeAsync(Guid userId, string type, CancellationToken ct = default)
    {
        var list = await _incomes.GetByTypeAsync(userId, ParseIncomeType(type), ct);
        return list.Select(i => _mapper.Map<IncomeDto>(i));
    }

    public async Task UpdateIncomeAsync(Guid userId, Guid incomeId, UpdateIncomeDto dto, CancellationToken ct = default)
    {
        var income = await _incomes.GetByIdAsync(incomeId, ct)
                     ?? throw new NotFoundException("Income not found.");
        if (income.UserId != userId) throw new UnauthorizedException("Forbidden.");
        income.Update(ParseIncomeType(dto.Type), dto.Amount, dto.Description, dto.TransactionDate);
        await _incomes.UpdateAsync(income, ct);
    }

    public async Task DeleteIncomeAsync(Guid userId, Guid incomeId, CancellationToken ct = default)
    {
        var income = await _incomes.GetByIdAsync(incomeId, ct)
                     ?? throw new NotFoundException("Income not found.");
        if (income.UserId != userId) throw new UnauthorizedException("Forbidden.");
        await _incomes.DeleteAsync(incomeId, ct);
    }

    public async Task<IncomeSummaryDto> GetIncomeSummaryAsync(Guid userId, string month, CancellationToken ct = default)
    {
        var total = await _incomes.GetTotalByMonthAsync(userId, month, ct);
        var salary = await _incomes.GetTotalByMonthAndTypeAsync(userId, month, IncomeType.Salary, ct);
        var freelance = await _incomes.GetTotalByMonthAndTypeAsync(userId, month, IncomeType.Freelance, ct);
        var prev = await _incomes.GetTotalByMonthAsync(userId, PreviousMonth(month), ct);
        var daysInMonth = DateTime.DaysInMonth(int.Parse(month[..4]), int.Parse(month[5..]));
        var avg = daysInMonth == 0 ? 0 : Math.Round(total / daysInMonth, 2);
        return new IncomeSummaryDto(month, total, salary, freelance, prev, Comparison(total, prev), avg);
    }

    // ===================== EXPENSE =====================
    public async Task<ExpenseDto> CreateExpenseAsync(Guid userId, CreateExpenseDto dto, CancellationToken ct = default)
    {
        var expense = new Expense(userId, ParseCategory(dto.Category), dto.Amount, ParsePaymentMethod(dto.PaymentMethod), dto.Description, dto.TransactionDate);
        await _expenses.AddAsync(expense, ct);
        return _mapper.Map<ExpenseDto>(expense);
    }

    public async Task<IEnumerable<ExpenseDto>> GetExpensesAsync(Guid userId, CancellationToken ct = default)
    {
        var list = await _expenses.GetByUserIdAsync(userId, ct);
        return list.Select(e => _mapper.Map<ExpenseDto>(e));
    }

    public async Task<IEnumerable<ExpenseDto>> GetExpensesByMonthAsync(Guid userId, string month, CancellationToken ct = default)
    {
        var list = await _expenses.GetByMonthAsync(userId, month, ct);
        return list.Select(e => _mapper.Map<ExpenseDto>(e));
    }

    public async Task<IEnumerable<ExpenseDto>> GetExpensesByCategoryAsync(Guid userId, string category, CancellationToken ct = default)
    {
        var list = await _expenses.GetByCategoryAsync(userId, ParseCategory(category), ct);
        return list.Select(e => _mapper.Map<ExpenseDto>(e));
    }

    public async Task<IEnumerable<ExpenseDto>> GetExpensesByMethodAsync(Guid userId, string method, CancellationToken ct = default)
    {
        var list = await _expenses.GetByPaymentMethodAsync(userId, ParsePaymentMethod(method), ct);
        return list.Select(e => _mapper.Map<ExpenseDto>(e));
    }

    public async Task UpdateExpenseAsync(Guid userId, Guid expenseId, UpdateExpenseDto dto, CancellationToken ct = default)
    {
        var expense = await _expenses.GetByIdAsync(expenseId, ct)
                      ?? throw new NotFoundException("Expense not found.");
        if (expense.UserId != userId) throw new UnauthorizedException("Forbidden.");
        expense.Update(ParseCategory(dto.Category), dto.Amount, ParsePaymentMethod(dto.PaymentMethod), dto.Description, dto.TransactionDate);
        await _expenses.UpdateAsync(expense, ct);
    }

    public async Task DeleteExpenseAsync(Guid userId, Guid expenseId, CancellationToken ct = default)
    {
        var expense = await _expenses.GetByIdAsync(expenseId, ct)
                      ?? throw new NotFoundException("Expense not found.");
        if (expense.UserId != userId) throw new UnauthorizedException("Forbidden.");
        await _expenses.DeleteAsync(expenseId, ct);
    }

    public async Task<ExpenseSummaryDto> GetExpenseSummaryAsync(Guid userId, string month, CancellationToken ct = default)
    {
        var total = await _expenses.GetTotalByMonthAsync(userId, month, ct);
        var prev = await _expenses.GetTotalByMonthAsync(userId, PreviousMonth(month), ct);
        var byCat = await BuildCategoryBreakdown(userId, month, total, ct);
        return new ExpenseSummaryDto(month, total, prev, Comparison(total, prev), byCat);
    }

    public async Task<IEnumerable<CategoryTotalDto>> GetExpensesByCategoryBreakdownAsync(Guid userId, string month, CancellationToken ct = default)
    {
        var total = await _expenses.GetTotalByMonthAsync(userId, month, ct);
        return await BuildCategoryBreakdown(userId, month, total, ct);
    }

    private async Task<IEnumerable<CategoryTotalDto>> BuildCategoryBreakdown(Guid userId, string month, decimal total, CancellationToken ct)
    {
        var dict = await _expenses.GetTotalByCategoryAsync(userId, month, ct);
        return dict.Select(kv => new CategoryTotalDto(
            kv.Key.ToString(),
            kv.Value,
            total == 0 ? 0 : Math.Round(kv.Value / total * 100m, 2)
        )).ToList();
    }
}
