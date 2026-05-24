#!/usr/bin/env -S deno run -A
import { cliteRun } from "../mod.ts";

class Tool {
  main() {
    console.log("main command", this);
  }

  up() {
    console.log("up command", this);
  }
}
(Tool.prototype.up as any)._help = "up custom help";

cliteRun(Tool);

// $ ./examples/help-proto.ts --help
// Usage: <Tool file> [Options] [--] [command [command args]]
//
// Commands:
//   main [default]
//   up   up custom help
//
// Option:
//  -h, --help Show this help [default: false]
