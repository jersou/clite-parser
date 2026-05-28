#!/usr/bin/env -S deno run -A
import { cliFrom } from "../mod.ts";

export function up() {
  private_function();
  console.log("up command");
}

function private_function() {
  console.log("private_function");
}

export function down(force = false, timeout = 5) {
  console.log("down command", { force, timeout });
}

export const main = () => console.log("main");

cliFrom(import.meta);

// $ ./examples/example-module-lite.ts --opt bar down true 100
// down command { force: true, timeout: 100 }
//
// ./examples/example-module-lite.ts --help
// Usage: <Object file> [Options] [--] [command [command args]]
//
// Commands:
//   down <force> <timeout>
//   main                   [default]
//   up
//
// Option:
//   -h, --help Show this help [default: false]
