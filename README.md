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

## Blog

Posts live in `_posts/`, post assets live in `blob/`. The blog is at `/blog/`,
tags at `/blog/tags/`, RSS at `/feed.xml`.

### Writing a new post

1. Create `_posts/YYYY-MM-DD-your-slug.md`:

   ```markdown
   ---
   layout: post
   title: "Your title"
   date: 2026-11-19 10:00:00 +0800
   tags: [tag1, tag2]
   ---

   Body in Markdown.

   <img src="{{ site.baseurl }}/blob/<topic>/YYYY-MM-DD-slug.webp" width="450" alt="describe the image">
   ```

   Optional front matter (all fields can be omitted):

   ```yaml
   description: "一兩句摘要，約 80 字內"   # 列表卡片摘要、文章頁副標、搜尋結果與分享預覽
   category: SEO                           # 卡片和麵包屑上的分類；沒寫就用第一個 tag
   image: /blob/<topic>/YYYY-MM-DD-slug-cover.webp   # 封面圖（16:9）；也會當分享預覽圖
   image_alt: "封面圖描述"
   cover_text: "短標語"                    # 沒有封面圖時，色塊上顯示的字；沒寫就顯示分類
   author: 星河裂變團隊                    # 預設就是這個
   last_modified_at: 2026-12-01            # 有更新時填，文章頁會顯示更新日期
   cta_title: "文末 CTA 標題"              # 不寫就用預設文案
   cta_text: "文末 CTA 說明"
   ```

   The table of contents is generated automatically from `##` headings (3 or more).

2. Put images under `blob/<topic>/` and reference them as shown above.
3. Preview with `bundle exec jekyll serve`, then commit and push to `main`.

### Images must be WebP

All post images **must be `.webp`**. Convert before committing:

```bash
cwebp -q 80 input.png -o blob/<topic>/YYYY-MM-DD-slug.webp
# or: magick input.png -quality 80 blob/<topic>/YYYY-MM-DD-slug.webp
```

Do not commit `.png` / `.jpg` files. (SVG diagrams are the only other allowed
format.)
