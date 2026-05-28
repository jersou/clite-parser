#!/usr/bin/env -S deno run -A
import { cliFrom, usage } from "../mod.ts";

@usage("new usage of Tool")
class Tool {
  main() {
    console.log("main command", this);
  }
}

cliFrom(Tool);
