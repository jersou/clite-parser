#!/usr/bin/env -S deno run -A
import { cliteRun } from "./dist/mod.mjs";

class Tool {
  _json_config = true;
  retry = 2;
  main() {
    console.log("main command", this);
  }
}

cliteRun(Tool);
