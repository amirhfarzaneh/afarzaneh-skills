import { readdirSync, existsSync } from "fs";
import { join } from "path";

const SKILLS_DIR = join(new URL(".", import.meta.url).pathname, "..", "skills");

export function listSkills() {
  if (!existsSync(SKILLS_DIR)) return [];

  return readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(SKILLS_DIR, d.name, "SKILL.md")))
    .map((d) => d.name);
}
