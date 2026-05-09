# 💸 Monetra — Gerenciador de Finanças Pessoais

Aplicação fullstack desacoplada para controle de finanças pessoais: receitas, despesas, cartão de crédito, dashboard, visão mensal e projeções financeiras.

## 🏗️ Estrutura

```
Monetra/
├── Backend/    ASP.NET Core 10 (DDD) + EF Core + SQL Server + JWT (com refresh token)
└── Frontend/   React 19 + Vite + TypeScript + Tailwind + shadcn-style
```

## ⚡ Stack

**Backend** · `.NET 10` · `ASP.NET Core Web API` · `Entity Framework Core` · `SQL Server` · `AutoMapper` · `FluentValidation` · `BCrypt` · `JWT` (access 15 min + refresh token rotativo 7 dias) · `Swashbuckle`

**Frontend** · `React 19` · `Vite 5` · `TypeScript 5.6` · `Tailwind CSS 3.4` · `react-router-dom` · `axios` (com interceptor de refresh) · `react-hook-form` · `zod` · `recharts` · `lucide-react` · `date-fns`

**Design** · Glassmorphism moderno, gradiente roxo/rosa, animações fluidas, totalmente responsivo.

## ✅ Funcionalidades implementadas

- **Autenticação**: registro, login, refresh token rotativo (com reuse detection), revogação no logout, troca de senha (revoga sessões), update de perfil.
- **Conta & Saldo**: visualizar, atualizar, histórico completo de alterações.
- **Receitas**: salário/freelance, filtros por mês/tipo, resumo mensal com comparativo, CRUD.
- **Despesas**: 7 categorias × 2 métodos de pagamento, filtros, resumo por categoria com cards visuais, CRUD.
- **Cartão de Crédito**: múltiplos cartões, faturas mensais, compras parceladas (1–24x) com progresso visual, marcar como paga.
- **Dashboard**: 4 cards KPI, gráfico de evolução 6 meses (linha dupla), distribuição por categoria (donut), 5 transações recentes.
- **Visão Mensal**: filtros completos (tipo, categoria, ordenação, busca), grupos colapsáveis Receitas/Despesas com subtotais.
- **Projeções**: 4 cards de meses futuros, gráfico de saldo projetado, análise textual e sugestões.
- **Tudo em UI 100% pt-BR · código 100% inglês**

## 🚀 Como rodar

### Pré-requisitos
- **.NET 10 SDK**
- **Node.js 20+**
- **SQL Server** local (LocalDB, Express ou Developer)

### 1. Backend

```powershell
cd Backend

# Ajuste a connection string em src/Monetra.Api/appsettings.json se sua instância
# de SQL Server não for "localhost" com Trusted_Connection.
# Também ajuste "Jwt.Secret" para um segredo longo (>= 32 chars).

# Aplica a migration e cria o banco "Monetra"
dotnet ef database update --project src/Monetra.Infrastructure --startup-project src/Monetra.Api

# Roda a API (http://localhost:5000 + Swagger em /swagger)
dotnet run --project src/Monetra.Api
```

A API também aplica migrations automaticamente em ambiente de desenvolvimento.

### 2. Frontend

```powershell
cd Frontend
npm install
npm run dev   # http://localhost:5173
```

A variável `VITE_API_URL` está em `.env` (default `http://localhost:5000`).

## 🔐 Fluxo de Autenticação (Refresh Token)

1. Login → `{ accessToken (15min), refreshToken (7d), expiresAt, user }`. Ambos salvos em `localStorage`.
2. Cada request envia `Authorization: Bearer <accessToken>`.
3. Em **401**, o interceptor do axios:
   - enfileira novas requests concorrentes,
   - chama `POST /api/auth/refresh`,
   - revoga o token antigo, emite um novo par,
   - reexecuta a request original.
4. **Reuse detection**: se um refresh token já revogado for reutilizado, **toda a cadeia de tokens do usuário é revogada** (defesa contra roubo).
5. **Logout** chama `POST /api/auth/revoke` para invalidar o refresh token no servidor.

## 📁 Estrutura DDD do Backend

```
Backend/src/
├── Monetra.Domain         · Entities, Enums, Repository interfaces
├── Monetra.Application    · DTOs, Services, AutoMapper, FluentValidation
├── Monetra.Infrastructure · DbContext, EF repositories, BCrypt, JwtTokenService
└── Monetra.Api            · Controllers, Program.cs, Swagger, JWT middleware
```

## 🎨 Design System

Cores principais: **Roxo** `#7C3AED` · **Rosa** `#EC4899` · gradiente fundo `#E0F2FE → #F3E8FF`. Cards com efeito `glass` (backdrop-blur). Animações de 0.3s ease-out.
