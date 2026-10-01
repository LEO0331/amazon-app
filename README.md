# Family Cabinet

**A living digital archive of things a family makes, keeps and collects—documenting each object's story, history and place in the collection rather than trying to sell it.**

[Explore Family Cabinet](https://leo0331.github.io/family-cabinet/) · [閱讀繁體中文版](https://leo0331.github.io/family-cabinet/zh/)

A handmade wallet, a well-used camera, a book kept for years: each has a place in the cabinet. Browse the objects, see how they were made or found, and read why they have stayed—or where they went next. The current collection uses clearly fictional demonstration objects and illustrations.

## Screenshots

Home, archive, and object-record screenshots will be added after the demo illustrations are replaced. The live cabinet shows the current design.

## Explore the cabinet

- **Made by us:** handmade pieces with notes on materials, making, and use.
- **Collected over time:** books, cameras, figures, and small keepsakes gathered along the way.
- **The archive:** search stories and browse by type, category, status, tag, or year. The active filters stay in a URL you can bookmark or share.
- **Through time:** move through objects and memories by the year they belong to, with archive dates shown separately.
- **Object and memory records:** images, optional captions, a short history or story, relevant details, and related records. Each record has a quiet print view.

The site is available in English and Traditional Chinese. Switch languages from the navigation on any page; the switch opens the same record or section in the other language and keeps archive filters when possible.

## Why keep a record?

An object can matter long after its practical use changes. Family Cabinet records what it is, where it came from, who made or collected it, and why it remains part of the story. Some objects are in use, some are archived, and some have been gifted away. None are presented for sale.

## Privacy and demonstration content

All current records and artwork are fictional. This is a public site, so real private family stories, addresses, locations, and photographs do not belong in this repository. The publishing build accepts only records marked `public`; records marked `family` or `private` stop the build before their images can be processed.

## What may come next

These ideas are not features available today:

- **More detailed provenance:** record how an object's place or status changes when there is a real history worth telling.
- **Richer object-to-memory context:** add careful notes about how a public memory and its related objects connect, beyond a simple related link.
- **Real photography:** replace the fictional illustrations with photographs and captions chosen for public display.

The cabinet remains a curated static site; these ideas do not require accounts or a paid service.

## For contributors

### Site structure

The site uses Astro, TypeScript, Content Collections, standard CSS, local images, and GitHub Pages. English pages live at `/family-cabinet/`; Traditional Chinese pages live at `/family-cabinet/zh/`. The main routes in each language are Home, Made, Collected, Archive, Timeline, About, and `/item/[slug]/`. Memory notes use the same record route as objects.

Record source files are in `src/content/objects/`, validated by `src/content/config.ts`. Each record has a type (`made`, `collected`, or `memory`), category, summary, story, year, archive status, images, and visibility. Maker, creator, materials, tags, quantity, edition, and featured status are optional. An image may also have a visible `caption`, distinct from its accessible `alt` text. An optional `related` list names other public records by slug. The Chinese wording for public records is in `src/i18n/zh-objects.ts`; interface text is in `src/i18n/ui.ts`.

### Add an object

1. Copy a Markdown record in `src/content/objects/` to a new filename such as `canvas-tote.md`. Give it a fictional or publishable story and set `visibility: public` only when every detail is safe to share.
2. Put its images in `src/assets/items/<slug>/`. List them in the record's `images` field with accurate alt text. Add an optional caption when the image has context beyond what the alt text describes.
3. Add the matching Traditional Chinese title, summary, full story, metadata, and image descriptions to `src/i18n/zh-objects.ts`. If an English image has a caption, add an `imageCaptions` array in the same image order, using `null` for uncaptained images. A missing or misaligned translation will stop the bilingual build.
4. Run the checks below. A successful build creates the English and Chinese item pages and includes the record in both archives.

For a public memory, use one of the two existing memory Markdown files as a starting point. Set `type: memory`, write a clearly public story, and leave maker, materials, and quantity absent unless they genuinely apply. A `related` array such as `[brown-leather-wallet, canvas-market-tote]` links it to existing public records; the build rejects missing, private, or self-referencing slugs. Memories appear in the archive, chronology, and related records.

The chronology groups records by their `year` from newest to oldest. Within a year it uses archive date descending, then title, for a stable order. The displayed archive month is the date the record was added, not a claimed exact date for the object or memory.

### Replace placeholder images

Replace files in `src/assets/items/<slug>/` with photographs of the same object, then update the image paths, alt text, and any captions in the Markdown record and Chinese translation. Multiple images appear in the record gallery. Keep a consistent 4:3 or 3:4 crop, optimize the files, and remove sensitive metadata before committing public photographs. No image host or storage service is required.

### Run locally

Use Node.js 20 or newer:

```bash
npm install
npm run dev
```

Open the URL Astro prints, including `/family-cabinet/`. Before publishing, run:

```bash
npm run check
npm test
npm run build
npm run verify:build
```

The final command checks generated routes, local links and assets, language pages, and the public-content boundary. Build output is in `dist/`.

### Publish

The workflow in `.github/workflows/deploy.yml` installs dependencies, checks, tests, builds, and uploads only `dist/` to GitHub Pages. In **Settings → Pages**, choose **GitHub Actions** as the source. The repository's default branch is currently `master`, which is the branch the workflow deploys. Astro's `site` and `base` settings target `https://leo0331.github.io/family-cabinet/`; no deployment secrets or backend service are needed.
