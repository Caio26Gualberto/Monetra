using Monetra.Application.Common.Exceptions;
using Monetra.Application.DTOs.Income;
using Monetra.Domain.Entities;

namespace Monetra.Application.Services;

public partial class FinancialService
{
    public async Task<FixedIncomeDto> CreateFixedIncomeAsync(Guid userId, CreateFixedIncomeDto dto, CancellationToken ct = default)
    {
        var fi = new FixedIncome(userId, dto.Description, dto.Amount, ParseIncomeType(dto.Type), dto.StartMonth);
        await _fixedIncomes.AddAsync(fi, ct);
        return _mapper.Map<FixedIncomeDto>(fi);
    }

    public async Task<IEnumerable<FixedIncomeDto>> GetFixedIncomesAsync(Guid userId, CancellationToken ct = default)
    {
        var list = await _fixedIncomes.GetByUserIdAsync(userId, ct);
        return list.Select(x => _mapper.Map<FixedIncomeDto>(x));
    }

    public async Task<IEnumerable<FixedIncomeDto>> GetFixedIncomesForMonthAsync(Guid userId, string month, CancellationToken ct = default)
    {
        var list = await _fixedIncomes.GetActiveForMonthAsync(userId, month, ct);
        return list.Select(x => _mapper.Map<FixedIncomeDto>(x));
    }

    public async Task UpdateFixedIncomeAsync(Guid userId, Guid id, UpdateFixedIncomeDto dto, CancellationToken ct = default)
    {
        var fi = await _fixedIncomes.GetByIdAsync(id, ct)
                 ?? throw new NotFoundException("Fixed income not found.");
        if (fi.UserId != userId) throw new UnauthorizedException("Forbidden.");
        fi.Update(dto.Description, dto.Amount, ParseIncomeType(dto.Type), dto.StartMonth);
        await _fixedIncomes.UpdateAsync(fi, ct);
    }

    public async Task DeleteFixedIncomeAsync(Guid userId, Guid id, CancellationToken ct = default)
    {
        var fi = await _fixedIncomes.GetByIdAsync(id, ct)
                 ?? throw new NotFoundException("Fixed income not found.");
        if (fi.UserId != userId) throw new UnauthorizedException("Forbidden.");
        await _fixedIncomes.DeleteAsync(id, ct);
    }
}
