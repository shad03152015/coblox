# Quick Deploy to Glitch (No Credit Card, 5 Minutes)

The fastest way to get BlockVerse online for free without a credit card.

---

## ⚠️ Important Limitation

Glitch has a **200MB storage limit**, but your world assets are **662MB**.

**Options:**
1. **Remove some worlds** to fit under 200MB (quick fix)
2. **Use CDN for assets** (requires code changes - see bottom)
3. **Use Replit instead** (supports larger apps but slower)

For this quick guide, we'll **remove extra world files** to get under 200MB.

---

## Step 1: Reduce World Assets (2 minutes)

In your local coblox directory:

```bash
cd coblox

# Remove survival-island world (keep only neon-city)
rm -rf client/world/survival-island

# Check new size
du -sh client/world/
# Should show ~400MB (still too big)

# Remove DIM-1 and DIM1 dimensions from neon-city
rm -rf client/world/neon-city/DIM-1
rm -rf client/world/neon-city/DIM1

# Check again
du -sh client/world/
# Should show ~150MB ✅
```

Commit and push:
```bash
git add .
git commit -m "Reduce world assets for Glitch deployment"
git push origin master
```

---

## Step 2: Deploy to Glitch (2 minutes)

1. **Go to:** https://glitch.com

2. **Click** "Sign in" (optional - can skip and remix as guest)
   - Sign in with GitHub recommended for easier management

3. **Click** "New Project" button (top right)

4. **Select** "Import from GitHub"

5. **Paste** your GitHub repository URL:
   ```
   https://github.com/YOUR_USERNAME/YOUR_REPO_NAME
   ```

6. **Click** "OK" - Glitch imports your code (takes 1-2 minutes)

---

## Step 3: Set Up MongoDB Atlas (If Not Done Yet)

If you haven't set up MongoDB Atlas yet:

1. **Go to:** https://www.mongodb.com/cloud/atlas/register
2. **Sign up** (free, no credit card)
3. **Create cluster:**
   - Choose **M0 Free** tier
   - Select **AWS** provider
   - Region: **us-east-1**
   - Click "Create Cluster"
4. **Create database user:**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: `blockverse-user`
   - **Autogenerate password** and SAVE IT
   - Privilege: "Read and write to any database"
5. **Allow network access:**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
6. **Get connection string:**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your saved password
   - Add `/blockverse` after `.net/`

   **Final format:**
   ```
   mongodb+srv://blockverse-user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/blockverse?retryWrites=true&w=majority
   ```

---

## Step 4: Configure Environment Variables in Glitch (1 minute)

In your Glitch project:

1. **Click** `.env` file in left sidebar (if not visible, click "Tools" → "Secrets")

2. **Add these variables:**
   ```
   MONGODB_URI=mongodb+srv://blockverse-user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/blockverse?retryWrites=true&w=majority
   JWT_SECRET=a7f3d9e8c2b1a4f6e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6
   PORT=3000
   NODE_ENV=production
   VITE_APP_TITLE=BlockVerse
   ```

3. **Generate a secure JWT_SECRET:**
   - Visit: https://generate-secret.vercel.app/64
   - Copy the generated string
   - Replace the JWT_SECRET value above

4. **Save** (Glitch auto-saves)

---

## Step 5: Fix Package.json for Glitch

Glitch might need a `start` script. Click on `package.json` and verify it has:

```json
{
  "scripts": {
    "start": "node dist/index.js",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist"
  }
}
```

This is already in your package.json, so you're good! ✅

---

## Step 6: Monitor Build & Deploy

1. **Click** "Logs" button (bottom left)

2. **Watch for:**
   ```
   Installing dependencies...
   Building...
   Build successful
   Server running on port 3000
   ```

3. **If you see errors:**
   - Check if build completed
   - Verify all dependencies installed
   - Check MongoDB connection string is correct

---

## Step 7: Access Your App! 🎉

1. **Click** "Preview" button (top right) or "Show" → "In a New Window"

2. **Your URL will be:**
   ```
   https://YOUR-PROJECT-NAME.glitch.me
   ```

3. **Test:**
   - Sign up for a new account
   - Login
   - Create character
   - Join world

---

## Troubleshooting

