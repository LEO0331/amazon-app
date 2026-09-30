# Family Cabinet

**A living digital archive of things a family makes, keeps and collects—documenting each object's story, history and place in the collection rather than trying to sell it.**

Family Cabinet presents handmade pieces and collected objects as records in a small, evolving archive. Each record can describe an object's origin, materials, maker or creator, current status, and the reason it is kept. This repository contains fictional demonstration content; it is a public portfolio project.

## Screenshots

Screenshots are not committed yet. The site can be previewed locally with `npm run dev`.

## What you can explore

- Editorial home page with selected made and collected objects and recent additions.
- Dedicated Made and Collected views, plus a searchable and filterable archive.
- Object records with stories, metadata, and image galleries.
- One validated Astro content model for made objects, collected objects, and future memories.
- Static pages generated only for records marked `public`.

## Information architecture

| Route | Purpose |
| --- | --- |
| `/` | Introduces the cabinet and highlights selected and recent objects. |
| `/made` | Objects made by the family. |
| `/collected` | Objects collected or kept over time. |
| `/archive` | Search, filters, and sorting across public objects. |
| `/about` | The project's purpose and its evolution from an ecommerce demo. |
| `/item/[slug]` | The story, images, and details of one public object. |

All routes are served under `/amazon-app/` on this repository's GitHub Pages site. The content model already accepts `memory` as a type so a future `/memories` section can be added without changing the object model.

## Content model

Object entries live in `src/content/objects/` and are validated by `src/content/config.ts`. The shared record includes a title, type, category, summary, story, year, archive status, date added, image references, and visibility. Optional fields such as maker, creator, materials, tags, quantity, and featured status let each record describe the object without forcing irrelevant fields on it.

Types are `made`, `collected`, and `memory`. Archive statuses include `at-home`, `in-use`, `gifted`, `archived`, and `no-longer-with-us`. These describe an object's place in the collection rather than a sales state.

## Privacy model

Visibility can be `public`, `family`, or `private`. The V1 site has no sign-in system. Its build rejects any `family` or `private` record before Astro processes content images, so only `public` records can enter generated pages, search data, client-side scripts, or assets. The other values reserve a future privacy boundary; they do not grant access to anything in this static version.

**Do not commit actual private family content to this public repository.** Source files and Git history are public even if the build excludes them. Review photos before adding them, remove location and other sensitive metadata, and do not include addresses, geolocation, or personal details in public records. The current entries and artwork are fictional placeholders.

## Technical stack

- Astro and TypeScript
- Astro Content Collections for structured object records
- Standard CSS
- Local image assets
- Static GitHub Pages hosting, with no backend, database, or authentication in V1

## Local development

Install Node.js 20 or newer, then run:

```bash
npm install
npm run dev
```

Open the local URL printed by Astro. The project is configured for the `/amazon-app/` project-page base path; use that path when following local links.

## Add an object

1. Copy a representative Markdown entry in `src/content/objects/` to a new file named for the object's slug, such as `canvas-tote.md`.
2. Edit its frontmatter and story. Use one of the schema's supported `type`, `status`, and `visibility` values. Keep demonstration entries fictional and set `visibility: public` only when the content is safe to publish.
3. Put the object's image files in `src/assets/items/<slug>/` and reference them in the entry's `images` field using relative paths, as the existing examples do. Provide useful alt text for each image.
4. Run `npm run check` and `npm run build` to validate the entry and its image paths. A public entry will then appear in the appropriate collection view and at `/item/<slug>/` (under the configured base path).

## Replace placeholder images

Each object's local artwork is in `src/assets/items/<slug>/`. Replace those files with photographs of the same object and update the matching Markdown entry's `images` references and alt text. Keep several images in that folder if the gallery should show multiple views. Use a consistent editorial crop, preferably 4:3 or 3:4, and optimized image files. Check that any photograph is intended for public display and strip sensitive metadata before committing it. No remote image host is needed.

## Quality checks

```bash
npm run check
npm test
npm run build
npm run verify:build
```

The build output is in `dist/`. The final command checks generated routes, local links and assets, and the public-content boundary. These checks also run in the GitHub Actions workflow.

## GitHub Pages deployment

`.github/workflows/deploy.yml` installs dependencies with `npm ci`, checks and tests the site, builds Astro, and uploads `dist/` as a Pages artifact. Pull requests run the quality checks and build. Pushes to `master`, or manual workflow runs selected on `master`, deploy the static site through GitHub Pages. In the repository's **Settings → Pages**, select **GitHub Actions** as the build and deployment source.

The Astro `site` and `base` settings must match this project page, `https://leo0331.github.io/amazon-app/` and `/amazon-app/`. Keep base-aware links and local image references when adding pages or assets. No deployment secrets or backend service are required.

## Roadmap

**V2 — Family administration.** A possible private administration layer could use Supabase Auth, Postgres, Storage, and Row Level Security. Authenticated family members could add and edit objects, upload photos, update statuses, manage tags, and access family-only content. This is a future direction, not part of the public static site.

**V3 — Memory layer.** Family photographs, timelines, provenance, related memories, and links between objects and memories could turn the catalogue into a fuller family archive. The existing `memory` type is an initial content-model allowance, not a published memory section.

## Repository name

The GitHub repository remains `amazon-app` for now. A future rename to `family-cabinet` or a similar name would better describe the project. A suggested GitHub About description is: **A living digital archive of things a family makes, keeps and collects, documenting their stories, history and place in the collection.**
