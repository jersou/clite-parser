#!/usr/bin/env -S deno run -A
import { cliteRun } from "jsr:@jersou/clite@0.3.3";

export class Tool {
  retry = 2;
  _desc = "This tool is a full example of CliteParser usage";
  no_color?: string | boolean;
  _no_color_desc = "skip colorize";

  main(...services: string[]) {
    console.log("main command", this, { services });
  }
}

if (import.meta.main) { // if the file is imported, do not execute this block
  cliteRun(new Tool(), { noCommand: true });
}
