# GamesPlanningTool
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
## CI Information

## Project Summary

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

To stop it later:
 
```bash
docker compose down
```

### 6. Apply the database schema
 
Run this once after cloning:
 
```bash
npx prisma migrate dev
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
   npx prisma migrate dev --name add_comment_table
```
3. Commit both the schema change **and** the new folder created in `prisma/migrations/` to git.

#### c. After pulling teammates' changes
 
If someone else added migrations, sync your local database:
 
```bash
npx prisma migrate dev
```

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
