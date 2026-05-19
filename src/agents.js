import { join } from "path";

// Each agent entry: where its skill file goes relative to cwd
// `append: true` means we append to the file instead of overwriting
export const AGENTS = {
  claude: {
    label: "Claude Code",
    destDir: (skillName) => join(".claude", "skills"),
    fileName: (skillName) => `${skillName}.md`,
    append: false,
  },
  copilot: {
    label: "GitHub Copilot",
    destDir: () => ".github",
    fileName: () => "copilot-instructions.md",
    append: true,
    separator: "\n\n---\n\n",
  },
  codex: {
    label: "OpenAI Codex",
    destDir: () => ".",
    fileName: () => "AGENTS.md",
    append: true,
    separator: "\n\n---\n\n",
  },
};
