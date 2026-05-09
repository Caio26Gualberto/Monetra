using System.Globalization;

namespace Monetra.Domain.Services;

public static class InvoiceMonthCalculator
{
    /// <summary>
    /// Returns the yyyy-MM month of the first invoice a purchase will land on,
    /// based on purchase date and the card's closing day.
    /// If purchaseDate.Day &lt;= closingDay the invoice closes in the same month; otherwise in the next month.
    /// </summary>
    public static string FirstInvoiceMonth(DateTime purchaseDate, int closingDay)
    {
        var effectiveClosing = Math.Min(closingDay, DateTime.DaysInMonth(purchaseDate.Year, purchaseDate.Month));
        var baseDate = purchaseDate.Day <= effectiveClosing
            ? new DateTime(purchaseDate.Year, purchaseDate.Month, 1)
            : new DateTime(purchaseDate.Year, purchaseDate.Month, 1).AddMonths(1);
        return baseDate.ToString("yyyy-MM", CultureInfo.InvariantCulture);
    }

    /// <summary>
    /// Returns the yyyy-MM month for a specific installment number of a purchase.
    /// Parcels before CurrentInstallment are considered already paid elsewhere and do NOT appear.
    /// </summary>
    public static string InvoiceMonthForInstallment(DateTime purchaseDate, int closingDay, int currentInstallment, int installmentNumber)
    {
        var first = ParseMonth(FirstInvoiceMonth(purchaseDate, closingDay));
        var offset = installmentNumber - currentInstallment;
        return first.AddMonths(offset).ToString("yyyy-MM", CultureInfo.InvariantCulture);
    }

    /// <summary>
    /// Returns the due date for a given invoice month, clamped to the last day of the month if needed.
    /// </summary>
    public static DateTime DueDateFor(string month, int dueDay)
    {
        var baseDate = ParseMonth(month);
        var day = Math.Min(dueDay, DateTime.DaysInMonth(baseDate.Year, baseDate.Month));
        return new DateTime(baseDate.Year, baseDate.Month, day, 0, 0, 0, DateTimeKind.Utc);
    }

    private static DateTime ParseMonth(string month) =>
        DateTime.ParseExact(month, "yyyy-MM", CultureInfo.InvariantCulture);
}
