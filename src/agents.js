import { join } from "path";

export const AGENTS = {
  claude: {
    label: "Claude Code",
    dest: (skillName) => join(".claude", "skills", skillName, "SKILL.md"),
  },
  copilot: {
    label: "GitHub Copilot",
    dest: (skillName) => join(".github", "skills", skillName, "SKILL.md"),
  },
};
