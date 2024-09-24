#!/usr/bin/env -S deno run -A
import { cliteRun } from "jsr:@jersou/clite@0.5.0";
export class Tool {
  throw = "true";
  main() {
    if (this.throw === "true") {
      throw new Error("add --throw=false option !");
    }
    console.log("OK !");
  }
}
cliteRun(new Tool(), { printHelpOnError: true });
