#!/usr/bin/env -S deno run -A
import { cliteRun } from "jsr:@jersou/clite@0.5.0";
export class Tool {
  noThrow = false;

  main() {
    if (!this.noThrow) {
      throw new Error("add --no-throw option !", { cause: { clite: true } });
    }
    console.log("OK !");
  }
}
cliteRun(new Tool());
