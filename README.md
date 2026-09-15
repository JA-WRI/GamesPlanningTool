# GamesPlanningTool
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
## CI Information

## Project Summary

## Developer Getting Started Guide
[Project board](https://github.com/users/JA-WRI/projects/11)
### 1. Prerequisites
- Node.js
- Docker Desktop
- Git

### 2. Clone the repository
```bash
git clone https://github.com/JA-WRI/GamesPlanningTool.git
cd games-planning-tool
```

## 3. Install dependencies
 
```bash
npm install
```

## 4. Set up environment variables
Copy the example env file and fill in your own values:
```bash
cp .env.example .env
```

⚠️ Update the literal values in `DATABASE_URL` if you change the Postgres vars above

## 5. Start Postgres with Docker
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

## 6. Apply the database schema
 
Run this once after cloning (or any time you pull new migrations from teammates):
 
```bash
npx prisma migrate dev
```

## 7. Start the Next.js dev server
 
```bash
npm run dev
```
 Visit **http://localhost:3000**.


## 8. Using Prisma (team workflow)
 
### Viewing / editing data
 
Each teammate has their **own local Postgres container** with **their own data**. Prisma Studio only shows what's on your machine, no a shared team database yet.
 
```bash
npx prisma studio
```
Can view, add, edit, and delete rows. It does **not** let you create tables or columns.

### Changing the schema (tables/columns)
 
The schema (`prisma/schema.prisma`) is the single source of truth for database structure. Never create tables/columns by hand — always go through the schema file:
 
1. Edit `prisma/schema.prisma` (add/change a model, field, etc.)
2. Run a migration with a **descriptive name**:
```bash
   npx prisma migrate dev --name add_comment_table
```
3. Commit both the schema change **and** the new folder created in `prisma/migrations/` to git.

### After pulling teammates' changes
 
If someone else added migrations, sync your local database:
 
```bash
npx prisma migrate dev
```

### Using Prisma in code
 
Always import the shared singleton, **do not** call `new PrismaClient()` directly outside of `lib/prisma.ts`:
 
```ts
import { prisma } from '@/lib/prisma'
 
const games = await prisma.games.findMany() //this is an example
```
 
This avoids exhausting database connections during Next.js hot-reload in dev.



## Quick reference — common commands
 
```bash
docker compose up -d              # start Postgres
docker compose down               # stop Postgres
npm run dev                       # start Next.js dev server
npx prisma studio                 # open visual DB browser (localhost:5555)
npx prisma migrate dev --name x   # create + apply a new migration
```