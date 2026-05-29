#!/usr/bin/env -S deno run -A
import { clinfer } from "../mod.ts";

export let opt = "foo"; // will be "--opt" option in the CLI

export function up() { // will be "up" command in the CLI
  private_function();
  console.log("up command", opt);
}

function private_function() { // ignored in CLI
  console.log("private_function");
}

export function down(force = false, timeout = 5) {
  console.log("down command", { force, timeout, opt });
}

export const main = () => { // will be "main" command (the default)
  console.log("main", { opt });
};

down._help = "down custom help"; // optional help description of down command
// To allow the modification of opt from the CLI (due to ESM security limitations)
export const _set_opt = (v: typeof opt) => (opt = v);

clinfer(import.meta);

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
