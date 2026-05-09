using AutoMapper;
using Monetra.Application.Abstractions;
using Monetra.Application.Common.Exceptions;
using Monetra.Application.DTOs.Auth;
using Monetra.Domain.Entities;
using Monetra.Domain.Repositories;

namespace Monetra.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _users;
    private readonly IAccountRepository _accounts;
    private readonly IRefreshTokenRepository _refreshTokens;
    private readonly IPasswordHasher _hasher;
    private readonly ITokenService _tokens;
    private readonly IMapper _mapper;

    public AuthService(
        IUserRepository users,
        IAccountRepository accounts,
        IRefreshTokenRepository refreshTokens,
        IPasswordHasher hasher,
        ITokenService tokens,
        IMapper mapper)
    {
        _users = users;
        _accounts = accounts;
        _refreshTokens = refreshTokens;
        _hasher = hasher;
        _tokens = tokens;
        _mapper = mapper;
    }

    public async Task<AuthResponseDto> RegisterAsync(CreateUserDto dto, CancellationToken ct = default)
    {
        var emailNormalized = dto.Email.Trim().ToLowerInvariant();
        if (await _users.EmailExistsAsync(emailNormalized, ct))
            throw new ConflictException("Email is already registered.");

        var hash = _hasher.Hash(dto.Password);
        var user = new User(emailNormalized, dto.FirstName, dto.LastName, hash);
        await _users.AddAsync(user, ct);

        var account = new Account(user.Id, 0m);
        await _accounts.AddAsync(account, ct);

        return await IssueTokensAsync(user, ct);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto, CancellationToken ct = default)
    {
        var user = await _users.GetByEmailAsync(dto.Email.Trim().ToLowerInvariant(), ct)
                   ?? throw new UnauthorizedException("Invalid email or password.");

        if (!_hasher.Verify(dto.Password, user.PasswordHash))
            throw new UnauthorizedException("Invalid email or password.");

        return await IssueTokensAsync(user, ct);
    }

    public async Task<AuthResponseDto> RefreshAsync(RefreshTokenRequestDto dto, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(dto.RefreshToken))
            throw new UnauthorizedException("Refresh token is required.");

        var stored = await _refreshTokens.GetByTokenAsync(dto.RefreshToken, ct)
                     ?? throw new UnauthorizedException("Invalid refresh token.");

        // Reuse detection: token already revoked → revoke all user's tokens (defense)
        if (stored.IsRevoked)
        {
            await _refreshTokens.RevokeAllForUserAsync(stored.UserId, "Reuse detected", ct);
            await _refreshTokens.SaveChangesAsync(ct);
            throw new UnauthorizedException("Refresh token has been revoked.");
        }

        if (stored.IsExpired)
            throw new UnauthorizedException("Refresh token expired.");

        var user = await _users.GetByIdAsync(stored.UserId, ct)
                   ?? throw new UnauthorizedException("User not found.");

        // Rotate: revoke current and issue a new one
        var newRefreshTokenValue = _tokens.CreateRefreshToken();
        stored.Revoke(replacedByToken: newRefreshTokenValue, reason: "Rotated");
        await _refreshTokens.UpdateAsync(stored, ct);

        var newRefresh = new RefreshToken(user.Id, newRefreshTokenValue, _tokens.GetRefreshTokenExpiration());
        await _refreshTokens.AddAsync(newRefresh, ct);

        var access = _tokens.CreateAccessToken(user);
        return new AuthResponseDto(access.Token, newRefreshTokenValue, access.ExpiresAt, _mapper.Map<UserDto>(user));
    }

    public async Task RevokeAsync(RevokeTokenRequestDto dto, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(dto.RefreshToken)) return;
        var stored = await _refreshTokens.GetByTokenAsync(dto.RefreshToken, ct);
        if (stored is null || stored.IsRevoked) return;
        stored.Revoke(reason: "User logout");
        await _refreshTokens.UpdateAsync(stored, ct);
    }

    public async Task LogoutAsync(Guid userId, CancellationToken ct = default)
    {
        await _refreshTokens.RevokeAllForUserAsync(userId, "User logout (all sessions)", ct);
    }

    public async Task<UserDto> GetCurrentUserAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _users.GetByIdAsync(userId, ct)
                   ?? throw new NotFoundException("User not found.");
        return _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto> UpdateProfileAsync(Guid userId, UpdateProfileDto dto, CancellationToken ct = default)
    {
        var user = await _users.GetByIdAsync(userId, ct)
                   ?? throw new NotFoundException("User not found.");
        user.UpdateProfile(dto.FirstName, dto.LastName);
        await _users.UpdateAsync(user, ct);
        return _mapper.Map<UserDto>(user);
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordDto dto, CancellationToken ct = default)
    {
        var user = await _users.GetByIdAsync(userId, ct)
                   ?? throw new NotFoundException("User not found.");
        if (!_hasher.Verify(dto.CurrentPassword, user.PasswordHash))
            throw new UnauthorizedException("Current password is incorrect.");

        user.SetPasswordHash(_hasher.Hash(dto.NewPassword));
        await _users.UpdateAsync(user, ct);
        await _refreshTokens.RevokeAllForUserAsync(userId, "Password changed", ct);
    }

    private async Task<AuthResponseDto> IssueTokensAsync(User user, CancellationToken ct)
    {
        var access = _tokens.CreateAccessToken(user);
        var refreshValue = _tokens.CreateRefreshToken();
        var refreshEntity = new RefreshToken(user.Id, refreshValue, _tokens.GetRefreshTokenExpiration());
        await _refreshTokens.AddAsync(refreshEntity, ct);
        return new AuthResponseDto(access.Token, refreshValue, access.ExpiresAt, _mapper.Map<UserDto>(user));
    }
}
