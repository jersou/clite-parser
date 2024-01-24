#!/usr/bin/env -S deno run -A
import { cliteRun } from "https://deno.land/x/clite_parser/clite_parser.ts";

class Tool {
  retry = 2;
  webUrl = "none";
  no_color?: boolean;

  main() {
    console.log("main", this);
  }

  up() {
    console.log("main", this);
  }

  down(force: boolean, timeout: number) {
    console.log("down command", { force, timeout }, this);
  }
}

cliteRun(new Tool());
