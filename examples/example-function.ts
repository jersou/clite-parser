#!/usr/bin/env -S deno run -A
import { cliteRun } from "../mod.ts";

function down(force = false, timeout = 5) {
  console.log("down command", { force, timeout });
}

cliteRun(down);

// $ ./examples/example-function.ts true 100
// down command { force: true, timeout: 100 }
//
// ./examples/example-function.ts --help
// Usage: <script path> [Options] [--] <force> <timeout>
//
// Option:
//   -h, --help Show this help [default: false]
