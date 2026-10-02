# PiggyMotion - Character SVG Puppeteer Studio

A real-time puppeteering and multi-layer animation studio for SVG characters with live mouse controls, webcam hand tracking, customizable center of rotation/pivots, continuous 360° arcs, starting position presets, timeline layer stacking, audio sync, and SVG/WebM export.

---

## Deploying to GitHub Pages

This project is pre-configured for GitHub Pages deployment using two methods: **GitHub Actions** (recommended) or the **`gh-pages` npm script**.

### Method 1: Automated Deployment via GitHub Actions (Recommended)

A workflow file is already included at `.github/workflows/deploy.yml`.

1. Push your repository to GitHub (to the `main` or `master` branch):
   ```bash
   git add .
   git commit -m "Configure GitHub Pages deployment"
   git push origin main
   ```
2. In your GitHub repository:
   - Go to **Settings** > **Pages** (under "Code and automation").
   - Under **Build and deployment** > **Source**, select **GitHub Actions**.
3. Every push to `main` (or `master`) will automatically build and publish your app. You can monitor progress under the **Actions** tab.

---

### Method 2: Manual Deployment with `npm run deploy`

If you prefer to deploy from your local terminal to a `gh-pages` branch:

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the deploy script:
   ```bash
   npm run deploy
   ```
   This runs `npm run build` and automatically pushes the contents of the `dist/` directory to the `gh-pages` branch.
3. In your GitHub repository:
   - Go to **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, choose **Deploy from a branch**.
   - Select the **`gh-pages`** branch and `/ (root)` folder, then click **Save**.

---

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## Configuration Details

- **Relative Asset Paths (`vite.config.ts`)**: Configured with `base: './'` so assets load correctly whether deployed at root (`https://username.github.io/`) or under a subpath repository (`https://username.github.io/repo-name/`).
- **SPA Fallback (`public/404.html`)**: Included to prevent 404 errors when reloading pages or navigating directly.
