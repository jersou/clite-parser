#!/usr/bin/env -S deno run -A --allow-hrtime
import { cliteRun } from "../clite_parser.ts";

class Tool {
  _help = "This tool is a full example of CliteParser usage";
  retry = 2;
  webUrl = "none";
  _webUrl_help = "web URL ...";
  no_color?: string | boolean;
  _no_color_help = "skip colorize";
  _clean_help = "clean all data";
  _main_help = "do up/down/clean";
  _up_help = "create and start the services";
  _down_help = "stop and delete the services";
  _priv_field = 123;

  main() {
  }

  async up() {
  }

  clean() {
  }

  down(force: boolean, timeout: number) {
  }

  doNothing() {
  }

  _priv() {
  }
}

if (import.meta.main) { // if the file is imported, do not execute this block
  const tool = new Tool();

  const t0 = performance.now();
  cliteRun(tool, { args: ["doNothing"] });
  const t1 = performance.now();
  console.log(`cliteRun() : ${(t1 - t0).toFixed(3)} milliseconds.`);
  // → cliteRun() : 0.185 milliseconds.

  const t2 = performance.now();
  cliteRun(tool, { args: ["doNothing"] });
  const t3 = performance.now();
  console.log(`cliteRun() : ${(t3 - t2).toFixed(3)} milliseconds.`);
  // → cliteRun() : 0.007 milliseconds.
} else {
  const tool = new Tool();
  Deno.bench("./tool.ts doNothing", () => {
    cliteRun(tool, { args: ["doNothing"] });
  });
  Deno.bench("tool.doNothing()", () => {
    tool.doNothing();
  });
}
