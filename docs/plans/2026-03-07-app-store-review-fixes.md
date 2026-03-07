# App Store Review Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix three Apple App Store review issues: add Sign in with Apple, use in-app browser for OAuth, and add support contact form.

**Architecture:** Web-based Apple OAuth using NextAuth's Apple provider with JWT client secret generated via `jose` (already in dep tree). In-app browser via `LaunchMode.inAppBrowserView` in Flutter. Contact form via Resend API on the existing /about page.

**Tech Stack:** NextAuth v5 (beta.25), Mantine UI, Flutter WebView, Resend email API, `jose` JWT library

---

### Task 1: Generate Apple Client Secret utility

The Apple provider requires a JWT "client secret" signed with your `.p8` private key. Since this JWT expires every 6 months, we generate it at runtime using `jose` (already a dependency of `next-auth` via `@auth/core`).

**Files:**
- Create: `apps/daily-questions/src/lib/apple.ts`

**Step 1: Create the Apple client secret generator**

```typescript
// apps/daily-questions/src/lib/apple.ts
import { SignJWT, importPKCS8 } from 'jose';

let cachedSecret: { token: string; expiresAt: number } | null = null;

export async function getAppleClientSecret(): Promise<string> {
  // Return cached secret if still valid (regenerate 1 day before expiry)
  if (cachedSecret && Date.now() < cachedSecret.expiresAt - 86400000) {
    return cachedSecret.token;
  }

  const privateKey = process.env.APPLE_PRIVATE_KEY;
  const keyId = process.env.APPLE_KEY_ID;
  const teamId = process.env.APPLE_TEAM_ID;
  const clientId = process.env.APPLE_ID;

  if (!privateKey || !keyId || !teamId || !clientId) {
    throw new Error('Missing Apple Sign-In environment variables');
  }

  const key = await importPKCS8(privateKey, 'ES256');
  const expiresIn = 15777000; // ~6 months in seconds

  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: keyId })
    .setIssuedAt()
    .setExpirationTime(`${expiresIn}s`)
    .setAudience('https://appleid.apple.com')
    .setIssuer(teamId)
    .setSubject(clientId)
    .sign(key);

  cachedSecret = {
    token,
    expiresAt: Date.now() + expiresIn * 1000,
  };

  return token;
}
```

**Step 2: Verify it compiles**

Run: `cd apps/daily-questions && npx tsc --noEmit src/lib/apple.ts 2>&1 | head -20`
Expected: No errors (or only unrelated errors from other files)

**Step 3: Commit**

```bash
git add apps/daily-questions/src/lib/apple.ts
git commit -m "feat: add Apple client secret JWT generator using jose"
```

---

### Task 2: Add Apple provider to NextAuth config

**Files:**
- Modify: `apps/daily-questions/src/lib/auth.ts`

**Step 1: Add Apple provider import and configuration**

In `auth.ts`, add the Apple import alongside the other providers:

```typescript
import Apple from 'next-auth/providers/apple';
```

Add import for the secret generator:

```typescript
import { getAppleClientSecret } from '@/lib/apple';
```

Add Apple to the providers array, after the Google provider (line 66). The Apple provider needs a dynamic client secret, so use the `authorization` override approach:

```typescript
Apple({
  clientId: process.env.APPLE_ID,
  clientSecret: '', // Placeholder — overridden dynamically below
  allowDangerousEmailAccountLinking: true,
}),
```

Then in the `callbacks` section, add a `signIn` callback or use the existing JWT callback. Actually, the cleaner approach: since `clientSecret` needs to be dynamic, we need to override it. Auth.js v5 doesn't support async provider config directly, so instead we'll use the `AUTH_APPLE_SECRET` env var approach with a startup script.

**REVISED APPROACH:** Actually, the simplest reliable approach is to set `AUTH_APPLE_SECRET` as an env var. Auth.js v5 auto-discovers `AUTH_APPLE_ID` and `AUTH_APPLE_SECRET`. We'll provide a script to generate the secret.

