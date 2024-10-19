#!/usr/bin/env -S deno run -A
import { cliteRun } from "../mod.ts";

class Tool {
  _usage = "new usage of Tool";
  main() {
    console.log("main command", this);
  }
}

cliteRun(Tool);
