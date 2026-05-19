import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, resolve } from "path";
import { AGENTS } from "./agents.js";

const GITHUB_RAW =
  "https://raw.githubusercontent.com/afarzaneh/afarzaneh-skills/main/skills";

async function fetchSkillContent(skillName, agentKey) {
  const url = `${GITHUB_RAW}/${skillName}/${agentKey}.md`;
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.text();
}

function readLocalSkill(skillName, agentKey) {
  // When running from inside this repo (development), use local files
  const localPath = join(
    new URL(".", import.meta.url).pathname,
    "..",
    "skills",
    skillName,
    `${agentKey}.md`
  );
  if (existsSync(localPath)) return readFileSync(localPath, "utf8");
  return null;
}

async function getSkillContent(skillName, agentKey, remote) {
  // Always try bundled (local) skills first — they ship with the npm package.
  // Only fall back to GitHub if --remote is passed (useful for dev without npm publish).
  const local = readLocalSkill(skillName, agentKey);
  if (local) return local;
  if (remote) return fetchSkillContent(skillName, agentKey);
  return null;
}

export async function installSkill(skillName, { cwd, agents, remote } = {}) {
  const targetDir = resolve(cwd || process.cwd());
  const targetAgents = agents
    ? Object.fromEntries(
        Object.entries(AGENTS).filter(([k]) => agents.includes(k))
      )
    : AGENTS;

  const results = [];

  for (const [agentKey, agent] of Object.entries(targetAgents)) {
    const content = await getSkillContent(skillName, agentKey, remote);

    if (!content) {
      results.push({ agent: agentKey, label: agent.label, status: "missing" });
      continue;
    }

    const dir = resolve(targetDir, agent.destDir(skillName));
    const filePath = join(dir, agent.fileName(skillName));

    mkdirSync(dir, { recursive: true });

    if (agent.append && existsSync(filePath)) {
      const existing = readFileSync(filePath, "utf8");
      const sep = agent.separator || "\n\n";
      // Avoid duplicating the same skill
      if (!existing.includes(content.trim())) {
        writeFileSync(filePath, existing.trimEnd() + sep + content);
      } else {
        results.push({ agent: agentKey, label: agent.label, status: "already-installed", path: filePath });
        continue;
      }
    } else {
      writeFileSync(filePath, content);
    }

    results.push({ agent: agentKey, label: agent.label, status: "installed", path: filePath });
  }

  return results;
}
