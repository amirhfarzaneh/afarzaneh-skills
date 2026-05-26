---
name: second-brain
description: "Sectorized second brain: build/query independent interlinked markdown knowledge bases."
version: 1.0.0
author: Amir Hossein Farzaneh
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [wiki, knowledge-base, research, notes, markdown, rag-alternative]
    category: research
    related_skills: [obsidian, arxiv]
---

# Sectorized Second Brain

Build and maintain persistent, compounding knowledge bases as interlinked markdown files.
Based on [Andrej Karpathy's LLM Wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f).

Unlike traditional RAG (which rediscovers knowledge from scratch per query), each sector wiki
compiles knowledge once and keeps it current. Cross-references are already there.
Contradictions have already been flagged. Synthesis reflects everything ingested.

**Division of labor:** The human curates sources and directs analysis. The agent
summarizes, cross-references, files, and maintains consistency.

This customized version is built for a **second brain** that contains multiple
independent **sectors** side by side. Each sector has its own wiki root, schema,
index, log, raw sources, and ontology. The shared parent directory is only a
container for discovery.

## When This Skill Activates

Use this skill when the user:
- Asks to create, build, or start a sector knowledge base inside their second brain
- Asks to ingest, add, or process a source into a specific sector
- Asks a question about one target sector
- Asks to lint, audit, or health-check one sector
- References their second brain, a sector knowledge base, or research notes in a sectorized setup

## Root Model

**Location:** Set via `SECOND_BRAIN_PATH` environment variable (for example in `~/.hermes/.env`).

If unset, defaults to `~/second-brain`.

```bash
SECOND_BRAIN="${SECOND_BRAIN_PATH:-$HOME/second-brain}"
```

Every operation resolves exactly one target sector under `SECOND_BRAIN_PATH`.

The second brain is just a directory tree of markdown files — open a sector in Obsidian,
VS Code, or any editor. No database, no special tooling required.

## Second Brain Layout

```
second-brain/
├── software/
│   ├── SCHEMA.md       # Sector manifest + conventions + taxonomy + thresholds
│   ├── index.md        # Sector content catalog
│   ├── log.md          # Sector action log
│   ├── raw/
│   │   ├── articles/
│   │   ├── papers/
│   │   ├── transcripts/
│   │   └── assets/
│   ├── entities/
│   ├── concepts/
│   ├── comparisons/
│   └── queries/
├── research/
│   └── ... same scaffold ...
└── personal/
    └── ... same scaffold ...
```

The `SECOND_BRAIN_PATH` root is **passive**:
- No root-level `SCHEMA.md`
- No root-level `index.md`
- No root-level `log.md`
- No cross-sector wikilinks
- No shared raw-source store

Each sector is fully independent. Shared mechanics are standardized; ontology is local.

## Architecture: Three Layers Per Sector

**Layer 1 — Raw Sources:** Immutable and sector-local. The agent reads but never modifies these.
**Layer 2 — The Sector Wiki:** Agent-owned markdown files. Created, updated, and cross-referenced by the agent.
**Layer 3 — The Sector Schema:** `SCHEMA.md` defines the sector manifest, conventions, taxonomy, and thresholds.

## Sector Resolution

Every ingest, query, and lint operation must resolve exactly one target sector.

Resolution precedence:
1. Explicit path inside a sector wiki root
2. Canonical sector name from the sector manifest
3. Sector alias from the sector manifest
4. Otherwise ask the user

Rules:
- Canonical sector names and aliases must be globally unique within `SECOND_BRAIN_PATH`
- Sector directory names must match the slug of the canonical `sector` name
- If a path sits inside exactly one sector root, infer the target sector automatically
- If a sector manifest is invalid, that sector is unusable until fixed
- If a request spans multiple sectors, stop and ask the user to pick one. This skill does not perform cross-sector synthesis.

## Resuming an Existing Sector (CRITICAL — do this every session)

When the user has an existing second brain, **always resolve the target sector before doing anything**.

After the target sector is resolved, orient yourself only inside that sector:

① **Read `SCHEMA.md`** — understand the domain, conventions, and tag taxonomy.
② **Read `index.md`** — learn what pages exist and their summaries.
③ **Scan recent `log.md`** — read the last 20-30 entries to understand recent activity.

```bash
SECOND_BRAIN="${SECOND_BRAIN_PATH:-$HOME/second-brain}"
SECTOR_ROOT="$SECOND_BRAIN/<sector-slug>"

# Orientation reads after sector resolution
read_file "$SECTOR_ROOT/SCHEMA.md"
read_file "$SECTOR_ROOT/index.md"
read_file "$SECTOR_ROOT/log.md" offset=<last 30 lines>
```

Only after orientation should you ingest, query, or lint. This prevents:
- Creating duplicate pages for entities that already exist
- Missing cross-references to existing content
- Contradicting the schema's conventions
- Repeating work already logged

For large sectors (100+ pages), also run a quick search for the topic at hand before creating anything new.

## Initializing a New Sector

When the user asks to create or start a sector:

1. Resolve `SECOND_BRAIN_PATH`
2. Ask for the target sector name if it is not explicit
3. If the sector does not exist yet, confirm with the user before creating it
4. Derive the sector slug from the canonical sector name
5. Interview the user for the sector ontology:
   - what the sector covers
   - what it excludes
   - top-level tag taxonomy
   - page-creation thresholds
6. Fully initialize the standard sector scaffold
7. Write `SCHEMA.md` with both the required sector manifest and the sector-specific ontology
8. Write initial `index.md` and `log.md`
9. Confirm the sector is ready and suggest first sources to ingest

Creation rules:
- Confirmation is required only when creating a missing sector
- Once confirmed, initialize the full scaffold immediately
- Do not create stub sectors
- Do not create sectors implicitly during ingest, query, or lint

### SCHEMA.md Template

Adapt this to the target sector. The schema constrains agent behavior and ensures consistency:

```markdown
# Sector Schema

## Sector Manifest
sector: [canonical sector name]
domain: [short description of what this sector covers]
aliases: [optional aliases, may be empty]

## Domain
[What this sector covers — e.g., "biotechnology companies and platforms"]

## Exclusions
[What this sector does not cover and should avoid filing]

## Conventions
- File names: lowercase, hyphens, no spaces (e.g., `transformer-architecture.md`)
- Every wiki page starts with YAML frontmatter (see below)
- Use `[[wikilinks]]` to link between pages (minimum 2 outbound links per page)
- When updating a page, always bump the `updated` date
- Every new page must be added to `index.md` under the correct section
- Every action must be appended to `log.md`
- Never create cross-sector wikilinks
- **Provenance markers:** On pages that synthesize 3+ sources, append `^[raw/articles/source-file.md]`
  at the end of paragraphs whose claims come from a specific source. This lets a reader trace each
  claim back without re-reading the whole raw file. Optional on single-source pages where the
  `sources:` frontmatter is enough.

## Frontmatter
  ```yaml
  ---
  title: Page Title
  created: YYYY-MM-DD
  updated: YYYY-MM-DD
  type: entity | concept | comparison | query | summary
  tags: [from taxonomy below]
  sources: [raw/articles/source-name.md]
  # Optional quality signals:
  confidence: high | medium | low        # how well-supported the claims are
  contested: true                        # set when the page has unresolved contradictions
  contradictions: [other-page-slug]      # pages this one conflicts with
  ---
  ```

`confidence` and `contested` are optional but recommended for opinion-heavy or fast-moving
topics. Lint surfaces `contested: true` and `confidence: low` pages for review so weak claims
don't silently harden into accepted sector fact.

### raw/ Frontmatter

Raw sources also get a small frontmatter block so re-ingests can detect drift:

```yaml
---
source_url: https://example.com/article   # original URL, if applicable
ingested: YYYY-MM-DD
sha256: <hex digest of the raw content below the frontmatter>
---
```

The `sha256:` lets a future re-ingest of the same URL skip processing when content is unchanged,
and flag drift when it has changed. Compute over the body only (everything after the closing
`---`), not the frontmatter itself. If the same external source matters to multiple sectors,
each sector stores its own raw copy and hash inside its own `raw/` tree.

## Tag Taxonomy
[Define 10-20 top-level tags for this sector. Add new tags here BEFORE using them.]

Example for AI/ML:
- Models: model, architecture, benchmark, training
- People/Orgs: person, company, lab, open-source
- Techniques: optimization, fine-tuning, inference, alignment, data
- Meta: comparison, timeline, controversy, prediction

Rule: every tag on a page must appear in this taxonomy. If a new tag is needed,
add it here first, then use it. This prevents tag sprawl.

## Page Thresholds
- **Create a page** when an entity/concept appears in 2+ sector sources OR is central to one source
- **Add to existing page** when a source mentions something already covered
- **DON'T create a page** for passing mentions, minor details, or things outside the domain
- **Split a page** when it exceeds ~200 lines — break into sub-topics with cross-links
- **Archive a page** when its content is fully superseded — move to `_archive/`, remove from index

## Entity Pages
One page per notable entity. Include:
- Overview / what it is
- Key facts and dates
- Relationships to other entities ([[wikilinks]])
- Source references

## Concept Pages
One page per concept or topic. Include:
- Definition / explanation
- Current state of knowledge
- Open questions or debates
- Related concepts ([[wikilinks]])

## Comparison Pages
Side-by-side analyses. Include:
- What is being compared and why
- Dimensions of comparison (table format preferred)
- Verdict or synthesis
- Sources

## Update Policy
When new information conflicts with existing content:
1. Check the dates — newer sources generally supersede older ones
2. If genuinely contradictory, note both positions with dates and sources
3. Mark the contradiction in frontmatter: `contradictions: [page-name]`
4. Flag for user review in the lint report
```

### index.md Template

The index is sectioned by type. Each entry is one line: wikilink + summary.

```markdown
# Sector Index

> Content catalog. Every wiki page listed under its type with a one-line summary.
> Read this first to find relevant pages for any query.
> Last updated: YYYY-MM-DD | Total pages: N

## Entities
<!-- Alphabetical within section -->

## Concepts

## Comparisons

## Queries
```

**Scaling rule:** When any section exceeds 50 entries, split it into sub-sections
by first letter or sub-domain. When the index exceeds 200 entries total, create
a `_meta/topic-map.md` that groups pages by theme for faster navigation.

### log.md Template

```markdown
# Sector Log

> Chronological record of all wiki actions. Append-only.
> Format: `## [YYYY-MM-DD] action | subject`
> Actions: ingest, update, query, lint, create, archive, delete
> When this file exceeds 500 entries, rotate: rename to log-YYYY.md, start fresh.

## [YYYY-MM-DD] create | Sector initialized
- Sector: [canonical sector name]
- Domain: [domain]
- Structure created with SCHEMA.md, index.md, log.md
```

## Core Operations

### 1. Ingest

When the user provides a source (URL, file, paste), integrate it into the target sector:

0. **Resolve the target sector first**.
  - Never ingest across multiple sectors in one run
  - If the sector does not exist, ask whether to create it first

① **Capture the raw source:**
   - URL → use `web_extract` to get markdown, save to `raw/articles/`
   - PDF → use `web_extract` (handles PDFs), save to `raw/papers/`
   - Pasted text → save to appropriate `raw/` subdirectory
   - Name the file descriptively: `raw/articles/karpathy-llm-wiki-2026.md`
   - **Add raw frontmatter** (`source_url`, `ingested`, `sha256` of the body).
     On re-ingest of the same URL: recompute the sha256, compare to the stored value —
     skip if identical, flag drift and update if different. This is cheap enough to
     do on every re-ingest and catches silent source changes.
  - If the same source also matters to another sector, ingest it separately in that sector later.
  - **GitHub repos as a source:** when ingesting a repo (`github.com/<owner>/<name>`),
    don't just `web_extract` the rendered HTML — it loses metadata. Fetch two things:
    (1) the README via `raw.githubusercontent.com/<owner>/<name>/<default_branch>/README.md`,
    (2) repo metadata via `api.github.com/repos/<owner>/<name>` (description, language,
    license SPDX id, stars, forks, default_branch, topics, archived, created_at,
    pushed_at). Save both into one raw file under `raw/articles/<repo-slug>-readme.md`
    with the API metadata as a small block above the README body. This gives entity
    pages durable, citable facts (license, activity, language) that the rendered README
    alone won't reliably carry. Repos get a page when notable — file the page under
    `entities/` with `type: repo` and list it under the **Repos** section of `index.md`,
    not **Entities**.
  - **Client-hydrated share links (ChatGPT `chatgpt.com/s/...`, Claude `claude.ai/share/...`,
    some Notion/Substack/X posts):** the conversation/post body is rendered by JavaScript
    after an auth/region gate; raw HTML from curl or a headless browser typically returns
    only auth/landing scaffolding (e.g. ChatGPT serves a "VPN Connection Issue" page when
    the host IP is geo/proxy-blocked). Don't burn cycles re-trying with different user
    agents — surface the limitation immediately and ask the user to paste the content,
    export it as PDF/markdown from a logged-in browser, or retry via a VPN-routed host.
    See `references/share-link-extraction.md` for symptoms and fallbacks.

② **Discuss takeaways** with the user — what's interesting, what matters for
  the sector domain. (Skip this in automated/cron contexts — proceed directly.)

③ **Check what already exists** — search index.md and use `search_files` to find
   existing pages for mentioned entities/concepts. This is the difference between
   a growing wiki and a pile of duplicates.

④ **Write or update wiki pages:**
   - **New entities/concepts:** Create pages only if they meet the Page Thresholds
     in SCHEMA.md (2+ source mentions, or central to one source)
   - **Existing pages:** Add new information, update facts, bump `updated` date.
     When new info contradicts existing content, follow the Update Policy.
   - **Cross-reference:** Every new or updated page must link to at least 2 other
     pages via `[[wikilinks]]`. Check that existing pages link back.
   - **Tags:** Only use tags from the taxonomy in SCHEMA.md
   - **Provenance:** On pages synthesizing 3+ sources, append `^[raw/articles/source.md]`
     markers to paragraphs whose claims trace to a specific source.
   - **Confidence:** For opinion-heavy, fast-moving, or single-source claims, set
     `confidence: medium` or `low` in frontmatter. Don't mark `high` unless the
     claim is well-supported across multiple sources.

⑤ **Update navigation:**
   - Add new pages to `index.md` under the correct section, alphabetically
   - Update the "Total pages" count and "Last updated" date in index header
   - Append to `log.md`: `## [YYYY-MM-DD] ingest | Source Title`
   - List every file created or updated in the log entry

⑥ **Report what changed** — list every file created or updated to the user.

A single source can trigger updates across 5-15 wiki pages. This is normal
and desired — it's the compounding effect.

### 2. Query

When the user asks a question about the target sector:

0. **Resolve one target sector first**.
  - If the request spans multiple sectors, stop and ask the user to narrow it

① **Read `index.md`** to identify relevant pages.
② **For sectors with 100+ pages**, also `search_files` across all `.md` files
   for key terms — the index alone may miss relevant content.
③ **Read the relevant pages** using `read_file`.
④ **Synthesize an answer** from the compiled knowledge. Cite the wiki pages
   you drew from: "Based on [[page-a]] and [[page-b]]..."
⑤ **File valuable answers back** — if the answer is a substantial comparison,
   deep dive, or novel synthesis, create a page in `queries/` or `comparisons/`.
   Don't file trivial lookups — only answers that would be painful to re-derive.
⑥ **Update log.md** with the query and whether it was filed.

### 3. Lint

When the user asks to lint, health-check, or audit a sector:

0. **Resolve one target sector first**.

① **Orphan pages:** Find pages with no inbound `[[wikilinks]]` from other pages.
```python
# Use execute_code for this — programmatic scan across all wiki pages
import os, re
from collections import defaultdict
wiki = "<SECTOR_ROOT>"
# Scan all .md files in entities/, concepts/, comparisons/, queries/
# Extract all [[wikilinks]] — build inbound link map
# Pages with zero inbound links are orphans
```

② **Broken wikilinks:** Find `[[links]]` that point to pages that don't exist.

③ **Index completeness:** Every wiki page should appear in `index.md`. Compare
   the filesystem against index entries.

④ **Frontmatter validation:** Every wiki page must have all required fields
   (title, created, updated, type, tags, sources). Tags must be in the taxonomy.

⑤ **Stale content:** Pages whose `updated` date is >90 days older than the most
   recent source that mentions the same entities.

⑥ **Contradictions:** Pages on the same topic with conflicting claims. Look for
   pages that share tags/entities but state different facts. Surface all pages
   with `contested: true` or `contradictions:` frontmatter for user review.

⑦ **Quality signals:** List pages with `confidence: low` and any page that cites
   only a single source but has no confidence field set — these are candidates
   for either finding corroboration or demoting to `confidence: medium`.

⑧ **Source drift:** For each file in `raw/` with a `sha256:` frontmatter, recompute
   the hash and flag mismatches. Mismatches indicate the raw file was edited
   (shouldn't happen — raw/ is immutable) or ingested from a URL that has since
   changed. Not a hard error, but worth reporting.

⑨ **Page size:** Flag pages over 200 lines — candidates for splitting.

⑩ **Tag audit:** List all tags in use, flag any not in the SCHEMA.md taxonomy.

⑪ **Log rotation:** If log.md exceeds 500 entries, rotate it.

⑫ **Root passivity:** List anything that lives directly under `SECOND_BRAIN_PATH` other than sector
  directories. Stray files at the root (especially empty `.md` files matching a sector page's slug)
  silently hijack `[[wikilinks]]` in editors like Obsidian when the user opens the vault at the
  `SECOND_BRAIN_PATH` level — Obsidian resolves the link to the shortest-path match, which is the
  empty stub at the root, not the populated page inside the sector. Report any non-sector entries
  under the root and offer to delete them.

⑬ **Discovery audit:** Scan sibling sector manifests under `SECOND_BRAIN_PATH` for:
  - duplicate canonical sector names
  - duplicate aliases
  - invalid manifest minimums
  - sector-slug mismatches

⑭ **Report findings** with specific file paths and suggested actions, grouped by
  severity (broken links > manifest/discovery errors > root-passivity violations > orphans > source drift > contested pages > stale content > style issues).

⑮ **Append to log.md:** `## [YYYY-MM-DD] lint | N issues found`

## Working with the Second Brain

### Searching

```bash
SECOND_BRAIN="${SECOND_BRAIN_PATH:-$HOME/second-brain}"
SECTOR_ROOT="$SECOND_BRAIN/<sector-slug>"

# Find pages by content
search_files "transformer" path="$SECTOR_ROOT" file_glob="*.md"

# Find pages by filename
search_files "*.md" target="files" path="$SECTOR_ROOT"

# Find pages by tag
search_files "tags:.*alignment" path="$SECTOR_ROOT" file_glob="*.md"

# Discover sectors by manifest
search_files "sector:" path="$SECOND_BRAIN" file_glob="*/SCHEMA.md"

# Recent activity
read_file "$SECTOR_ROOT/log.md" offset=<last 20 lines>
```

### Bulk Ingest

When ingesting multiple sources at once, batch the updates:
1. Read all sources first
2. Identify all entities and concepts across all sources
3. Check existing pages for all of them (one search pass, not N)
4. Create/update pages in one pass (avoids redundant updates)
5. Update index.md once at the end
6. Write a single log entry covering the batch

Bulk ingest remains single-sector. Do not batch across sectors in one run.

### Archiving

When content is fully superseded or the domain scope changes:
1. Create `_archive/` directory if it doesn't exist
2. Move the page to `_archive/` with its original path (e.g., `_archive/entities/old-page.md`)
3. Remove from `index.md`
4. Update any pages that linked to it — replace wikilink with plain text + "(archived)"
5. Log the archive action

### Obsidian Integration

Each sector wiki root works as an Obsidian vault out of the box:
- `[[wikilinks]]` render as clickable links
- Graph View visualizes the knowledge network
- YAML frontmatter powers Dataview queries
- The `raw/assets/` folder holds images referenced via `![[image.png]]`

For best results:
- Set Obsidian's attachment folder to `raw/assets/`
- Enable "Wikilinks" in Obsidian settings (usually on by default)
- Install Dataview plugin for queries like `TABLE tags FROM "entities" WHERE contains(tags, "company")`

If using the Obsidian skill alongside this one, set `OBSIDIAN_VAULT_PATH` to the
selected sector root, not the passive `SECOND_BRAIN_PATH` container.

### Obsidian Headless (servers and headless machines)

On machines without a display, use `obsidian-headless` instead of the desktop app.
It syncs vaults via Obsidian Sync without a GUI — perfect for agents running on
servers that write to one sector while Obsidian desktop reads it on another device.

**Setup:**
```bash
# Requires Node.js 22+
npm install -g obsidian-headless

# Login (requires Obsidian account with Sync subscription)
ob login --email <email> --password '<password>'

# Create a remote vault for one sector
ob sync-create-remote --name "Biotech Sector"

# Connect the sector directory to the vault
cd ~/second-brain/biotech
ob sync-setup --vault "<vault-id>"

# Initial sync
ob sync

# Continuous sync (foreground — use systemd for background)
ob sync --continuous
```

**Continuous background sync via systemd:**
```ini
# ~/.config/systemd/user/obsidian-wiki-sync.service
[Unit]
Description=Obsidian LLM Wiki Sync
After=network-online.target
Wants=network-online.target

[Service]
ExecStart=/path/to/ob sync --continuous
WorkingDirectory=/home/user/second-brain/biotech
Restart=on-failure
RestartSec=10

[Install]
WantedBy=default.target
```

```bash
systemctl --user daemon-reload
systemctl --user enable --now obsidian-wiki-sync
# Enable linger so sync survives logout:
sudo loginctl enable-linger $USER
```

This lets the agent write to one sector on a server while you browse the same
sector vault in Obsidian on your laptop/phone — changes appear within seconds.

## Pitfalls

- **Never modify files in `raw/`** — sources are immutable. Corrections go in wiki pages.
- **Always resolve the target sector first** — this skill never operates across multiple sectors in one run.
- **Always orient after resolution** — read sector SCHEMA + index + recent log before work.
  Skipping this causes duplicates and missed cross-references.
- **Always update index.md and log.md** — skipping this makes the wiki degrade. These are the
  navigational backbone.
- **Don't create pages for passing mentions** — follow the Page Thresholds in SCHEMA.md. A name
  appearing once in a footnote doesn't warrant an entity page.
- **Don't create pages without cross-references** — isolated pages are invisible. Every page must
  link to at least 2 other pages.
- **Don't create cross-sector wikilinks** — sector boundaries are hard boundaries.
- **Keep `SECOND_BRAIN_PATH` root passive** — never create files directly under the root. Stray
  root-level `.md` files silently hijack `[[wikilinks]]` in Obsidian when the user opens the vault
  at the root level (shortest-path resolution wins). When a user reports "page looks empty in my
  editor" but the sector page on disk is populated, suspect a duplicate-slug collision at the root
  before blaming sync lag or editor cache. See `references/wikilink-resolution-troubleshooting.md`.
- **Frontmatter is required** — it enables search, filtering, and staleness detection.
- **Tags must come from the taxonomy** — freeform tags decay into noise. Add new tags to SCHEMA.md
  first, then use them.
- **Keep pages scannable** — a wiki page should be readable in 30 seconds. Split pages over
  200 lines. Move detailed analysis to dedicated deep-dive pages.
- **Don't create missing sectors implicitly** — confirm before initialization, then create the full scaffold.
- **Rotate the log** — when log.md exceeds 500 entries, rename it `log-YYYY.md` and start fresh.
  The agent should check log size during lint.
- **Handle contradictions explicitly** — don't silently overwrite. Note both claims with dates,
  mark in frontmatter, flag for user review.
- **Keep provenance sector-local** — if the same source matters to two sectors, ingest it twice.
- **Treat invalid manifests as blocking** — do not guess around malformed sector identity.

## Related Tools

[llm-wiki-compiler](https://github.com/atomicmemory/llm-wiki-compiler) is a Node.js CLI that
compiles sources into a concept wiki with the same Karpathy inspiration. It's Obsidian-compatible,
so users who want a scheduled/CLI-driven compile pipeline can point it at a sector root this
skill maintains. Trade-offs: it owns page generation (replaces the agent's judgment on page
creation) and is tuned for small corpora. Use this skill when you want agent-in-the-loop curation
within one sector; use llmwiki when you want batch compile of a source directory.