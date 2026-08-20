# Nova Split

Jekyll source for Nova Split, an AI SEO Generator. It turns a product brief
into deep research, target-audience persona profiles, and SEO article
directions adapted to a platform and business goal.

## Local development

```bash
docker compose up site
```

Site runs at http://localhost:14001 with livereload.

Without Docker, if you have Ruby + Bundler installed:

```bash
bundle install
bundle exec jekyll serve
```

## Language routes

```
index.html              # Language preference redirect; defaults to /zh/
en/index.html           # English landing page
zh/index.html           # Traditional Chinese landing page
_layouts/base.html      # Shared navigation and language preference handling
assets/css/main.css     # Shared visual system and landing-page UI
```

## Deployment

Auto-deploys to GitHub Pages on push to `main` via
`.github/workflows/jekyll.yml`, which builds this repo with the `Dockerfile`
above and publishes `_site/`. Custom domain is set via `CNAME`.
