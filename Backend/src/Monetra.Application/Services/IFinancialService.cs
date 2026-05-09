using Monetra.Application.DTOs.Account;
using Monetra.Application.DTOs.CreditCard;
using Monetra.Application.DTOs.Dashboard;
using Monetra.Application.DTOs.Expense;
using Monetra.Application.DTOs.Income;

namespace Monetra.Application.Services;

public interface IFinancialService
{
    // Account
    Task<AccountDto> GetAccountAsync(Guid userId, CancellationToken ct = default);
    Task UpdateAccountBalanceAsync(Guid userId, UpdateAccountBalanceDto dto, CancellationToken ct = default);
    Task<IEnumerable<AccountBalanceHistoryDto>> GetAccountHistoryAsync(Guid userId, CancellationToken ct = default);

    // Income
    Task<IncomeDto> CreateIncomeAsync(Guid userId, CreateIncomeDto dto, CancellationToken ct = default);
    Task<IEnumerable<IncomeDto>> GetIncomesAsync(Guid userId, CancellationToken ct = default);
    Task<IEnumerable<IncomeDto>> GetIncomesByMonthAsync(Guid userId, string month, CancellationToken ct = default);
    Task<IEnumerable<IncomeDto>> GetIncomesByTypeAsync(Guid userId, string type, CancellationToken ct = default);
    Task UpdateIncomeAsync(Guid userId, Guid incomeId, UpdateIncomeDto dto, CancellationToken ct = default);
    Task DeleteIncomeAsync(Guid userId, Guid incomeId, CancellationToken ct = default);
    Task<IncomeSummaryDto> GetIncomeSummaryAsync(Guid userId, string month, CancellationToken ct = default);

    // Expense
    Task<ExpenseDto> CreateExpenseAsync(Guid userId, CreateExpenseDto dto, CancellationToken ct = default);
    Task<IEnumerable<ExpenseDto>> GetExpensesAsync(Guid userId, CancellationToken ct = default);
    Task<IEnumerable<ExpenseDto>> GetExpensesByMonthAsync(Guid userId, string month, CancellationToken ct = default);
    Task<IEnumerable<ExpenseDto>> GetExpensesByCategoryAsync(Guid userId, string category, CancellationToken ct = default);
    Task<IEnumerable<ExpenseDto>> GetExpensesByMethodAsync(Guid userId, string method, CancellationToken ct = default);
    Task UpdateExpenseAsync(Guid userId, Guid expenseId, UpdateExpenseDto dto, CancellationToken ct = default);
    Task DeleteExpenseAsync(Guid userId, Guid expenseId, CancellationToken ct = default);
    Task<ExpenseSummaryDto> GetExpenseSummaryAsync(Guid userId, string month, CancellationToken ct = default);
    Task<IEnumerable<CategoryTotalDto>> GetExpensesByCategoryBreakdownAsync(Guid userId, string month, CancellationToken ct = default);

    // Credit Card
    Task<CreditCardDto> CreateCreditCardAsync(Guid userId, CreateCreditCardDto dto, CancellationToken ct = default);
    Task<IEnumerable<CreditCardDto>> GetCreditCardsAsync(Guid userId, CancellationToken ct = default);
    Task<CreditCardDto> GetCreditCardAsync(Guid userId, Guid cardId, CancellationToken ct = default);
    Task<IEnumerable<CreditCardDto>> GetCreditCardsByMonthAsync(Guid userId, string month, CancellationToken ct = default);
    Task UpdateCreditCardAsync(Guid userId, Guid cardId, UpdateCreditCardDto dto, CancellationToken ct = default);
    Task MarkCreditCardAsPaidAsync(Guid userId, Guid cardId, CancellationToken ct = default);
    Task DeleteCreditCardAsync(Guid userId, Guid cardId, CancellationToken ct = default);

    // Credit Card Purchases
    Task<CreditCardPurchaseDto> CreatePurchaseAsync(Guid userId, Guid cardId, CreatePurchaseDto dto, CancellationToken ct = default);
    Task<IEnumerable<CreditCardPurchaseDto>> GetPurchasesAsync(Guid userId, Guid cardId, CancellationToken ct = default);
    Task<IEnumerable<CreditCardPurchaseDto>> GetPurchasesByMonthAsync(Guid userId, Guid cardId, string month, CancellationToken ct = default);
    Task UpdatePurchaseAsync(Guid userId, Guid purchaseId, UpdatePurchaseDto dto, CancellationToken ct = default);
    Task DeletePurchaseAsync(Guid userId, Guid purchaseId, CancellationToken ct = default);
    Task<CreditCardSummaryDto> GetCreditCardSummaryAsync(Guid userId, string month, CancellationToken ct = default);
    Task<IEnumerable<CreditCardPurchaseDto>> GetPendingInstallmentsAsync(Guid userId, CancellationToken ct = default);

    // Dashboard
    Task<DashboardSummaryDto> GetDashboardSummaryAsync(Guid userId, string? month, CancellationToken ct = default);
    Task<IEnumerable<EvolutionPointDto>> GetEvolutionAsync(Guid userId, int months, CancellationToken ct = default);
    Task<IEnumerable<CategoryDistributionDto>> GetDistributionAsync(Guid userId, string month, CancellationToken ct = default);
    Task<IEnumerable<TransactionDto>> GetRecentTransactionsAsync(Guid userId, CancellationToken ct = default);

    // Monthly view
    Task<MonthlyOverviewDto> GetMonthlyOverviewAsync(Guid userId, string month, string? type, string? category, string? sort, CancellationToken ct = default);
    Task<IEnumerable<TransactionDto>> SearchTransactionsAsync(Guid userId, string query, string? month, CancellationToken ct = default);

    // Projections
    Task<IEnumerable<ProjectionDto>> GetProjectionsAsync(Guid userId, int months = 4, CancellationToken ct = default);
    Task<ProjectionAnalysisDto> GetProjectionAnalysisAsync(Guid userId, CancellationToken ct = default);
}
