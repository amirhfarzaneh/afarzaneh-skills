import { readdirSync, existsSync } from "fs";
import { join } from "path";
import { AGENTS } from "./agents.js";

const SKILLS_DIR = join(new URL(".", import.meta.url).pathname, "..", "skills");

export function listSkills() {
  if (!existsSync(SKILLS_DIR)) return [];

  return readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const agentKeys = Object.keys(AGENTS).filter((k) =>
        existsSync(join(SKILLS_DIR, d.name, `${k}.md`))
      );
      return { name: d.name, agents: agentKeys };
    });
}
