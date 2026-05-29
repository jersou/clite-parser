#!/usr/bin/env -S node
import { clinfer } from "./dist/mod.mjs";

class Tool {
  _json_config = true;
  retry = 2;
  main() {
    console.log("main command", this);
  }
}

clinfer(Tool);
