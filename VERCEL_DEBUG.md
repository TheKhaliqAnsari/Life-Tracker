# Vercel Login 401 Debug Guide

## Current Issue
Getting 401 "Invalid credentials" on Vercel deployment even with correct username/password.

## Root Cause
Serverless functions on Vercel don't persist file system writes between function invocations. Users registered in one function call don't exist in the next call.

## Debugging Steps

### 1. Check Debug Endpoint
After deploying, visit: `https://your-app.vercel.app/api/debug`

This will show:
- User count (should show registered users)
- JWT secret status
- Environment info

### 2. Test Registration Flow
1. Go to your deployed app
2. Register a new account
3. **Immediately** try to login (within same session)
4. Check the debug endpoint again

### 3. Check Vercel Function Logs
1. Go to Vercel Dashboard → Your Project
2. Click "Functions" tab
3. Look for recent function executions
4. Check console logs for:
   - "Looking for user [username]: found/not found"
   - "Password comparison result: true/false"

## Expected Behavior vs Reality

### Local Development ✅
- File writes persist
- Users remain in database
- Login works normally

### Vercel Serverless ❌
- File writes don't persist between cold starts
- Each function invocation starts fresh
- Users disappear between requests

## Quick Fix Options

### Option 1: Session-Based Demo (Current Implementation)
- Users exist only during active session
- Need to register fresh after cold starts
- Good for quick demos

### Option 2: Use Vercel KV Storage
```bash
# Enable Vercel KV in your project
vercel add kv
```

### Option 3: Use External Database
- MongoDB Atlas (free tier)
- PlanetScale (free tier)
- Supabase (free tier)

## Testing Your Deployment

1. **Deploy latest changes:**
   ```bash
   vercel --prod
   ```

2. **Clear all browser data** for your site

3. **Visit debug endpoint first:**
   `https://your-app.vercel.app/api/debug`

4. **Register a new account**

5. **Check debug endpoint again** (should show 1 user)

6. **Immediately try logging in**

7. **If login fails, check Vercel function logs**

## Common Issues & Solutions

### Issue: Debug endpoint shows 0 users after registration
**Solution**: Registration API might be failing. Check Vercel function logs.

### Issue: Debug endpoint shows users but login still fails
**Solution**: Password hashing/comparison issue. Check bcrypt logs.

### Issue: JWT_SECRET not found
**Solution**: Verify environment variable is set in Vercel dashboard.

## Logs to Look For

### Successful Registration:
```
Database saved successfully. Users: 1, Boards: 0, Tasks: 0
```

### Successful Login:
```
Looking for user "testuser": found
User details: id=xxx, username=testuser
Password comparison result: true
Login successful for user: testuser
```

### Failed Login:
```
Looking for user "testuser": not found
Login failed: User not found for username: testuser
```

## Next Steps

If the issue persists after these debugging steps, the app needs a persistent database solution. The current file-based approach won't work reliably on Vercel's serverless platform. 