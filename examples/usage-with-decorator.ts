#!/usr/bin/env -S deno run -A
import { cliteRun, usage } from "../clite_parser.ts";
import { alias, help, type } from "../src/decorators.ts";
@usage("new usage of Tool")
class Tool {
  main() {
    console.log("main command", this);
  }
}

cliteRun(Tool);
