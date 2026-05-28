#!/usr/bin/env -S node
import { cliFrom } from "./dist/mod.mjs";

class Tool {
  _json_config = true;
  retry = 2;
  main() {
    console.log("main command", this);
  }
}

cliFrom(Tool);
