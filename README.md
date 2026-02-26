# Daily Questions

A personal growth and reflection app based on Marshall Goldsmith's Daily Questions methodology. Users create custom questions, answer them on a daily/weekly/monthly cadence, and track progress over time to stay aligned with their goals and values.

**Live at [dailyquestions.app](https://dailyquestions.app)**

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React 18, Mantine v7, Tailwind CSS |
| Backend | Node.js 20, Prisma, NextAuth v5 |
| Database | PostgreSQL |
| Cache / Queues | Redis (ioredis, Bull) |
| Mobile | Flutter (WebView wrapper with native push notifications) |
| Analytics | PostHog |
| Monorepo | Nx 19 |

## Project Structure

```
apps/
  daily-questions/        # Next.js web application
  daily-questions-e2e/    # Playwright end-to-end tests
  daily_questions_ios/    # Flutter iOS app (WebView + Firebase push)
prisma/
  schema.prisma           # Database schema
  migrations/             # Prisma migration history
```

## Features

- **Custom questions** with multiple answer types (integer, boolean, free text, rating)
- **Configurable frequency** — daily, weekly, or monthly
- **Scoring & analytics** with charts and calendar overview
- **Shared overviews** to share progress with others
- **Question library** with curated templates and categories
- **Push notifications** on web (VAPID) and iOS (Firebase Cloud Messaging)
- **OAuth login** via Google, Microsoft Entra ID, and magic link (Resend)

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL
- Redis

### Setup

```bash
npm install
npx prisma generate
npx prisma migrate dev
```

Copy `.env.example` to `.env` and fill in the required values (database URL, auth secrets, Redis URL, Firebase credentials, etc.).

### Development

```bash
pnpm nx dev daily-questions
```

### Testing

```bash
pnpm nx lint daily-questions
pnpm nx e2e daily-questions-e2e
```

## Deployment

### Web — GitHub Actions + Coolify

The web app is deployed automatically on every push to `main` that touches relevant paths (`apps/daily-questions/**`, `prisma/**`, `package.json`, `Dockerfile`). The pipeline can also be triggered manually via workflow dispatch.

**Pipeline flow:**

```
Push to main
  └─ Lint (ESLint via Nx)
       └─ Build Docker image (multi-stage, node:20-alpine)
            └─ Push to GitHub Container Registry (ghcr.io)
                 └─ Trigger Coolify webhook
                      └─ Coolify pulls image & deploys
```

**What happens at startup:**

1. The container runs `prisma migrate deploy` to apply any pending database migrations.
2. Next.js starts in standalone mode on port 3000.

**Required GitHub Secrets:**

`DATABASE_URL`, `AUTH_SECRET`, `AUTH_RESEND_KEY`, `NEXTAUTH_URL`, `AUTH_MICROSOFT_ENTRA_ID_ID`, `AUTH_MICROSOFT_ENTRA_ID_SECRET`, `AUTH_REDIS_URL`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `COOLIFY_WEBHOOK_URL`

### iOS — Flutter + App Store

The iOS app is a Flutter WebView wrapper that loads `dailyquestions.app` with native Firebase push notifications.

**Prerequisites:**

- Apple Developer account
- Firebase project with iOS app configured
- `GoogleService-Info.plist` in `ios/Runner/`
- APNs authentication key (`.p8`) uploaded to Firebase Console

**Build & release:**

```bash
cd apps/daily_questions_ios
flutter build ios --release
```

Then archive and submit through Xcode or `xcrun altool` for App Store distribution.

**Push notification flow:**

1. iOS app registers its device token with the backend via `/api/device-token`.
2. Backend stores the token and uses Firebase Admin SDK to send notifications.
3. Tapping a notification deep-links into the WebView at the relevant path.
