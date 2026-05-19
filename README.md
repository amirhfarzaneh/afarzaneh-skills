# afarzanehskills

Personal collection of AI agent skills for Claude Code and GitHub Copilot.

## Usage

No install needed — run directly with `npx`:

```bash
npx afarzanehskills@latest add <skill> <agent>
```

**Agents:** `claude`, `copilot`

### Examples

```bash
# Add a skill for Claude Code
npx afarzanehskills@latest add amirethyst claude
# → writes to .claude/skills/amirethyst/SKILL.md

# Add a skill for GitHub Copilot
npx afarzanehskills@latest add amirethyst copilot
# → writes to .github/skills/amirethyst/SKILL.md

# List all available skills
npx afarzanehskills@latest list
```

---

## Maintaining this package

### Repo structure

```
skills/
  <skill-name>/
    SKILL.md        ← one file per skill, shared across all agents
```

### Adding a new skill

1. Create a folder under `skills/` with the skill name
2. Add a `SKILL.md` file inside it
3. Publish (see below)

```bash
mkdir skills/myskill
# write skills/myskill/SKILL.md
```

### Publishing changes

Bump the version and publish to npm:

```bash
# patch release (bug fixes, skill content edits)
npm version patch

# minor release (new skills added)
npm version minor

# then publish
npm publish --access public
```

Users running `npx afarzanehskills@latest` will automatically get the new version.

### First-time setup

```bash
npm login        # one-time, links your npm account
npm publish --access public
```
