---
name: better-auth
description: Sets up Better Auth with PostgreSQL/Supabase in Next.js projects, encoding all the known gotchas (database adapter config, migration CLI, env vars, client/server split) so auth works first try. Use when running /better-auth, when asked to "set up auth" or "add authentication", when starting a project that needs user accounts, or when debugging Better Auth 422 or FAILED_TO_CREATE_USER errors.
---

# Better Auth Setup

## Purpose
Set up Better Auth with PostgreSQL/Supabase in Next.js projects. This skill encodes all the gotchas and correct configurations to get auth working on the first try.

## When to Invoke
- `/better-auth` - Set up authentication
- "Set up auth" or "add authentication"
- New project needing user auth
- Fixing broken Better Auth setup
- 422 errors or "FAILED_TO_CREATE_USER" errors

---

## Critical Gotchas (READ FIRST!)

### 1. Database Adapter
**WRONG** - config object doesn't work:
```typescript
database: {
  provider: 'postgresql',
  url: process.env.DATABASE_URL!,
}
```

**CORRECT** - use pg Pool directly:
```typescript
import { Pool } from 'pg'

database: new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
})
```

### 2. Supabase Connection URL
**WRONG** - direct connection times out:
```
postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres
```

**CORRECT** - use Session Pooler:
```
postgresql://postgres.xxx:PASSWORD@aws-1-eu-central-1.pooler.supabase.com:5432/postgres
```

### 3. Schema Column Names
**WRONG** - snake_case doesn't work:
```sql
CREATE TABLE "user" (
  email_verified BOOLEAN,
  created_at TIMESTAMP,
  user_id TEXT
);
```

**CORRECT** - Better Auth uses camelCase:
```sql
CREATE TABLE "user" (
  "emailVerified" BOOLEAN,
  "createdAt" TIMESTAMP,
  "userId" TEXT
);
```

### 4. Required Config
Must explicitly set `baseURL` and `secret`:
```typescript
export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  // ... rest of config
})
```

### 5. Secret Length
Secret MUST be 32+ characters:
```bash
openssl rand -base64 32
```

### 6. Client baseURL
Use `window.location.origin` for browser:
```typescript
export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined'
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
})
```

---

## Setup Steps

### Step 1: Install Dependencies
```bash
npm install better-auth pg @types/pg
```

### Step 2: Create Server Auth Config
Create `src/lib/auth.ts`:

```typescript
import { betterAuth } from 'better-auth'
import { Pool } from 'pg'

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  secret: process.env.BETTER_AUTH_SECRET,
  database: new Pool({
    connectionString: process.env.DATABASE_URL!,
    ssl: { rejectUnauthorized: false },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ],
})

export type Session = typeof auth.$Infer.Session
```

### Step 3: Create Client Auth Config
Create `src/lib/auth-client.ts`:

```typescript
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined'
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
})

export const { signIn, signUp, signOut, useSession } = authClient
```

### Step 4: Create API Route Handler
Create `src/app/api/auth/[...all]/route.ts`:

```typescript
import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'

export const { GET, POST } = toNextJsHandler(auth)
```

### Step 5: Create Database Schema
Run this SQL in Supabase SQL Editor:

```sql
-- Better Auth Tables with camelCase columns
-- IMPORTANT: Column names MUST be camelCase!

DROP TABLE IF EXISTS "verification" CASCADE;
DROP TABLE IF EXISTS "account" CASCADE;
DROP TABLE IF EXISTS "session" CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;

CREATE TABLE "user" (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  "emailVerified" BOOLEAN DEFAULT FALSE,
  image TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "session" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "account" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "accessTokenExpiresAt" TIMESTAMP,
  "refreshTokenExpiresAt" TIMESTAMP,
  scope TEXT,
  "idToken" TEXT,
  password TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "verification" (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_session_userId ON "session"("userId");
CREATE INDEX idx_session_token ON "session"(token);
CREATE INDEX idx_account_userId ON "account"("userId");
CREATE INDEX idx_user_email ON "user"(email);
```

### Step 6: Set Environment Variables
Add to `.env.local`:

```bash
# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Better Auth (REQUIRED)
BETTER_AUTH_SECRET=<run: openssl rand -base64 32>
BETTER_AUTH_URL=http://localhost:3000

# Database - USE SESSION POOLER URL from Supabase!
# Go to: Supabase Dashboard → Settings → Database → Connection string → Session mode
DATABASE_URL=postgresql://postgres.YOUR_PROJECT:PASSWORD@aws-1-eu-central-1.pooler.supabase.com:5432/postgres
```

---

## Verification Checklist

After setup, verify:

- [ ] `pg` package is installed (`npm ls pg`)
- [ ] `BETTER_AUTH_SECRET` is 32+ characters
- [ ] `BETTER_AUTH_URL` is set
- [ ] `DATABASE_URL` uses session pooler (contains `.pooler.supabase.com`)
- [ ] SQL schema has camelCase columns
- [ ] Server config has `baseURL` and `secret`
- [ ] Server config uses `new Pool()` with `ssl`
- [ ] Client config uses `window.location.origin`

---

## Troubleshooting

### Error: "Failed to initialize database adapter"
- Check `DATABASE_URL` is correct
- Ensure using session pooler URL, not direct connection
- Verify password is correct

### Error: "FAILED_TO_CREATE_USER" (422)
- Database schema columns are wrong
- Run the SQL schema with camelCase columns
- Drop existing tables first if they exist

### Error: "Base URL could not be determined"
- Add `baseURL` to auth config
- Add `BETTER_AUTH_URL` to env

### Error: "BETTER_AUTH_SECRET should be at least 32 characters"
- Generate proper secret: `openssl rand -base64 32`

### Connection timeout
- You're using direct connection URL
- Switch to session pooler URL from Supabase dashboard

---

## Quick Copy Commands

Generate secret:
```bash
openssl rand -base64 32
```

Copy SQL schema to clipboard (macOS):
```bash
cat supabase/better-auth-schema.sql | pbcopy
```

Check installed packages:
```bash
npm ls better-auth pg
```
