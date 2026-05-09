using System.Globalization;

namespace Monetra.Domain.Services;

public static class InvoiceMonthCalculator
{
    /// <summary>
    /// Returns the yyyy-MM month of the first invoice a purchase would land on if it were
    /// installment 1 of 1, based on purchase date and the card's closing day.
    /// Purchases on the closing day itself fall into the next month's invoice.
    /// </summary>
    public static string FirstInvoiceMonth(DateTime purchaseDate, int closingDay)
    {
        var effectiveClosing = Math.Min(closingDay, DateTime.DaysInMonth(purchaseDate.Year, purchaseDate.Month));
        var baseDate = purchaseDate.Day < effectiveClosing
            ? new DateTime(purchaseDate.Year, purchaseDate.Month, 1)
            : new DateTime(purchaseDate.Year, purchaseDate.Month, 1).AddMonths(1);
        return baseDate.ToString("yyyy-MM", CultureInfo.InvariantCulture);
    }

    /// <summary>
    /// Returns the yyyy-MM month of the currently-open invoice for a card given today's date.
    /// </summary>
    public static string OpenInvoiceMonth(int closingDay, DateTime today) =>
        FirstInvoiceMonth(today, closingDay);

    /// <summary>
    /// Computes the yyyy-MM month where installment #1 of a purchase schedule lands, given that
    /// installment <paramref name="currentInstallment"/> is anchored at <paramref name="anchorMonth"/>.
    /// </summary>
    public static string ScheduleStartMonth(string anchorMonth, int currentInstallment) =>
        AddMonths(anchorMonth, -(currentInstallment - 1));

    /// <summary>
    /// Returns the yyyy-MM month for a specific installment number, given the schedule's start month.
    /// </summary>
    public static string InvoiceMonthForInstallment(string scheduleStartMonth, int installmentNumber) =>
        AddMonths(scheduleStartMonth, installmentNumber - 1);

    /// <summary>
    /// Returns the due date for a given invoice month, clamped to the last day of the month if needed.
    /// </summary>
    public static DateTime DueDateFor(string month, int dueDay)
    {
        var baseDate = ParseMonth(month);
        var day = Math.Min(dueDay, DateTime.DaysInMonth(baseDate.Year, baseDate.Month));
        return new DateTime(baseDate.Year, baseDate.Month, day, 0, 0, 0, DateTimeKind.Utc);
    }

    public static string AddMonths(string month, int offset)
    {
        var d = ParseMonth(month).AddMonths(offset);
        return d.ToString("yyyy-MM", CultureInfo.InvariantCulture);
    }

    private static DateTime ParseMonth(string month) =>
        DateTime.ParseExact(month, "yyyy-MM", CultureInfo.InvariantCulture);
}
