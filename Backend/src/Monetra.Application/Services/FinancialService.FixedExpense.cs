using Monetra.Application.Common.Exceptions;
using Monetra.Application.DTOs.Expense;
using Monetra.Domain.Entities;

namespace Monetra.Application.Services;

public partial class FinancialService
{
    public async Task<FixedExpenseDto> CreateFixedExpenseAsync(Guid userId, CreateFixedExpenseDto dto, CancellationToken ct = default)
    {
        var fe = new FixedExpense(userId, dto.Description, dto.Amount, ParseCategory(dto.Category), ParsePaymentMethod(dto.PaymentMethod), dto.StartMonth);
        await _fixedExpenses.AddAsync(fe, ct);
        return _mapper.Map<FixedExpenseDto>(fe);
    }

    public async Task<IEnumerable<FixedExpenseDto>> GetFixedExpensesAsync(Guid userId, CancellationToken ct = default)
    {
        var list = await _fixedExpenses.GetByUserIdAsync(userId, ct);
        return list.Select(x => _mapper.Map<FixedExpenseDto>(x));
    }

    public async Task<IEnumerable<FixedExpenseDto>> GetFixedExpensesForMonthAsync(Guid userId, string month, CancellationToken ct = default)
    {
        var list = await _fixedExpenses.GetActiveForMonthAsync(userId, month, ct);
        return list.Select(x => _mapper.Map<FixedExpenseDto>(x));
    }

    public async Task UpdateFixedExpenseAsync(Guid userId, Guid id, UpdateFixedExpenseDto dto, CancellationToken ct = default)
    {
        var fe = await _fixedExpenses.GetByIdAsync(id, ct)
                 ?? throw new NotFoundException("Fixed expense not found.");
        if (fe.UserId != userId) throw new UnauthorizedException("Forbidden.");
        fe.Update(dto.Description, dto.Amount, ParseCategory(dto.Category), ParsePaymentMethod(dto.PaymentMethod), dto.StartMonth);
        await _fixedExpenses.UpdateAsync(fe, ct);
    }

    public async Task DeleteFixedExpenseAsync(Guid userId, Guid id, CancellationToken ct = default)
    {
        var fe = await _fixedExpenses.GetByIdAsync(id, ct)
                 ?? throw new NotFoundException("Fixed expense not found.");
        if (fe.UserId != userId) throw new UnauthorizedException("Forbidden.");
        await _fixedExpenses.DeleteAsync(id, ct);
    }
}
