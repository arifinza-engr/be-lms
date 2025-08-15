# 🔧 Environment Setup Guide

## 📁 File Structure

```
├── .env                    # ✅ Development environment (active)
├── .env.example           # ✅ Template for new developers
├── .env.test              # ✅ Testing environment
├── .env.production        # ⚠️  Production template (copy & configure)
└── ENV_SETUP.md          # 📖 This guide
```

## 🚀 Quick Start

### For New Developers:

```bash
# 1. Copy template to create your local environment
cp .env.example .env

# 2. Edit .env with your local configuration
# 3. Start development
npm run start:dev
```

### For Testing:

```bash
# Testing uses .env.test automatically
npm test
npm run test:e2e
```

### For Production Deployment:

```bash
# 1. Copy production template
cp .env.production .env

# 2. Replace ALL placeholder values with actual production values
# 3. Generate secure secrets:
openssl rand -hex 32

# 4. Deploy
npm run build
npm run start:prod
```

## 🔐 Required Variables

### Core (Required)

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret (min 32 chars)
- `JWT_REFRESH_SECRET` - JWT refresh token secret (min 32 chars)

### Optional (AI Features)

- `OPENAI_API_KEY` - For AI chat functionality
- `ELEVENLABS_API_KEY` - For voice synthesis
- `ELEVENLABS_VOICE_ID` - Voice ID for synthesis

### Optional (Performance)

- `REDIS_URL` - For caching and sessions

## 🔒 Security Notes

- ✅ `.env.example` and `.env.test` are safe to commit
- ❌ `.env` and `.env.production` should NEVER be committed
- 🔑 Always generate new secrets for production
- 🌐 Restrict CORS_ORIGIN in production

## 🛠️ Environment Validation

The app validates environment variables on startup using `src/config/env.validation.ts`.

Missing required variables will cause startup to fail with clear error messages.

## 📞 Need Help?

Check the validation file for complete list of supported variables:
`src/config/env.validation.ts`
