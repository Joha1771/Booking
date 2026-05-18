# Booking.com Clone — Next.js 14 + TypeScript

## Стек
- **Next.js 14** — App Router
- **TypeScript** — строгая типизация
- **Supabase** — база данных + авторизация
- **Zustand** — глобальный стейт (auth, search)
- **TanStack Query v5** — серверный стейт и кэш

## SSR vs CSR

| Страница | Тип | Причина |
|---|---|---|
| `/` (главная) | **SSR** | SEO, первый экран без загрузки |
| `/hotel/[id]` | **SSR** | SEO важен для отелей |
| `/attractions` | **SSR** | города грузятся на сервере |
| `/attractions/detail/[id]` | **SSR** | SEO |
| `/search` | **CSR** | реальные фильтры пользователя |
| `/profile/*` | **CSR** | персональные данные |
| `/login`, `/register` | **CSR** | интерактивные формы |
| `/genius` | **SSR** + Client | статичный контент + FAQ |

## Установка

```bash
npm install
npm run dev
```

## Переменные окружения (.env.local уже создан)

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Структура

```
src/
  app/           — страницы (App Router)
  components/    — переиспользуемые компоненты
  lib/
    api/         — функции Supabase (SSR и CSR варианты)
    supabase/    — client.ts и server.ts
  store/         — Zustand сторы
  types/         — все TypeScript типы
```
