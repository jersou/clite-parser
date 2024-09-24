#!/usr/bin/env -S deno run -A
import { cliteRun } from "jsr:@jersou/clite@0.5.0";

class Tool {
  _help = "This tool is a little example of CliteParser"; // optional description
  retry = 2;
  webUrl = "none"; // fields are converted to kebab case as global options
  no_color?: string | boolean; // → --no-color
  _no_color_help = "skip colorize"; // optional description for "no_color" field
  _up_help = "create and start"; // optional description for "up" command

  main() {
    console.log("main command", this);
  }

  up() {
    console.log("up command", this);
  }

  down(force: boolean, timeout: number) {
    console.log("down command", { force, timeout }, this);
  }
}

if (import.meta.main) { // if the file is imported, do not execute this block
  cliteRun(new Tool());
}
