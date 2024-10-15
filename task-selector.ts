#!/usr/bin/env -S deno -A

import $ from "jsr:@david/dax@0.42.0";
import { stripAnsiCode } from "jsr:@std/fmt@1.0.2/colors";
const lines = await $`deno task`.lines();
const tasks = lines
  .filter((l) => l.startsWith("- "))
  .map((l) => l.substring(1).trim())
  .map(stripAnsiCode);
const taskIndex = await $.select({
  message: "Select the task to run :",
  options: tasks,
});
const task = tasks[taskIndex];
console.log(`Run task "${task}"`);
await $`deno task ${task}`.printCommand(true);
