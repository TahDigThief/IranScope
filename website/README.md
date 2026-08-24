# Iran, documented

A small, responsive React archive for the Markdown files in [`../posts`](../posts).

## Local development

From the repository root:

```bash
cd website
npm install
npm run dev
```

The `content` script scans every category directory and Markdown file under `posts/`, generating `src/content.json`. It runs automatically before both `dev` and `build`, so adding, removing, or renaming content requires no React code changes.

To test the production build locally:

```bash
npm run build
npm run preview
```

## GitHub Pages

The site uses a relative Vite base path (`./`), so it works from a project Pages URL. Build the `website` directory and publish its `dist` folder. For example, a GitHub Actions workflow can run `npm ci`, `npm run build` with `website` as its working directory, and deploy `website/dist` with GitHub Pages.

The app uses hash URLs for individual stories, which means links continue to work on GitHub Pages without server-side rewrite configuration.

