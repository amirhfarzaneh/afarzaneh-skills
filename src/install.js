import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, resolve, dirname } from "path";
import { AGENTS } from "./agents.js";

const SKILLS_DIR = join(new URL(".", import.meta.url).pathname, "..", "skills");

function readLocalSkill(skillName) {
  const p = join(SKILLS_DIR, skillName, "SKILL.md");
  if (existsSync(p)) return readFileSync(p, "utf8");
  return null;
}

export async function installSkill(skillName, agentKey, { cwd } = {}) {
  const agent = AGENTS[agentKey];
  if (!agent) throw new Error(`Unknown agent "${agentKey}". Valid: ${Object.keys(AGENTS).join(", ")}`);

  const content = readLocalSkill(skillName);
  if (!content) return { status: "missing" };

  const targetDir = resolve(cwd || process.cwd());
  const destRel = agent.dest(skillName);
  const destAbs = resolve(targetDir, destRel);

  mkdirSync(dirname(destAbs), { recursive: true });
  writeFileSync(destAbs, content);

  return { status: "installed", path: destAbs, label: agent.label };
}
