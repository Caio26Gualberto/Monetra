using Monetra.Domain.Common;
using Monetra.Domain.Exceptions;

namespace Monetra.Domain.Entities;

public class User : Entity
{
    public string Email { get; private set; } = string.Empty;
    public string FirstName { get; private set; } = string.Empty;
    public string LastName { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;

    private User() { }

    public User(string email, string firstName, string lastName, string passwordHash)
    {
        SetEmail(email);
        UpdateProfile(firstName, lastName);
        SetPasswordHash(passwordHash);
    }

    public void SetEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new DomainException("Email is required.");
        Email = email.Trim().ToLowerInvariant();
        Touch();
    }

    public void UpdateProfile(string firstName, string lastName)
    {
        if (string.IsNullOrWhiteSpace(firstName) || firstName.Trim().Length < 2)
            throw new DomainException("First name must have at least 2 characters.");
        if (string.IsNullOrWhiteSpace(lastName) || lastName.Trim().Length < 2)
            throw new DomainException("Last name must have at least 2 characters.");
        FirstName = firstName.Trim();
        LastName = lastName.Trim();
        Touch();
    }

    public void SetPasswordHash(string passwordHash)
    {
        if (string.IsNullOrWhiteSpace(passwordHash))
            throw new DomainException("Password hash is required.");
        PasswordHash = passwordHash;
        Touch();
    }
}
