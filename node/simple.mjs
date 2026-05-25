#!/usr/bin/env -S node
import { cliteRun } from "./dist/mod.mjs";

class Tool {
  _json_config = true;
  retry = 2;
  main() {
    console.log("main command", this);
  }
}

cliteRun(Tool);
