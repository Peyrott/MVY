# Peladas - Arquitetura

## Visão Geral

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Cliente   │──────▶│   Vercel    │──────▶│   Supabase  │
│  (React)    │      │  (Frontend) │      │  (Database) │
└─────────────┘      └─────────────┘      └─────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │   Railway   │
                     │   (API)     │
                     └─────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │Mercado Pago │
                     └─────────────┘
```

## Componentes

### Frontend (React + Vite)
- **Páginas**: Home, Courts, CourtDetail, Profile, Dashboard
- **Componentes**: Reutilizáveis e modulares
- **Estado**: Context API para auth e toast
- **Estilos**: CSS Modules

### Backend (Node.js + Express)
- **API RESTful**: Endpoints para todas as operações
- **Middleware**: Auth, validação, error handling
- **Integrações**: Supabase, Mercado Pago

### Banco de Dados (Supabase/PostgreSQL)
- **Tabelas**: profiles, courts, bookings, reviews, favorites
- **RLS**: Row Level Security para proteção de dados
- **Triggers**: Atualização automática de ratings

## Fluxo de Pagamento

1. Usuário seleciona quadra e horário
2. Sistema cria reserva com status "pending"
3. Cria preferência no Mercado Pago
4. Redireciona usuário para checkout
5. Mercado Pago notifica via webhook
6. Atualiza reserva para "confirmed"
7. Envia e-mail de confirmação

## Segurança

- JWT para autenticação
- RLS no banco de dados
- Rate limiting na API
- Helmet para headers de segurança
- CORS configurado
