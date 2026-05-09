using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Monetra.Application.Mapping;
using Monetra.Application.Services;

namespace Monetra.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddAutoMapper(cfg => cfg.AddProfile<MappingProfile>());
        services.AddValidatorsFromAssemblyContaining<MappingProfile>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IFinancialService, FinancialService>();
        return services;
    }
}
