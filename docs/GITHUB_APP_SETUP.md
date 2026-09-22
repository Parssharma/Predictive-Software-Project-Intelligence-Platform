# GitHub App Setup Guide

This guide walks you through registering and configuring a GitHub App for the **Predictive Software Project Intelligence Platform**.

---

## 1. Register a New GitHub App

1. Go to **GitHub Settings → Developer Settings → GitHub Apps** (or visit [github.com/settings/apps/new](https://github.com/settings/apps/new)).
2. Fill in the basic information:
   - **GitHub App name**: `Predictive Project Intelligence (Dev)` (must be globally unique)
   - **Homepage URL**: `http://localhost:3000`
   - **User authorization callback URL**: `http://localhost:3000/auth/callback`
   - **Request user authorization (OAuth) during installation**: Check ✅

---

## 2. Webhook Configuration (Optional for Local Development)

- **Active**: Uncheck for local development unless using a proxy tool like [smee.io](https://smee.io) or ngrok.
- **Webhook URL**: `http://localhost:4000/webhooks/github` (or your smee.io target URL)
- **Webhook secret**: Create a random string (e.g. `dev-webhook-secret-12345`)

---

## 3. Permissions & Events

### Repository Permissions
- **Issues**: `Read-only`
- **Metadata**: `Read-only` (Mandatory)
- **Pull requests**: `Read-only`

### Subscribe to Events
- Check ✅ **Installation**

---

## 4. Environment Variables Setup

Once the App is created, copy the credentials into your `.env` files:

### In `apps/api/.env`
```env
GITHUB_APP_ID=123456
GITHUB_CLIENT_ID=Iv1.xxxxxxxxxxxxxxxx
GITHUB_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_WEBHOOK_SECRET=dev-webhook-secret-12345
JWT_SECRET=a-secure-random-string-with-at-least-16-chars
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ppi_dev
```

### In `apps/web/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_GITHUB_CLIENT_ID=Iv1.xxxxxxxxxxxxxxxx
```

---

## 5. Install the App on Your Test Repository

1. On your GitHub App page, click **Install App** in the left sidebar.
2. Select your personal account or target organization.
3. Choose **Only select repositories** and pick your target repository.
4. Click **Install**.

Now you can sign in to `http://localhost:3000`, click **Sign in with GitHub**, and pick your repository and milestone!
