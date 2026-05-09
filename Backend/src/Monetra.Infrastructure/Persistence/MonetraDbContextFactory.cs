using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Monetra.Infrastructure.Persistence
{
    public class MonetraDbContextFactory : IDesignTimeDbContextFactory<MonetraDbContext>
    {
        public MonetraDbContext CreateDbContext(string[] args)
        {
            var basePath = Directory.GetParent(Directory.GetCurrentDirectory())!.FullName;
            var configurationPath = Path.Combine(basePath, "Monetra.Api");

            IConfigurationRoot configuration = new ConfigurationBuilder()
                .SetBasePath(configurationPath)
                .AddJsonFile("appsettings.json")
                .Build();

            var builder = new DbContextOptionsBuilder<MonetraDbContext>();
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            builder.UseSqlServer(connectionString, b =>
            {
                b.MigrationsAssembly(typeof(MonetraDbContext).Assembly.FullName);
                b.MigrationsHistoryTable("__EFMigrationsHistory", "core");
            });

            return new MonetraDbContext(builder.Options);
        }
    }
}
