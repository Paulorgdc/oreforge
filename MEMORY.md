# MEMORY — OREFORGE
Plataforma gamificada de gestão financeira (Projeto Integrador, UNIVAG). Três apps independentes.

## Stack
- `backend/`: Express 5 + TypeScript 5 (rotas em `src/routes`, `middleware`, `db`)
- `frontend/`: Next.js 16.3 · React 19.3 · Tailwind 3.4 → Vercel
- `mobile/`: Expo 57 · React Native 0.86 · TypeScript 6
- npm (package-lock.json por app)

## Comandos
- backend: `npm install` · `npm run dev` · `npm run build` · `npm start` · `npm run migrate`
- frontend: `npm run dev` · `npm run build` · `npm run lint`
- mobile: `npm start` · `npm run android|ios|web`

## Variáveis de ambiente
- backend: PORT, NODE_ENV, DATABASE_URL, JWT_SECRET, CLIENT_URL, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
- frontend: NEXT_PUBLIC_API_URL · mobile: EXPO_PUBLIC_API_URL

## Regras de ouro
1. Frontend e mobile falam só com a API do backend; sem acesso direto ao banco.
2. Autenticação por JWT (`JWT_SECRET`); CORS restrito a `CLIENT_URL`.
3. Alterações de schema entram via `npm run migrate`.
