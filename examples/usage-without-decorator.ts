#!/usr/bin/env -S deno run -A
import { cliFrom } from "../mod.ts";

class Tool {
  _usage = "new usage of Tool";
  main() {
    console.log("main command", this);
  }
}

cliFrom(Tool);
