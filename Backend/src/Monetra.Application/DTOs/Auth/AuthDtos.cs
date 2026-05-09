namespace Monetra.Application.DTOs.Auth;

public record CreateUserDto(string Email, string FirstName, string LastName, string Password);

public record LoginDto(string Email, string Password);

public record RefreshTokenRequestDto(string RefreshToken);

public record RevokeTokenRequestDto(string RefreshToken);

public record UpdateProfileDto(string FirstName, string LastName);

public record ChangePasswordDto(string CurrentPassword, string NewPassword);

public record UserDto(Guid Id, string Email, string FirstName, string LastName);

public record AuthResponseDto(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt,
    UserDto User
);
