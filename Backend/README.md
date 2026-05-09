# Monetra — Backend

API REST em **ASP.NET Core 10** com arquitetura **DDD** (Domain-Driven Design), Entity Framework Core sobre SQL Server e autenticação **JWT com refresh token rotativo**.

## Estrutura

```
Backend/
├── Monetra.slnx
└── src/
    ├── Monetra.Domain          · Entidades + ValueObjects + Enums + Interfaces de repositório
    ├── Monetra.Application     · DTOs + Services + AutoMapper + FluentValidation
    ├── Monetra.Infrastructure  · DbContext + Repositórios EF + BCrypt + JWT + Migrations
    └── Monetra.Api             · Controllers + Program.cs + Middleware + Swagger
```

## Configuração

Edite `src/Monetra.Api/appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=Monetra;Trusted_Connection=True;TrustServerCertificate=True"
},
"Jwt": {
  "Secret": "REPLACE_THIS_WITH_AT_LEAST_32_CHAR_SECRET",
  "AccessTokenMinutes": 15,
  "RefreshTokenDays": 7
}
```

> **SQL Server Express?** use `Server=localhost\\SQLEXPRESS;...`
> **Sem Trusted_Connection?** use `User Id=sa;Password=...;`

## Comandos

```powershell
# Restore + build
dotnet build Monetra.slnx

# Aplicar migration (cria o banco)
dotnet ef database update --project src/Monetra.Infrastructure --startup-project src/Monetra.Api

# Criar nova migration (após alterar o domínio)
dotnet ef migrations add NomeDaMigration --project src/Monetra.Infrastructure --startup-project src/Monetra.Api --output-dir Persistence/Migrations

# Rodar
dotnet run --project src/Monetra.Api

# Swagger UI
http://localhost:5000/swagger
```

A API tenta aplicar migrations automaticamente no startup em **Development**.

## Endpoints principais

### Auth (público + autenticado)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh` — rotaciona o refresh token
- `POST /api/auth/revoke` — invalida um refresh token específico
- `POST /api/auth/logout` 🔒 — revoga **todas** as sessões do usuário
- `GET /api/auth/me` 🔒
- `PUT /api/auth/profile` 🔒
- `POST /api/auth/change-password` 🔒

### Financial 🔒 (todos exigem JWT)
- `GET/PUT /api/financial/account` · `GET /api/financial/account/history`
- `CRUD /api/financial/income` · summary · type · month
- `CRUD /api/financial/expense` · summary · category · method · by-category
- `CRUD /api/financial/creditcard` · purchases · pay · summary · pending-installments
- `GET /api/financial/dashboard/{summary,evolution,distribution,recent-transactions}`
- `GET /api/financial/transactions/month/{month}` (com type/category/sort/search)
- `GET /api/financial/projections` · `/{months}` · `/analysis`

## Refresh Token — fluxo

1. Login emite `accessToken` (15 min) + `refreshToken` opaco (64 bytes random base64-url, 7 dias) salvo em SQL.
2. `POST /refresh` valida o token → revoga (`RevokedAt + ReplacedByToken`) → emite novo par.
3. **Reuse detection**: se um refresh token já revogado for reutilizado, **toda a cadeia do usuário é revogada**.
4. Logout = `RevokeAllForUserAsync` (mata todas as sessões ativas).

## Pontos de atenção

- **JWT Secret**: o valor padrão em `appsettings.json` é um placeholder — **TROQUE** antes de qualquer uso real e considere User Secrets em produção.
- **Avisos NU1903**: warnings de vulnerabilidade em pacotes transitivos (`AutoMapper`, `System.Security.Cryptography.Xml`) — não impactam o build, mas em produção avalie atualizar.
