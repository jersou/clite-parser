#!/usr/bin/env -S deno run -A
import { cliteRun } from "jsr:@jersou/clite@0.5.0";

class Tool {
  retry = 2;
  webUrl = "none"; // fields are converted to kebab case as global options
  no_color?: string | boolean; // → --no-color

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

cliteRun(new Tool());
