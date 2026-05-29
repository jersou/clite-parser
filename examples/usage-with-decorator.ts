#!/usr/bin/env -S deno run -A
import { clinfer, usage } from "../mod.ts";

@usage("new usage of Tool")
class Tool {
  main() {
    console.log("main command", this);
  }
}

clinfer(Tool);