### Build Fails
**Error:** "npm install failed"
**Solution:**
- Glitch might need npm instead of pnpm
- Edit `package.json` and remove the `packageManager` field:
  ```json
  "packageManager": "pnpm@10.4.1..." // DELETE THIS LINE
  ```

### App Doesn't Start
**Error:** "Application Error"
**Solution:**
- Check Logs for specific error
- Verify MongoDB connection string
- Make sure PORT is set to 3000
- Verify build completed successfully

### Can't Connect to MongoDB
**Error:** "MongooseError: ..."
**Solution:**
- Verify connection string has correct password
- Check MongoDB Atlas Network Access allows 0.0.0.0/0
- Verify database user exists

### World Assets Don't Load
**Error:** 404 on /world/ requests
**Solution:**
- Verify client/world/ directory is in your GitHub repo
- Check Glitch imported all files
- May need to refresh Glitch project

### App Goes to Sleep
**Behavior:** App stops responding after 5 minutes
**Solution:**
- This is normal on free tier
- Use UptimeRobot to keep alive (see below)

---

## Keep Your App Alive (Prevent Sleep)

Glitch free apps sleep after 5 minutes of inactivity. To keep alive:

1. **Go to:** https://uptimerobot.com
2. **Sign up** (free account)
3. **Click** "Add New Monitor"
4. **Configure:**
   - Monitor Type: HTTP(s)
   - Friendly Name: BlockVerse
   - URL: `https://your-project.glitch.me`
   - Monitoring Interval: 5 minutes
5. **Click** "Create Monitor"

UptimeRobot pings your app every 5 minutes, keeping it awake!

---

## Limitations on Glitch Free Tier

- **Storage:** 200MB (we reduced assets to fit)
- **RAM:** 512MB (should be OK for small player count)
- **Sleep:** After 5 minutes inactivity (use UptimeRobot to prevent)
- **Hours:** 4,000 hours/month (plenty for personal use)
- **Performance:** May be slow with many simultaneous players

---

## Alternative: Use Replit (Supports Full 662MB)

If you want to keep all world assets without reducing them:

1. **Go to:** https://replit.com
2. **Sign up** (free)
3. **Import from GitHub**
4. **Add secrets** (same environment variables)
5. **Click Run**

Replit has more storage and handles 662MB better, but:
- Sleeps after 1 hour (longer than Glitch's 5 min)
- Slightly slower performance
- Still free forever!

---

## Advanced: Use CDN for Assets (Best Solution)

If you want to keep ALL assets AND have fast loading:

### Host assets on jsDelivr CDN (free):

1. Keep world assets in GitHub repo
2. Assets automatically available at:
   ```
   https://cdn.jsdelivr.net/gh/YOUR_USERNAME/YOUR_REPO@master/client/world/neon-city/region/r.0.0.mca
   ```

3. Modify `coblox/server/index.ts` to fetch from CDN:
   ```typescript
   // Instead of:
   app.use('/world', express.static(path.join(__dirname, '../client/world')));

   // Use proxy to CDN:
   app.use('/world', (req, res) => {
     const cdnUrl = `https://cdn.jsdelivr.net/gh/YOUR_USERNAME/YOUR_REPO@master/client/world${req.path}`;
     res.redirect(cdnUrl);
   });
   ```

This way:
- ✅ No storage limits (assets served from GitHub via CDN)
- ✅ Fast global CDN delivery
- ✅ All assets available
- ✅ Glitch only hosts your code (under 200MB easily)

---

## Summary

You now have BlockVerse deployed for free on Glitch! 🎉

**What you have:**
- ✅ Live URL: `https://YOUR-PROJECT.glitch.me`
- ✅ No credit card required
- ✅ Free forever
- ✅ Socket.io multiplayer working
- ✅ MongoDB Atlas database
- ✅ Auto-deploys from GitHub (edit → commit → push)

**Next steps:**
1. Share your URL with friends!
2. Set up UptimeRobot to prevent sleep
3. Monitor MongoDB Atlas usage (512MB limit)
4. Consider CDN solution if you want all world assets

**Need more power?**
- When you outgrow Glitch, check DEPLOYMENT-ALTERNATIVES.md for other options
- Eventually may need paid hosting ($5-10/month) for production use

Enjoy your free Minecraft clone! 🎮
