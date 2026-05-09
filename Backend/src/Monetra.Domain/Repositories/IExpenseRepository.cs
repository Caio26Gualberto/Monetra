using Monetra.Domain.Entities;
using Monetra.Domain.Enums;

namespace Monetra.Domain.Repositories;

public interface IExpenseRepository : IRepository<Expense>
{
    Task<IEnumerable<Expense>> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task<IEnumerable<Expense>> GetByMonthAsync(Guid userId, string month, CancellationToken ct = default);
    Task<IEnumerable<Expense>> GetByCategoryAsync(Guid userId, ExpenseCategory category, CancellationToken ct = default);
    Task<IEnumerable<Expense>> GetByPaymentMethodAsync(Guid userId, PaymentMethod method, CancellationToken ct = default);
    Task<decimal> GetTotalByMonthAsync(Guid userId, string month, CancellationToken ct = default);
    Task<IDictionary<ExpenseCategory, decimal>> GetTotalByCategoryAsync(Guid userId, string month, CancellationToken ct = default);
}
