#!/usr/bin/env node
import { cliteRun } from "clite-parser";

export let opt = "foo";
// To allow the modification of opt from the CLI
export const _set_opt = (v) => (opt = v);

function private_function() {
  console.log("private_function");
}

export function up() {
  private_function();
  console.log("up command", opt);
}

export function down(force = false, timeout = 5) {
  console.log("down command", { force, timeout, opt });
}
down._help = "down custom help";

export const main = () => console.log("main", opt);

cliteRun(import.meta);

// $ ./example-module.mjs --opt bar down true 100
// down command { force: true, timeout: 100, opt: "bar" }
//
// ./example-module.mjs --help
// Usage: <Object file> [Options] [--] [command [command args]]
//
// Commands:
//   down <force> <timeout> down custom help
//   main                   [default]
//   up
//
// Options:
//  -h, --help Show this help [default: false]
//      --opt                 [default: "foo"]
