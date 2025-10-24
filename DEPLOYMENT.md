# BlockVerse Deployment Guide - Render Free Tier

## Why Render Instead of Vercel?

Your original request was to deploy on Vercel, but **Vercel doesn't support this application** because:
- Socket.io requires **persistent WebSocket connections** (not compatible with Vercel's serverless functions)
- Your multiplayer system needs **stateful in-memory storage** (incompatible with serverless)
- 662MB of world assets challenge serverless deployment limits

**Solution:** We're using **Render's free tier** which:
- ✅ Fully supports Socket.io and WebSockets
- ✅ Handles stateful Express servers
- ✅ Truly free (750 hours/month)
- ✅ Easy GitHub integration
- ⚠️ Trade-off: Cold starts after 15 min inactivity (~30 sec delay)

---

## Prerequisites Checklist

Before starting, ensure you have:
- [ ] GitHub account (for repository connection)
- [ ] Your coblox repository pushed to GitHub
- [ ] World assets committed to git (already done ✅)

---

## Part 1: MongoDB Atlas Setup (Free Database)

### Step 1: Create Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with email or Google/GitHub
3. Complete email verification if required

### Step 2: Create Database Cluster
1. Click **"Build a Database"** or go to Database Deployments
2. Choose **"M0 Free"** tier (512MB storage, free forever)
3. Cloud provider: **AWS** (best compatibility with Render)
4. Region: **us-east-1** (or closest to your users)
5. Cluster name: Leave default or use "blockverse-cluster"
6. Click **"Create Cluster"** (takes 3-5 minutes)

### Step 3: Create Database User
1. In Atlas dashboard, go to **"Database Access"** (left sidebar → Security)
2. Click **"Add New Database User"**
3. Authentication Method: **Password**
4. Username: `blockverse-user` (or your choice)
5. Password: Click **"Autogenerate Secure Password"** and **SAVE IT**
6. Privileges: **"Read and write to any database"**
7. Click **"Add User"**

### Step 4: Configure Network Access
1. Go to **"Network Access"** (left sidebar → Security)
2. Click **"Add IP Address"**
3. Select **"Allow Access from Anywhere"** (IP: 0.0.0.0/0)
   - Required for Render's dynamic IPs
   - Your database password still protects access
4. Click **"Confirm"**

### Step 5: Get Connection String
1. Go back to **"Database"** (left sidebar)
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**, Version: **5.5 or later**
5. Copy the connection string (looks like):
   ```
   mongodb+srv://username:<password>@cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **IMPORTANT:** Make these changes to the connection string:
   - Replace `<password>` with your actual password from Step 3
   - Add database name after `.net/`: `/blockverse`

   **Final format:**
   ```
   mongodb+srv://blockverse-user:YOUR_PASSWORD@cluster0.abc123.mongodb.net/blockverse?retryWrites=true&w=majority
   ```

7. **Save this complete connection string** - you'll need it for Render

---

## Part 2: Render Deployment

### Step 1: Push to GitHub (if not done)
```bash
# In your coblox directory
git status  # Verify changes
git add .
git commit -m "Prepare for Render deployment"
git push origin master  # or your main branch
```

### Step 2: Create Render Account
1. Go to https://render.com/register
2. Sign up with your **GitHub account** (recommended)
3. Authorize Render to access your repositories
4. Complete email verification

### Step 3: Create New Web Service
1. From Render dashboard, click **"New +"** button (top right)
2. Select **"Web Service"**
3. Connect your GitHub repository:
   - If not connected: Click **"Configure account"** and authorize Render
   - Find and select your **coblox repository**
4. Click **"Connect"**

### Step 4: Configure Service Settings

**Basic Settings:**
- **Name:** `blockverse-app` (or your choice)
  - This becomes your URL: `blockverse-app.onrender.com`
- **Region:** Choose region closest to your MongoDB cluster
- **Branch:** `master` (or your main branch)
- **Root Directory:** Leave blank
- **Runtime:** Node

**Build & Deploy Settings:**
- **Build Command:** `pnpm install && pnpm run build`
- **Start Command:** `pnpm start`

**Instance Type:**
- Select **"Free"** plan (0.1 CPU, 512MB RAM)

### Step 5: Add Environment Variables

Click **"Add Environment Variable"** for each of these:

#### 1. MONGODB_URI (Required)
- **Key:** `MONGODB_URI`
- **Value:** Paste your complete MongoDB connection string from Part 1, Step 5
  ```
  mongodb+srv://blockverse-user:YOUR_PASSWORD@cluster0.abc123.mongodb.net/blockverse?retryWrites=true&w=majority
  ```

#### 2. JWT_SECRET (Required)
- **Key:** `JWT_SECRET`
- **Value:** Generate a secure random string
  - Option 1: Visit https://generate-secret.vercel.app/64
  - Option 2: Run `openssl rand -hex 32` in terminal
  - Example: `a7f3d9e8c2b1a4f6e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6`

#### 3. VITE_APP_TITLE (Optional)
- **Key:** `VITE_APP_TITLE`
- **Value:** `BlockVerse` (or your game title)

**⚠️ Important:** Do NOT add `PORT` - Render provides this automatically!

### Step 6: Deploy!
1. Review all settings
2. Click **"Create Web Service"** at bottom
3. Render will start building (watch the logs)

**Build stages to watch for:**
- "Cloning repository..." (may take 2-3 min due to 662MB assets)
- "Installing dependencies..."
- "Running build command..."
- "==> Build successful"
- "Starting service..."
- "Server running on..." ← Your app is live!

**Total build time:** 5-10 minutes

### Step 7: Access Your App
1. Render shows your URL at top: `https://blockverse-app.onrender.com`
2. Click to open your deployed application
3. First load may take 30 seconds (cold start on free tier)

---

## Verification Tests

### Test 1: Application Loads ✓
- Visit your Render URL
- Should see BlockVerse login/landing page
- If error, check Render logs (dashboard → Logs tab)

### Test 2: User Registration ✓
1. Go to registration/signup page
2. Create a test account
3. Should successfully register
4. Verify in MongoDB Atlas:
   - Go to Atlas → Database → Browse Collections
   - Should see "blockverse" database with "users" collection

### Test 3: User Login ✓
1. Log out from test account
2. Log back in with same credentials
3. Should successfully authenticate

### Test 4: Multiplayer/WebSocket ✓
1. Open browser dev tools → Network tab
2. Load your application
3. Look for WebSocket connection to socket.io
4. Status should be "101 Switching Protocols" (success!)

### Test 5: World Loading ✓
1. Start or join a game world
2. World should load (may take time first load)
3. Check Network tab for `/world/` asset requests
4. Should return 200 status codes

---

## Troubleshooting

### Build Fails
- **Peer dependency issues:** Change build command to `pnpm install --no-frozen-lockfile && pnpm run build`
- **Build timeout:** Wait longer (up to 15 min allowed)

### MongoDB Connection Fails
- Verify `MONGODB_URI` is exactly correct in Render dashboard
- Ensure password has no special characters or is URL-encoded
- Verify MongoDB Atlas Network Access allows 0.0.0.0/0
- Verify database user exists with read/write permissions

### Application Crashes
- Check Render logs for specific error messages
- May be out of memory (512MB limit on free tier)
- Consider optimizing or upgrading plan

### Cold Starts (30 sec delays)
- **Expected behavior** on free tier after 15 min inactivity
- Options:
  - Accept the trade-off for free hosting
  - Upgrade to paid plan ($7/month) for always-on
  - Use uptime monitoring to ping every 10 min

---

## Ongoing Maintenance

### Auto-Deploy
- Enabled by default
- Every push to master triggers new deployment
- Takes 5-10 minutes per deploy

### Monitoring
- Check Render logs regularly for errors
- Monitor MongoDB Atlas storage (512MB limit)
- Set up Render email notifications for failures

### Updating Environment Variables
1. Go to Render dashboard → service → Environment
2. Edit variable value
3. Save (Render auto-redeploys)

---

## Cost Summary

**Completely Free:**
- Render: 750 hours/month (covers one service)
- MongoDB Atlas: 512MB storage
- Both free forever!

**When to upgrade:**
- Need more than 512MB database storage
- Need more than 512MB RAM for app
- Want zero cold starts
- Need automated database backups

---

## What's Been Done

✅ Verified 1,156 world asset files (662MB) are committed to git
✅ Created `render.yaml` configuration file
✅ Verified package.json has correct build and start scripts
✅ Verified pnpm package manager is configured

**Next steps:** Follow Part 1 and Part 2 above to complete deployment!

---

## Support

- **Render docs:** https://docs.render.com
- **MongoDB Atlas docs:** https://www.mongodb.com/docs/atlas/
- **Issues with this guide:** Check Render logs first, then MongoDB Atlas connection
