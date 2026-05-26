#!/usr/bin/env node
import select from "@inquirer/select";
import { AGENTS } from "../src/agents.js";
import { installSkill } from "../src/install.js";
import { listSkills } from "../src/list.js";

const [, , command, ...args] = process.argv;

const validAgents = Object.keys(AGENTS);

function usage() {
  console.log(`
  afarzanehskills <command>

  Commands:
    add [skill] [agent]   Install a skill (interactive if args are omitted)
    list                  List available skills

  Agents: ${validAgents.join(", ")}

  Examples:
    npx afarzanehskills@latest add
    npx afarzanehskills@latest add amirethyst claude
    npx afarzanehskills@latest list
  `);
}

async function promptSkill() {
  const skills = listSkills();
  if (!skills.length) {
    console.error("No skills available.");
    process.exit(1);
  }
  return select({
    message: "Select a skill",
    choices: skills.map((s) => ({ value: s, name: s })),
  });
}

async function promptAgent() {
  return select({
    message: "Select an agent",
    choices: validAgents.map((k) => ({ value: k, name: AGENTS[k].label })),
  });
}

async function cmdAdd([skillArg, agentArg]) {
  const skillName = skillArg || await promptSkill();
  const agentKey = agentArg || await promptAgent();

  if (!AGENTS[agentKey]) {
    console.error(`Unknown agent "${agentKey}". Valid: ${validAgents.join(", ")}`);
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

  for (const f of result.files) {
    console.log(`  [ok]  ${result.path}/${f}`);
  }
  console.log();
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
