#!/usr/bin/env node
import { clinfer } from "clinfer";

export let opt = "foo"; // will be "--opt" option

export function up() {
  // will be "up" command
  private_function();
  console.log("up command", opt);
}

function private_function() {
  // ignored (not exported)
  console.log("private_function");
}

export function down(force = false, timeout = 5) {
  console.log("down command", { force, timeout, opt });
}

// will be "main" command (the default)
export const main = () => console.log("main", opt);

down._help = "down custom help"; // optional help
// To allow the modification of opt from the CLI
export const _set_opt = (v) => (opt = v);

clinfer(import.meta);

//  ./ESM-demo.mjs
// main foo
//
// $ ./ESM-demo.mjs --opt bar down true 100
// down command { force: true, timeout: 100, opt: "bar" }
//
// ./ESM-demo.mjs --help
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
