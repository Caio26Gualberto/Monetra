namespace Monetra.Infrastructure.Security;

public class JwtOptions
{
    public string Issuer { get; set; } = "Monetra";
    public string Audience { get; set; } = "MonetraClient";
    public string Secret { get; set; } = string.Empty;
    public int AccessTokenMinutes { get; set; } = 15;
    public int RefreshTokenDays { get; set; } = 7;
}