Replace the Apple provider with just:

```typescript
Apple({
  allowDangerousEmailAccountLinking: true,
}),
```

Auth.js will auto-read `AUTH_APPLE_ID` and `AUTH_APPLE_SECRET` from environment variables.

**Step 2: Update the apple.ts to be a CLI script for generating the secret**

Replace `apps/daily-questions/src/lib/apple.ts` with a standalone script:

```typescript
// apps/daily-questions/scripts/generate-apple-secret.ts
// Usage: npx ts-node apps/daily-questions/scripts/generate-apple-secret.ts
//
// Requires env vars: APPLE_PRIVATE_KEY, APPLE_KEY_ID, APPLE_TEAM_ID, APPLE_ID
// Or pass the .p8 file path as first argument

import { SignJWT, importPKCS8 } from 'jose';
import * as fs from 'fs';

async function main() {
  const privateKeyArg = process.argv[2];
  let privateKey: string;

  if (privateKeyArg && fs.existsSync(privateKeyArg)) {
    privateKey = fs.readFileSync(privateKeyArg, 'utf8');
    console.log(`Read private key from ${privateKeyArg}`);
  } else if (process.env.APPLE_PRIVATE_KEY) {
    privateKey = process.env.APPLE_PRIVATE_KEY;
  } else {
    console.error('Provide .p8 file path as argument or set APPLE_PRIVATE_KEY env var');
    process.exit(1);
  }

  const keyId = process.env.APPLE_KEY_ID;
  const teamId = process.env.APPLE_TEAM_ID;
  const clientId = process.env.APPLE_ID;

  if (!keyId || !teamId || !clientId) {
    console.error('Set APPLE_KEY_ID, APPLE_TEAM_ID, and APPLE_ID env vars');
    process.exit(1);
  }

  const key = await importPKCS8(privateKey, 'ES256');

  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: keyId })
    .setIssuedAt()
    .setExpirationTime('180d')
    .setAudience('https://appleid.apple.com')
    .setIssuer(teamId)
    .setSubject(clientId)
    .sign(key);

  console.log('\nGenerated Apple client secret (valid for 180 days):\n');
  console.log(token);
  console.log('\nSet this as AUTH_APPLE_SECRET in your environment.\n');
}

main().catch(console.error);
```

**Step 3: Final auth.ts changes**

The full diff for `auth.ts`:

Add import at top (after line 6):
```typescript
import Apple from 'next-auth/providers/apple';
```

Add Apple provider after the Google provider (after line 66):
```typescript
Apple({ allowDangerousEmailAccountLinking: true }),
```

**Step 4: Verify it compiles**

Run: `cd /Users/ecv/dev/daily-questions && npx nx build daily-questions 2>&1 | tail -20`

**Step 5: Commit**

```bash
git add apps/daily-questions/src/lib/auth.ts apps/daily-questions/scripts/generate-apple-secret.ts
git commit -m "feat: add Sign in with Apple provider to NextAuth config"
```

---

### Task 3: Add Apple sign-in button to login UI

**Files:**
- Modify: `apps/daily-questions/src/components/Authenticate/CombiForm.tsx`

**Step 1: Add Apple icon import**

At line 12 (with the other icon imports), add:

```typescript
import { IconBrandApple } from '@tabler/icons-react';
```

Update the existing import to include it:
```typescript
import {
  IconBrandGoogleFilled,
  IconMail,
  IconBrandAzure,
  IconBrandApple,
} from '@tabler/icons-react';
```

**Step 2: Add Apple sign-in handler**

After the `handleMicrosoftSignIn` function (after line 173), add:

```typescript
const handleAppleSignIn = () => {
  posthog.capture('auth_provider_selected', { provider: 'apple' });
  if (navigator.userAgent.includes('DailyQuestionsIOS')) {
    window.location.href = '/api/auth/mobile-signin?provider=apple';
    return;
  }
  signIn('apple', { callbackUrl });
};
```

