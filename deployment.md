# Deployment Guide — NutriMind

## Recommended: Vercel (Fastest & Easiest)

Since this is a **Next.js** app, Vercel is the best choice for a 1-click deployment.

### 1. Push to GitHub
1. Create a GitHub repository.
2. Initialize and push your code:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_REPO_URL
git push -u origin main
```

### 2. Connect to Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **"Add New"** > **"Project"**.
3. Import your GitHub repository.

### 3. Configure Environment Variables
You MUST add your API keys in the Vercel dashboard (**Settings > Environment Variables**) before deploying:

| Key | Value |
| --- | --- |
| `GROQ_API_KEY` | Your Primary Groq Key |
| `GROQ_API_KEY_2` | Your Backup Groq Key |

### 4. Build & Deploy
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

Click **"Deploy"**. Your app will be live on a `your-app.vercel.app` domain!

---

## Alternative: Self-Hosting (Docker/VPS)

If you are deploying to your own server:

1. **Build the production bundle:**
   ```bash
   npm run build
   ```
2. **Start in production mode:**
   ```bash
   npm run start
   ```
3. Ensure your `.env.local` variables are present in the server's environment.

---

## Post-Deployment: PWA Support

Once your app is live on **HTTPS**, your users can:
1. Open the URL on their mobile browser (Safari/Chrome).
2. Tap **"Add to Home Screen"**.
3. Use NutriMind like a native mobile app!

> [!IMPORTANT]
> Your API keys are kept safe on the server-side. Never share your `.env.local` file or push it to a public GitHub repo!
