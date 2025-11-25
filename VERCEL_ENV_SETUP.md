# Vercel Environment Variables Setup

## Required Environment Variables

Configure these in your Vercel project settings (Settings → Environment Variables):

### Database (Supabase)

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
```

### Security

```
JWT_SECRET=your-jwt-secret-min-32-chars
SESSION_SECRET=your-session-secret-min-32-chars
```

### Application

```
NODE_ENV=production
PORT=3000
```

### Optional (recommended defaults)

```
CORS_ORIGIN=*
ENABLE_MONITORING=false
LOG_LEVEL=info
```

## How to Set in Vercel

1. Go to https://vercel.com/dashboard
2. Select your project "floresya-v1"
3. Go to Settings → Environment Variables
4. Add each variable:
   - Name: `SUPABASE_URL`
   - Value: (paste your value)
   - Environment: Production, Preview, Development
5. Click "Save"
6. Repeat for all variables
7. Redeploy: Deployments → Click "..." → Redeploy

## Testing After Setup

```bash
curl https://floresya-v1.vercel.app/health
# Should return: {"status":"healthy",...}

curl https://floresya-v1.vercel.app/api/products
# Should return product list
```

## Troubleshooting

If you get `FUNCTION_INVOCATION_FAILED`:

- Check all env vars are set
- Check Vercel Function Logs in dashboard
- Verify Supabase credentials are correct