**Step 3: Add Apple button to the UI**

After the Microsoft button (after line 388), add:

```tsx
<Button
  onClick={handleAppleSignIn}
  variant="outline"
  leftSection={<IconBrandApple />}
  fullWidth
>
  Continue with Apple
</Button>
```

**Step 4: Verify it compiles**

Run: `cd /Users/ecv/dev/daily-questions && npx nx build daily-questions 2>&1 | tail -20`

**Step 5: Commit**

```bash
git add apps/daily-questions/src/components/Authenticate/CombiForm.tsx
git commit -m "feat: add Sign in with Apple button to login form"
```

---

### Task 4: Switch Flutter OAuth to in-app browser

**Files:**
- Modify: `apps/daily_questions_ios/lib/screens/home_screen.dart`

**Step 1: Change LaunchMode**

At line 65, change:
```dart
launchUrl(uri, mode: LaunchMode.externalApplication);
```
to:
```dart
launchUrl(uri, mode: LaunchMode.inAppBrowserView);
```

This uses `SFSafariViewController` on iOS instead of opening Safari externally. Apple specifically recommends this in their review feedback. The `dailyquestions://auth` deep link callback from `mobile-redirect` route still triggers `app_links` to handle authentication completion.

**Step 2: Commit**

```bash
git add apps/daily_questions_ios/lib/screens/home_screen.dart
git commit -m "feat: use in-app browser (SFSafariViewController) for OAuth login"
```

---

### Task 5: Add support contact form server action

**Files:**
- Modify: `apps/daily-questions/src/lib/actions.ts`

**Step 1: Add the sendSupportMessage server action**

At the end of `actions.ts`, add:

```typescript
export async function sendSupportMessage(formData: {
  name: string;
  email: string;
  message: string;
}) {
  const { name, email, message } = formData;

  if (!name || !email || !message) {
    return { success: false, error: 'All fields are required' };
  }

  try {
    const resend = new Resend(process.env.AUTH_RESEND_KEY);
    await resend.emails.send({
      from: 'Daily Questions <mail@dailyquestions.app>',
      to: 'support@dailyquestions.app',
      replyTo: email,
      subject: `Support request from ${name}`,
      html: `
        <h2>Support Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send support email:', error);
    return { success: false, error: 'Failed to send message' };
  }
}
```

**Step 2: Commit**

```bash
git add apps/daily-questions/src/lib/actions.ts
git commit -m "feat: add sendSupportMessage server action for contact form"
```

---

### Task 6: Add support contact form to /about page

**Files:**
- Create: `apps/daily-questions/src/components/SupportForm.tsx`
- Modify: `apps/daily-questions/src/app/about/page.tsx`

**Step 1: Create the SupportForm client component**

```tsx
// apps/daily-questions/src/components/SupportForm.tsx
'use client';

import { useState } from 'react';
import { TextInput, Textarea, Button, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { sendSupportMessage } from '@/lib/actions';

export function SupportForm() {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const result = await sendSupportMessage({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        message: formData.get('message') as string,
      });

      if (result.success) {
        notifications.show({
          title: 'Message Sent',
          message: "Thank you! We'll get back to you soon.",
          color: 'green',
        });
        form.reset();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to send message. Please try again.',
          color: 'red',
        });
      }
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Something went wrong. Please try again.',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <TextInput name="name" label="Name" placeholder="Your name" required />
        <TextInput
          name="email"
          label="Email"
          type="email"
          placeholder="your@email.com"
          required
        />
        <Textarea
          name="message"
          label="Message"
          placeholder="How can we help?"
          minRows={4}
          required
        />
        <Button type="submit" loading={submitting}>
          {submitting ? 'Sending...' : 'Send Message'}
        </Button>
      </Stack>
    </form>
  );
}
```

**Step 2: Add Support section to /about page**

In `apps/daily-questions/src/app/about/page.tsx`, add the import at the top (after other imports):

```typescript
import { SupportForm } from '@/components/SupportForm';
```

Then add a new section before the final "Join Us" section (before the `{/* Join Us */}` comment around line 469). Insert between the "Behind the scenes" card section and the "Join Us" CTA:

```tsx
{/* Support & Contact */}
<Container size="sm" mt="xl">
  <SectionDivider />
  <Title order={2} ta="center" mb="xs">
    Support & Contact
  </Title>
  <Text ta="center" c="dimmed" mb="lg">
    Have questions or need help? We&apos;re here for you.
  </Text>
  <Card shadow="sm" padding="lg" radius="md" withBorder>
    <SupportForm />
  </Card>
