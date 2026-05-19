import { cpSync, readdirSync, existsSync } from "fs";
import { join, resolve } from "path";
import { AGENTS } from "./agents.js";

const SKILLS_DIR = join(new URL(".", import.meta.url).pathname, "..", "skills");

export async function installSkill(skillName, agentKey, { cwd } = {}) {
  const agent = AGENTS[agentKey];
  if (!agent) throw new Error(`Unknown agent "${agentKey}". Valid: ${Object.keys(AGENTS).join(", ")}`);

  const srcDir = join(SKILLS_DIR, skillName);
  if (!existsSync(srcDir)) return { status: "missing" };

  const files = readdirSync(srcDir, { recursive: true }).filter(
    (f) => !f.startsWith(".")
  );
  if (!files.length) return { status: "missing" };

  const targetDir = resolve(cwd || process.cwd());
  const destAbs = resolve(targetDir, agent.dest(skillName));

  cpSync(srcDir, destAbs, { recursive: true });

  return { status: "installed", path: destAbs, label: agent.label, files };
}
