using Monetra.Domain.Entities;

namespace Monetra.Application.Abstractions;

public record AccessTokenResult(string Token, DateTime ExpiresAt);

public interface ITokenService
{
    AccessTokenResult CreateAccessToken(User user);
    string CreateRefreshToken();
    DateTime GetRefreshTokenExpiration();
}
