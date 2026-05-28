#!/usr/bin/env -S deno run
import { cliFrom } from "../mod.ts";

const main = () => console.log("main");

function down(force: boolean, timeout: number) {
  console.log("down", { force, timeout });
}

const up = () => console.log("up");
up._help = "up custom help";

cliFrom({ main, up, down });

// $ ./examples/example-no-class.ts down true 15
// down command { force: true, timeout: 15 }
//
// $ ./examples/example-no-class.ts --help
// Usage: <Object file> [Options] [--] [command [command args]]
//
// Commands:
//   up
//   down <force> <timeout>
//   main                   [default]
//
// Option:
//  -h, --help Show this help [default: false]