</Container>
```

**Step 3: Verify it compiles**

Run: `cd /Users/ecv/dev/daily-questions && npx nx build daily-questions 2>&1 | tail -20`

**Step 4: Commit**

```bash
git add apps/daily-questions/src/components/SupportForm.tsx apps/daily-questions/src/app/about/page.tsx
git commit -m "feat: add support contact form to /about page"
```

---

### Task 7: Apple Developer Portal Setup (manual — user action required)

This task requires manual steps in the Apple Developer Portal. The code is ready; these steps configure Apple's side.

**Step 1: Register a Services ID**

1. Go to https://developer.apple.com/account/resources/identifiers/list/serviceId
2. Click **+** button
3. Select **Services IDs** > Continue
4. Description: `Daily Questions Web`
5. Identifier: `app.dailyquestions.service`
6. Click **Continue** > **Register**

**Step 2: Configure Sign in with Apple on the Services ID**

1. Click the newly created `app.dailyquestions.service` identifier
2. Check **Sign in with Apple** > click **Configure**
3. Primary App ID: Select your app (e.g. `Daily Questions iOS`)
4. Domains and Subdomains: `dailyquestions.app`
5. Return URLs: `https://dailyquestions.app/api/auth/callback/apple`
6. Click **Save** > **Continue** > **Save**

**Step 3: Create a private key**

1. Go to https://developer.apple.com/account/resources/authkeys/list
2. Click **+** button
3. Key Name: `Sign in with Apple Key`
4. Check **Sign in with Apple** > click **Configure** > select your Primary App ID
5. Click **Continue** > **Register**
6. **Download the `.p8` file** (you can only download once!)
7. Note the **Key ID** displayed on the page

**Step 4: Note your Team ID**

Your Team ID is shown in the top-right of the Apple Developer Portal page, or under Membership Details.

**Step 5: Generate the client secret**

Run the generation script:
```bash
APPLE_ID=app.dailyquestions.service \
APPLE_KEY_ID=<your-key-id> \
APPLE_TEAM_ID=<your-team-id> \
npx ts-node apps/daily-questions/scripts/generate-apple-secret.ts /path/to/AuthKey_XXXXXX.p8
```

This outputs a JWT token valid for 180 days.

**Step 6: Set environment variables in Coolify**

Add these env vars:
- `AUTH_APPLE_ID` = `app.dailyquestions.service`
- `AUTH_APPLE_SECRET` = the JWT token from step 5
- `APPLE_ID` = `app.dailyquestions.service` (used by generation script)
- `APPLE_KEY_ID` = your Key ID
- `APPLE_TEAM_ID` = your Team ID
- `APPLE_PRIVATE_KEY` = contents of the `.p8` file (for future secret regeneration)

**Note:** The `AUTH_APPLE_SECRET` expires after 180 days. Set a calendar reminder to regenerate it. You can run the generation script again using the stored `APPLE_PRIVATE_KEY`.

---

### Post-Implementation Notes

- After deploying, test the full Apple sign-in flow on both web and iOS
- Update App Store screenshots to show the new Apple sign-in button
- The `support@dailyquestions.app` email address needs to be configured to receive mail (either as a real mailbox or a forward to your personal email)
- Reply to App Review in App Store Connect identifying the changes made
