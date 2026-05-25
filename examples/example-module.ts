#!/usr/bin/env -S deno run -A
import { cliteRun } from "../mod.ts";

export let opt = "foo";
// To allow the modification of opt from the CLI
// export const _set_opt = (v: string) => (opt = v);

export function up() {
  private_function();
  console.log("up command", opt);
}

function private_function() {
  console.log("private_function");
}

down._help = "down custom help";
export function down(force = false, timeout = 5) {
  console.log("down command", { force, timeout, opt });
}

export const main = () => {
  console.log("main", { opt });
};

cliteRun(import.meta);

// $ ./examples/example-module.ts --opt bar down true 100
// down command { force: true, timeout: 100, opt: "bar" }
//
// ./examples/example-module.ts --help
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
