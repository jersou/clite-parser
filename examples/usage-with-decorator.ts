#!/usr/bin/env -S deno run -A
import { cliteRun, usage } from "../mod.ts";

@usage("new usage of Tool")
class Tool {
  main() {
    console.log("main command", this);
  }
}

cliteRun(Tool);
