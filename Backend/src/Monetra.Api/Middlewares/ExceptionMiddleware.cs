using System.Text.Json;
using FluentValidation;
using Monetra.Application.Common.Exceptions;
using Monetra.Domain.Exceptions;

namespace Monetra.Api.Middlewares;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext ctx)
    {
        try
        {
            await _next(ctx);
        }
        catch (ValidationException ex)
        {
            await Write(ctx, 400, "Validation failed.", ex.Errors.Select(e => e.ErrorMessage));
        }
        catch (AppException ex)
        {
            await Write(ctx, ex.StatusCode, ex.Message);
        }
        catch (DomainException ex)
        {
            await Write(ctx, 400, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception");
            await Write(ctx, 500, "Internal server error.");
        }
    }

    private static Task Write(HttpContext ctx, int status, string message, IEnumerable<string>? details = null)
    {
        ctx.Response.StatusCode = status;
        ctx.Response.ContentType = "application/json";
        var body = JsonSerializer.Serialize(new { message, details }, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
        return ctx.Response.WriteAsync(body);
    }
}
