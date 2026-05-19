import { join } from "path";

export const AGENTS = {
  claude: {
    label: "Claude Code",
    dest: (skillName) => join(".claude", "skills", skillName),
  },
  copilot: {
    label: "GitHub Copilot",
    dest: (skillName) => join(".github", "skills", skillName),
  },
};
