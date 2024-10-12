#!/usr/bin/env -S deno run -A
import { cliteRun } from "jsr:@jersou/clite@0.6.0";

export class Tool {
  retry = 2;
  _help = "This tool is a full example of CliteParser usage";
  no_color?: string | boolean;
  _no_color_help = "skip colorize";

  main(...services: string[]) {
    console.log("main command", this, { services });
  }
}

if (import.meta.main) { // if the file is imported, do not execute this block
  cliteRun(Tool, { noCommand: true });
}
