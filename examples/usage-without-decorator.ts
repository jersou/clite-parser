#!/usr/bin/env -S deno run -A
import { clinfer } from "../mod.ts";

class Tool {
  _usage = "new usage of Tool";
  main() {
    console.log("main command", this);
  }
}

clinfer(Tool);
