# Mentis

Öğretmenler için sınıf içi quiz platformu. Kahoot benzeri, okul odaklı, KVKK uyumlu.

## Yapı

```
apps/
  api/          → Fastify + Prisma + PostgreSQL
  web-student/  → Next.js (öğrenci arayüzü)
packages/
  shared/       → Ortak tipler (ileride)
docker/
  docker-compose.yml
```

## Kurulum

```bash
# Bağımlılıklar
pnpm install

# Veritabanı
docker compose -f docker/docker-compose.yml up -d
cd apps/api && npx prisma migrate deploy && pnpm seed
```

## Geliştirme

```bash
# API  (localhost:4000)
cd apps/api && pnpm dev

# Web  (localhost:3000)
cd apps/web-student && pnpm dev
```

## Teknolojiler

| Katman | Stack |
|---|---|
| Backend | Fastify · Prisma · PostgreSQL · Zod |
| Frontend | Next.js 16 · React 19 · Tailwind CSS 4 · Framer Motion |
| Infra | Docker · pnpm workspaces |

---

**Akif Aydın** — Fen Bilimleri Öğretmeni & Geliştirici
