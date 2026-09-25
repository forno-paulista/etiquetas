# Etiquetas — Sistema de Rastreabilidade de Produtos/Insumos

Sistema complementar de rastreabilidade de lotes (produto → lote → quantidade
→ validade → localização → QR Code) para uma rede de pizzarias com 1 Centro
de Distribuição e 4 lojas. Não substitui os ERPs existentes (Saipos nas
lojas, Varejo Fácil no CD) — integra com eles via uma camada de
`StockProvider`.

Contexto completo de negócio, regras, modelo de dados e arquitetura: veja
[`CLAUDE.md`](./CLAUDE.md).

## Estrutura

```
backend/    API NestJS + Prisma (PostgreSQL)
frontend/   React + Vite + TypeScript (PWA hoje, empacotável com Capacitor depois)
```

O `backend/` roda tanto direto no host (`npm run start:dev`) quanto
containerizado (`backend/Dockerfile`) — o `docker-compose.yml` na raiz sobe
os dois serviços (Postgres + backend) juntos, do jeito que também vai rodar
em produção.

## Desenvolvimento local

Duas formas de trabalhar, escolha a que fizer sentido no momento:

### A) Stack completo em Docker (mais fiel a produção)

```bash
cp .env.example .env   # ajuste os segredos se quiser
docker compose up -d --build
```

Isso sobe Postgres + backend, aplica as migrations automaticamente
(`prisma migrate deploy` roda no boot do container) e a API fica em
`http://localhost:3000`. Pra ver os logs: `docker compose logs -f backend`.
Pra reconstruir depois de mudar código: `docker compose up -d --build`
de novo.

Banco vazio não tem usuário nenhum — sem isso não dá pra logar. Rode o
seed (cria Organização, o Local do CD e um usuário Admin inicial):

```bash
cd backend && npm run db:seed
```

O e-mail/senha do Admin saem no log do comando. Pra customizar, defina
`SEED_ADMIN_EMAIL` / `SEED_ADMIN_SENHA` especificamente em **`backend/.env`**
(não no `.env` da raiz, não em `.env.local` — o seed só lê `backend/.env`,
porque é de dentro de `backend/` que `npm run db:seed` roda). O seed é
idempotente: rodar de novo com uma senha nova **atualiza** a senha do
usuário existente (não fica preso na primeira execução).

### B) Só o Postgres em Docker, backend direto no host (iteração mais rápida)

```bash
# subir só o Postgres
docker compose up -d postgres

# backend
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run db:seed
npm run start:dev
```

Com a API no ar, a documentação interativa (Swagger/OpenAPI) fica em
`http://localhost:3000/api/docs`. Ela é gerada a partir dos decorators dos
controllers/DTOs — todo endpoint novo deve ser documentado lá (ver seção
"Padrões de documentação" no [`CLAUDE.md`](./CLAUDE.md)). Não é exposta
quando `NODE_ENV=production`.

### Frontend

Com a API já rodando (opção A ou B acima):

```bash
cd frontend
cp .env.example .env   # aponta pra API local por padrão
npm install
npm run dev
```

Abre em `http://localhost:5173`. Loga com o usuário criado pelo seed.

## Deploy em VPS / servidor / VM na nuvem

O mesmo `docker-compose.yml` usado localmente é o que roda em produção —
não existe uma versão "de produção" separada do compose:

```bash
git clone <repo> etiquetas && cd etiquetas
cp .env.example .env
# edite o .env: troque JWT_ACCESS_SECRET, senha do Postgres, CORS_ORIGIN
# e PUBLIC_APP_URL para os valores reais de produção
docker compose up -d --build
```

Pré-requisitos no servidor: Docker + Docker Compose instalados (qualquer
VPS Linux — Hetzner, DigitalOcean etc. — ou uma VM na nuvem). Pra atualizar
depois de um deploy novo: `git pull && docker compose up -d --build`.

Pontos que ainda faltam para produção (não implementados ainda):
- HTTPS/reverse proxy na frente do backend (ex.: Caddy ou nginx com
  Let's Encrypt) — hoje a API expõe HTTP puro na porta 3000.
- Backup automático do Postgres (`pg_dump` agendado), se o banco for
  auto-hospedado em vez de um serviço gerenciado (Neon/Supabase).
- Se em algum momento existir mais de uma réplica do backend, o
  `prisma migrate deploy` automático no boot do container deixa de ser
  seguro (duas réplicas subindo ao mesmo tempo podem tentar migrar em
  paralelo) — nesse caso, migration vira um passo separado do deploy.
- O frontend ainda não está no `docker-compose.yml` nem tem `Dockerfile`
  próprio — hoje só roda via `npm run dev`. Falta decidir o empacotamento
  pra produção (build estático servido por nginx/Caddy é o caminho mais
  simples) quando o frontend estiver mais maduro.
