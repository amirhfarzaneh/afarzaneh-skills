#!/usr/bin/env node
import { installSkill } from "../src/install.js";
import { listSkills } from "../src/list.js";
import { AGENTS } from "../src/agents.js";

const [, , command, ...args] = process.argv;

function usage() {
  console.log(`
  afarzanehskills <command> [options]

  Commands:
    add <skill>           Install a skill for all agents
    add <skill> --only claude,copilot
                          Install for specific agents only
    list                  List available skills

  Examples:
    npx afarzanehskills@latest add amirethyst
    npx afarzanehskills@latest add amirethyst --only claude
    npx afarzanehskills@latest list
  `);
}

async function cmdAdd(args) {
  const skillName = args[0];
  if (!skillName) {
    console.error("Error: skill name required.\n  afarzanehskills add <skill>");
    process.exit(1);
  }

  const onlyIdx = args.indexOf("--only");
  let agents = null;
  if (onlyIdx !== -1) {
    agents = args[onlyIdx + 1]?.split(",").map((s) => s.trim());
    const valid = Object.keys(AGENTS);
    const bad = agents?.filter((a) => !valid.includes(a));
    if (bad?.length) {
      console.error(`Unknown agent(s): ${bad.join(", ")}. Valid: ${valid.join(", ")}`);
      process.exit(1);
    }
  }

  console.log(`\nInstalling skill "${skillName}"...\n`);

  const remote = args.includes("--remote");

  let results;
  try {
    results = await installSkill(skillName, { agents, remote });
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }

  let anyFailed = false;
  for (const r of results) {
    if (r.status === "installed") {
      console.log(`  [ok]      ${r.label}: ${r.path}`);
    } else if (r.status === "already-installed") {
      console.log(`  [skip]    ${r.label}: already installed`);
    } else if (r.status === "missing") {
      console.log(`  [none]    ${r.label}: no skill file found`);
      anyFailed = true;
    }
  }

  const installed = results.filter((r) => r.status === "installed").length;
  if (installed === 0 && anyFailed) {
    console.error(`\nSkill "${skillName}" not found. Run "list" to see available skills.`);
    process.exit(1);
  }

  console.log(`\nDone. ${installed} file(s) written.\n`);
}

function cmdList() {
  const skills = listSkills();
  if (!skills.length) {
    console.log("No skills found.");
    return;
  }
  console.log("\nAvailable skills:\n");
  for (const s of skills) {
    console.log(`  ${s.name.padEnd(20)} [${s.agents.join(", ")}]`);
  }
  console.log();
}

switch (command) {
  case "add":
    await cmdAdd(args);
    break;
  case "list":
    cmdList();
    break;
  default:
    usage();
    if (command) process.exit(1);
}
