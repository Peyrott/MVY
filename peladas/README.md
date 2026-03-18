# Peladas

Plataforma web brasileira de aluguel de quadras esportivas.

## Sobre

Peladas conecta usuários a estabelecimentos que alugam quadras esportivas (futebol, futsal, vôlei, basquete, tênis, etc.).

**Modelo de negócio:** A plataforma cobra **20% de comissão** sobre cada reserva. O dono da quadra recebe 80%.

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite + React Router v6 |
| Estilo | CSS Modules |
| Backend | Node.js + Express (ES Modules) |
| Banco | Supabase (PostgreSQL) |
| Auth | Supabase Auth (JWT) |
| Pagamentos | Mercado Pago SDK v2 |
| Deploy frontend | Vercel |
| Deploy backend | Railway |
| CI/CD | GitHub Actions |

## Estrutura do Projeto

```
peladas/
├── .github/workflows/    # CI/CD
├── frontend/             # React app
├── backend/              # Express API
├── database/             # Migrations e seed
└── docs/                 # Documentação
```

## Desenvolvimento Local

### Pré-requisitos

- Node.js 20+
- Conta no Supabase
- Conta no Mercado Pago (para pagamentos)

### Configuração

1. Clone o repositório:
```bash
git clone https://github.com/Peyrott/MVY.git peladas
cd peladas
```

2. Configure as variáveis de ambiente:
```bash
# Frontend
cp frontend/.env.example frontend/.env
# Edite frontend/.env com suas credenciais

# Backend
cp backend/.env.example backend/.env
# Edite backend/.env com suas credenciais
```

3. Instale as dependências:
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

4. Execute as migrations no Supabase (arquivo `database/migrations.sql`)

5. Inicie os servidores:
```bash
# Frontend (porta 5173)
cd frontend
npm run dev

# Backend (porta 3001)
cd backend
npm run dev
```

## Deploy

O deploy é automático via GitHub Actions:

- **Frontend**: Deploy na Vercel ao fazer push na branch `main`
- **Backend**: Deploy na Railway ao fazer push na branch `main`

## Variáveis de Ambiente

### Frontend
- `VITE_SUPABASE_URL`: URL do projeto Supabase
- `VITE_SUPABASE_ANON_KEY`: Chave pública do Supabase
- `VITE_API_URL`: URL da API backend
- `VITE_MP_PUBLIC_KEY`: Chave pública do Mercado Pago

### Backend
- `SUPABASE_URL`: URL do projeto Supabase
- `SUPABASE_SERVICE_KEY`: Chave de serviço do Supabase
- `MP_ACCESS_TOKEN`: Access token do Mercado Pago
- `RESEND_API_KEY`: API key do Resend (e-mails)

## Licença

MIT
