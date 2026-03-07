# App Store Review Fixes Design

Date: 2026-03-07

Three issues from Apple App Store review that need to be addressed.

## Issue 1: Sign in with Apple (Guideline 4.8)

Apple requires Sign in with Apple when offering third-party OAuth login (Google/Microsoft).

### Apple Developer Portal Setup (manual)

1. **Identifiers** > + > **Services IDs** > Register with identifier like `app.dailyquestions.service`
2. Enable **Sign in with Apple** on the Service ID, configure:
   - Domains: `dailyquestions.app`
   - Return URLs: `https://dailyquestions.app/api/auth/callback/apple`
3. **Keys** > + > Enable **Sign in with Apple** > Register > Download `.p8` key file
4. Note: Key ID, Team ID, Services ID identifier

### Environment Variables (Coolify)

- `APPLE_ID` = Services ID identifier (e.g. `app.dailyquestions.service`)
- `APPLE_KEY_ID` = Key ID from the key
- `APPLE_TEAM_ID` = Team ID
- `APPLE_SECRET` = Contents of the `.p8` private key file

### Code Changes

- `apps/daily-questions/src/lib/auth.ts`: Add `Apple` provider from `next-auth/providers/apple` with `allowDangerousEmailAccountLinking: true`
- `apps/daily-questions/src/components/Authenticate/CombiForm.tsx`: Add "Continue with Apple" button with same iOS user-agent detection pattern for mobile OAuth flow
- `mobile-signin/route.ts`: No changes needed — already accepts any provider name dynamically

## Issue 2: In-App Browser for OAuth (Guideline 4)

Apple says opening the external Safari browser for login is a poor UX. Use SFSafariViewController instead.

### Code Change

- `apps/daily_questions_ios/lib/screens/home_screen.dart` line 65: Change `LaunchMode.externalApplication` to `LaunchMode.inAppBrowserView`

This uses SFSafariViewController on iOS. The `dailyquestions://auth` deep link callback still works — SFSafariViewController supports custom URL scheme redirects via app_links.

## Issue 3: Support Contact Form (Guideline 1.5)

The Support URL (`https://dailyquestions.app/about`) needs actual support/contact functionality.

### Code Changes

- Add a "Support & Contact" section to `/about` page before the final CTA
- Create a contact form with Name, Email, Message fields
- Create a server action that sends the form submission via Resend to `support@dailyquestions.app`
- Show success notification after submission

### Files

- `apps/daily-questions/src/app/about/page.tsx`: Add support section with contact form (client component)
- `apps/daily-questions/src/lib/actions.ts` (or new file): Add `sendSupportMessage` server action using Resend
