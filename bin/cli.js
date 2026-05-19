#!/usr/bin/env node
import { installSkill } from "../src/install.js";
import { listSkills } from "../src/list.js";
import { AGENTS } from "../src/agents.js";

const [, , command, ...args] = process.argv;

const validAgents = Object.keys(AGENTS).join(", ");

function usage() {
  console.log(`
  afarzanehskills <command>

  Commands:
    add <skill> <agent>   Install a skill for a specific agent
    list                  List available skills

  Agents: ${validAgents}

  Examples:
    npx afarzanehskills@latest add amirethyst claude
    npx afarzanehskills@latest add amirethyst copilot
    npx afarzanehskills@latest list
  `);
}

async function cmdAdd([skillName, agentKey]) {
  if (!skillName || !agentKey) {
    console.error(`Usage: afarzanehskills add <skill> <agent>\nAgents: ${validAgents}`);
    process.exit(1);
  }

  if (!AGENTS[agentKey]) {
    console.error(`Unknown agent "${agentKey}". Valid: ${validAgents}`);
    process.exit(1);
  }

  console.log(`\nInstalling "${skillName}" for ${AGENTS[agentKey].label}...\n`);

  let result;
  try {
    result = await installSkill(skillName, agentKey);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }

  if (result.status === "missing") {
    console.error(`Skill "${skillName}" not found. Run "list" to see available skills.`);
    process.exit(1);
  }

  console.log(`  [ok]  ${result.label}: ${result.path}\n`);
}

function cmdList() {
  const skills = listSkills();
  if (!skills.length) {
    console.log("No skills found.");
    return;
  }
  console.log(`\nAvailable skills:\n`);
  for (const name of skills) {
    console.log(`  ${name}`);
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
