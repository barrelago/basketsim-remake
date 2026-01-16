<!-- Copilot / AI agent instructions for BasketSim -->
# BasketSim — Copilot instructions

Quick context
- Full-stack TypeScript app: Express + Prisma backend and Vite + React frontend.
- Backend uses Prisma (Postgres), JWT auth, and TypeScript with ESM (`type: "module"`).
- Frontend uses Vite, React, and `zustand` for stores; simple fetch-based API wrappers live in `src/api`.

How to run locally
- Backend (dev):
  - cd backend
  - pnpm install
  - pnpm run dev
  - Useful scripts: `db:push`, `db:migrate`, `db:seed` (see backend/package.json).
- Frontend (dev):
  - cd frontend
  - pnpm install
  - pnpm run dev
- Important env vars:
  - Backend: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRATION`, `FRONTEND_URL`, `PORT`
  - Frontend: `VITE_API_URL` (defaults to http://localhost:3000)

Big-picture architecture (what to know first)
- Routes → Controllers → Services → Prisma
  - Routes are thin and wired in [backend/src/index.ts](backend/src/index.ts#L1-L40).
  - Controllers (backend/src/controllers) perform request validation and call services (example: `registerHandler` in [backend/src/controllers/authController.ts](backend/src/controllers/authController.ts#L1-L40)).
  - Services (backend/src/services) own business logic and use `PrismaClient` (example: [backend/src/services/authService.ts](backend/src/services/authService.ts#L1-L240)).
- Auth flow
  - JWT tokens created with `generateToken` in [backend/src/utils/jwt.ts](backend/src/utils/jwt.ts#L1-L40).
  - Auth middleware attaches `req.user` after verifying the token: [backend/src/middleware/auth.ts](backend/src/middleware/auth.ts#L1-L60).
  - Frontend sends `Authorization: Bearer <token>` (see [frontend/src/api/auth.ts](frontend/src/api/auth.ts#L1-L80)).
- Data model
  - Prisma schema is at [backend/prisma/schema.prisma](backend/prisma/schema.prisma#L1-L200). Teams, Players, Users, Matches, and roster relations are defined there.

Project-specific conventions
- Error responses: controllers return JSON with an `error` property and set HTTP status codes — follow that pattern when adding new endpoints.
- Passwords: use `hashPassword` / `comparePassword` in [backend/src/utils/password.ts](backend/src/utils/password.ts#L1-L40).
- Use `PrismaClient` per file in services (current pattern: one client instance in each service file or module-level client). Keep prisma operations inside services.
- Keep controllers thin: validate input, call a service, and translate errors to HTTP responses.

Frontend patterns
- API wrappers live in `frontend/src/api/*` and use `fetch` (not axios in current code). Update these wrappers for backend contract changes.
- State is managed with `zustand` stores in `frontend/src/stores` — update stores rather than sprinkling state through components.

Integration points to watch
- Environment and CORS: backend uses `FRONTEND_URL` in CORS config ([backend/src/index.ts](backend/src/index.ts#L1-L20)).
- Prisma migrations/seed: use the scripts in `backend/package.json` (run from `backend` folder).

Guidance for edits by AI agents
- When changing an API contract, update in this order: service → controller → route → frontend `src/api/*` → frontend stores/components.
- Preserve `req.user` typing and the auth middleware behavior when modifying auth-related code.
- Use existing error shape (`{ error: string }`) for consistency.
- Use the JWT helpers in `backend/src/utils/jwt.ts` rather than crafting tokens inline.
- For DB changes, update `prisma/schema.prisma` and add a migration or run `db:push` depending on the desired workflow.

Files to inspect first (quick links)
- [backend/src/index.ts](backend/src/index.ts#L1-L40)
- [backend/src/controllers/authController.ts](backend/src/controllers/authController.ts#L1-L40)
- [backend/src/services/authService.ts](backend/src/services/authService.ts#L1-L240)
- [backend/src/middleware/auth.ts](backend/src/middleware/auth.ts#L1-L60)
- [backend/prisma/schema.prisma](backend/prisma/schema.prisma#L1-L200)
- [frontend/src/api/auth.ts](frontend/src/api/auth.ts#L1-L80)
- [frontend/src/stores/authStore.ts](frontend/src/stores/authStore.ts#L1-L200)

If anything here is unclear, tell me which area (backend auth, prisma schema, or frontend stores) you want expanded and I'll update this file.
