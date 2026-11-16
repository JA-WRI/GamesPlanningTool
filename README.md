# GamesPlanningTool
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
## CI Information
[![CodeQL](https://github.com/JA-WRI/GamesPlanningTool/actions/workflows/codeql.yml/badge.svg)](https://github.com/JA-WRI/GamesPlanningTool/security/code-scanning)
[![Dependabot](https://img.shields.io/badge/Dependabot-enabled-025E8C?logo=dependabot&logoColor=white)](https://github.com/JA-WRI/GamesPlanningTool/security/dependabot)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=JA-WRI_GamesPlanningTool&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=JA-WRI_GamesPlanningTool)
## Project Summary
Planning for the Games shouldn’t mean chasing spreadsheets, emails, and disconnected documents. The Games Planning Tool is a centralized web application that gives National Sport Organizations (NSOs) and the Canadian Olympic Committee (COC) a single source of truth for Games preparation. Starting with the Team Journey, NSOs build and refine their team plans, from participant details to arrival and departure logistics, while the COC sees the full picture across organizations and can step in whenever needed. That same shared foundation carries into cost estimation, where NSOs work from simple templates and COC-configured rates so everyone is looking at the same numbers. A dashboard ties it all together, surfacing deadlines, outstanding actions, and resources, and helping the COC spot gaps early and keep every NSO on track. The result is less duplication, fewer errors, and a more collaborative path to getting Team Canada ready to compete.

## Developer Getting Started Guide
📌 [Project board](https://github.com/users/JA-WRI/projects/11)
### 1. Prerequisites
- Node.js
- Docker Desktop
- Git

### 2. Clone the repository
```bash
git clone https://github.com/JA-WRI/GamesPlanningTool.git
cd games-planning-tool
```

### 3. Install dependencies
 
```bash
npm install
```

### 4. Set up environment variables
Copy the example env file and fill in your own values:
```bash
cp .env.example .env
```

⚠️ Update the literal values in `DATABASE_URL` if you change the Postgres vars in .env (eg. if you want the change ports)

### 5. Start Postgres with Docker
 This starts a local Postgres container in the background.
```bash
docker compose up -d
```
To check it's running:
 
```bash
docker ps
```
 or open docker desktop and see the running container.
 
 ⚠️ If you get an error running docker compose up -d -> open docker desktop first, check that you don't have a virtualization error and run command again.

To stop it later:
 
```bash
docker compose down
```

### 6. Apply the database schema
 
Apply the committed migrations, then generate Prisma Client:
 
```bash
npm run db:migrate -- --config prisma7.config.ts
npm run prisma:generate -- --config prisma7.config.ts
```

### 7. Start the Next.js dev server
 
```bash
npm run dev
```
 Visit **http://localhost:3000**.

### 8. Using Prisma (team workflow)
 
#### a. Viewing / editing data
 
Each teammate has their **own local Postgres container** with **their own data**. Prisma Studio only shows what's on your machine, no shared team database yet.
 
```bash
npx prisma studio
```
Can view, add, edit, and delete rows. It does **not** let you create tables or columns.

#### b. Changing the schema (tables/columns)
 
The schema (`prisma/schema.prisma`) is the single source of truth for database structure. Never create tables/columns by hand, always go through the schema file:
 
1. Edit `prisma/schema.prisma` (add/change a model, field, etc.)
2. Run a migration with a **descriptive name**:
```bash
   npx prisma migrate dev --config prisma7.config.ts --name add_comment_table
   npm run prisma:generate -- --config prisma7.config.ts
```
3. Commit both the schema change **and** the new folder created in `prisma/migrations/` to git.

Keep migrations already merged into the shared branch unchanged. Add schema changes in a new migration so databases that applied the earlier migrations receive them too.

#### c. After pulling teammates' changes
 
Stop the dev server, then apply pending migrations and regenerate the client from the pulled schema:
 
```bash
npm run db:migrate -- --config prisma7.config.ts
npm run prisma:generate -- --config prisma7.config.ts
npm run dev
```

Prisma 7 requires explicit client generation after schema changes. An `Unknown field` error for a relation such as `GameNso.progressTracking` can mean the running app still uses an older generated client. Regenerate it and restart the dev server.

For Supabase, configure `DIRECT_URL` with the migration connection string; `prisma7.config.ts` prefers it over `DATABASE_URL`. Apply committed migrations with `migrate deploy` (the `db:migrate` script). If a migration previously failed, inspect the failure and database state before resolving it; do not reset a shared database.

#### Using Prisma in code
 
Always import the shared singleton, **do not** call `new PrismaClient()` directly outside of `lib/prisma.ts`:
 
```ts
import { prisma } from '@/lib/prisma'
 
const games = await prisma.games.findMany() //this is an example
```
 
This avoids exhausting database connections during Next.js hot-reload in dev.

### 9. File organization
 
You don't need to worry about most of the top-level files in this repo (configs, lockfiles, etc). Day-to-day, you'll mainly be working inside three folders:
 
```
games-planning-tool/
├── src/          → all application code
├── prisma/       → database schema + migrations
├── public/       → static assets (images, icons, etc.)
```
 
#### `src/`
 
This is where all the actual app code lives. We're using the **App Router**, so routing is based on folders inside `src/app/`:
 
```
src/
├── app/          → pages & routes (App Router — folder structure = URL structure)
├── lib/          → shared code, utility functions
├── generated/    → auto-generated Prisma Client — don't edit, don't worry about it
```

### `prisma/`
 
Holds the database schema and migration history:
 
```
prisma/
├── schema.prisma     → defines all our tables/models — edit this to change the DB structure
├── migrations/        → auto-generated history of every schema change — don't edit by hand
```
 
You'll edit `schema.prisma` directly when adding/changing a model, then run a migration. 
## Quick reference — common commands
 
```bash 
docker compose up -d              # start Postgres
docker compose down               # stop Postgres
npm run dev                       # start Next.js dev server
npx prisma studio                 # open visual DB browser (localhost:5555)
npx prisma migrate dev --name x   # create + apply a new migration
```
