using Microsoft.EntityFrameworkCore;
using Monetra.Domain.Entities;

namespace Monetra.Infrastructure.Persistence;

public class MonetraDbContext : DbContext
{
    public MonetraDbContext(DbContextOptions<MonetraDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<AccountBalanceHistory> AccountBalanceHistories => Set<AccountBalanceHistory>();
    public DbSet<Income> Incomes => Set<Income>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<CreditCard> CreditCards => Set<CreditCard>();
    public DbSet<CreditCardPurchase> CreditCardPurchases => Set<CreditCardPurchase>();
    public DbSet<CreditCardInvoicePayment> CreditCardInvoicePayments => Set<CreditCardInvoicePayment>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);

        b.Entity<User>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Email).IsRequired().HasMaxLength(160);
            e.Property(x => x.FirstName).IsRequired().HasMaxLength(80);
            e.Property(x => x.LastName).IsRequired().HasMaxLength(80);
            e.Property(x => x.PasswordHash).IsRequired().HasMaxLength(256);
            e.HasIndex(x => x.Email).IsUnique();
        });

        b.Entity<Account>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.UserId).IsUnique();
            e.Property(x => x.CurrentBalance).HasColumnType("decimal(18,2)");
            e.HasOne<User>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<AccountBalanceHistory>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.AccountId);
            e.Property(x => x.PreviousBalance).HasColumnType("decimal(18,2)");
            e.Property(x => x.NewBalance).HasColumnType("decimal(18,2)");
            e.Property(x => x.Notes).HasMaxLength(255);
            e.HasOne<Account>().WithMany().HasForeignKey(x => x.AccountId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<Income>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.UserId);
            e.HasIndex(x => x.TransactionDate);
            e.Property(x => x.Amount).HasColumnType("decimal(18,2)");
            e.Property(x => x.Description).IsRequired().HasMaxLength(255);
            e.Property(x => x.Type).HasConversion<int>();
            e.HasOne<User>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<Expense>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.UserId);
            e.HasIndex(x => x.TransactionDate);
            e.HasIndex(x => x.Category);
            e.Property(x => x.Amount).HasColumnType("decimal(18,2)");
            e.Property(x => x.Description).IsRequired().HasMaxLength(255);
            e.Property(x => x.Category).HasConversion<int>();
            e.Property(x => x.PaymentMethod).HasConversion<int>();
            e.HasOne<User>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<CreditCard>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.UserId);
            e.Property(x => x.CardName).IsRequired().HasMaxLength(80);
            e.Property(x => x.ClosingDay).IsRequired();
            e.Property(x => x.DueDay).IsRequired();
            e.HasOne<User>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<CreditCardPurchase>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.CreditCardId);
            e.HasIndex(x => x.PurchaseDate);
            e.Property(x => x.Description).IsRequired().HasMaxLength(255);
            e.Property(x => x.Amount).HasColumnType("decimal(18,2)");
            e.HasOne<CreditCard>().WithMany().HasForeignKey(x => x.CreditCardId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<CreditCardInvoicePayment>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Month).IsRequired().HasMaxLength(7);
            e.HasIndex(x => new { x.CreditCardId, x.Month }).IsUnique();
            e.HasOne<CreditCard>().WithMany().HasForeignKey(x => x.CreditCardId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<RefreshToken>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Token).IsRequired().HasMaxLength(256);
            e.HasIndex(x => x.Token).IsUnique();
            e.HasIndex(x => x.UserId);
            e.Property(x => x.ReplacedByToken).HasMaxLength(256);
            e.Property(x => x.RevokedReason).HasMaxLength(255);
            e.HasOne<User>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        });
    }
}
