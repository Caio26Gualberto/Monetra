# Monetra — Frontend

SPA em **React 19 + Vite + TypeScript**, design glassmorphism com gradientes roxo/rosa, totalmente responsivo, UI 100% em pt-BR e código 100% em inglês.

## Stack

- **React 19** + **Vite 5** + **TypeScript 5.6**
- **Tailwind CSS 3.4** com paleta customizada (`primary` `#7C3AED`, `accent` `#EC4899`)
- **react-router-dom v6** (rotas protegidas)
- **axios** com interceptor automático de **refresh token** + fila de requests concorrentes
- **react-hook-form + zod** para formulários
- **recharts** para gráficos (linha, donut, área)
- **lucide-react** para ícones
- **Radix UI** primitives + componentes shadcn-style customizados (`Button`, `Input`, `Dialog`...)

## Configuração

`.env` (já criado com default):
```
VITE_API_URL=http://localhost:5000
```

## Comandos

```powershell
npm install     # instalar dependências
npm run dev     # http://localhost:5173
npm run build   # build de produção em ./dist
npm run preview # preview do build
```

## Estrutura

```
src/
├── pages/
│   ├── auth/{LoginPage,RegisterPage}.tsx
│   ├── DashboardPage.tsx
│   ├── IncomePage.tsx · ExpensesPage.tsx · CreditCardPage.tsx
│   ├── MonthlyViewPage.tsx · ProjectionsPage.tsx · AccountBalancePage.tsx
│   └── NotFoundPage.tsx
├── components/
│   ├── layout/    {Sidebar,MobileNav,Header,DashboardLayout}.tsx
│   ├── ui/        {Button,Input,Label,Select,Card,Dialog}.tsx
│   ├── cards/     StatCard.tsx
│   ├── charts/    {EvolutionChart,DistributionChart,ProjectionChart}.tsx
│   ├── forms/     {IncomeForm,ExpenseForm}.tsx
│   └── common/    {LoadingSpinner,EmptyState,ProtectedRoute,ConfirmDialog}.tsx
├── contexts/      {AuthContext,ToastContext}.tsx
├── services/      {auth.service,financial.service}.ts
├── lib/           api.ts · types.ts · constants.ts · formatters.ts · utils.ts · storage.ts
├── App.tsx        (router)
├── main.tsx       (providers)
└── index.css      (Tailwind + glassmorphism)
```

## Refresh Token automático

O `axios` em `src/lib/api.ts`:
1. Anexa o **access token** em todas as requests via interceptor.
2. Em 401, **bloqueia** demais requests numa fila, chama `POST /api/auth/refresh`, atualiza tokens em `localStorage` e reexecuta a request original.
3. Se o refresh falhar, limpa storage, dispara evento `logout` no `authBus`, e o `AuthContext` redireciona para `/login`.
4. Logout chama `POST /api/auth/revoke` antes de limpar.

## Páginas

| Rota | Página | Descrição |
|------|--------|-----------|
| `/login` | LoginPage | E-mail + senha, validação zod |
| `/register` | RegisterPage | Nome, e-mail, senha com checklist visual |
| `/dashboard` | DashboardPage | 4 KPIs · evolução 6m · distribuição · recentes |
| `/income` | IncomePage | Receitas (Salário/Freelance), filtros, CRUD, resumo |
| `/expenses` | ExpensesPage | Despesas com 7 categorias, cards visuais, CRUD |
| `/credit-card` | CreditCardPage | Múltiplos cartões, fatura, parcelamento 1–24x |
| `/monthly-view` | MonthlyViewPage | Visão consolidada com filtros e busca |
| `/projections` | ProjectionsPage | 4 cards futuros, gráfico, análise textual |
| `/account-balance` | AccountBalancePage | Saldo + histórico de alterações |

## Design System

- **Glassmorphism**: classe `.glass` (backdrop-blur + bg-white/55 + border-white/40)
- **Gradientes**: `.gradient-purple`, `.gradient-pink`, `.gradient-mix`, `.text-gradient`
- **Animações**: `animate-fade-in`, `animate-slide-in` (0.3s ease-out)
- Mobile-first, navegação inferior em telas pequenas, sidebar fixa em desktop.
