#!/usr/bin/env -S deno run -A
import { cliteRun, help } from "../mod.ts";

class Tool {
  _help = "This tool is a full example of CliteParser usage";

  retry = 2;

  _webUrl_help = "web URL ...";
  webUrl = "none";

  _no_color_help = "skip colorize";
  no_color?: string | boolean;

  _priv_field = 123;

  _main_help = "do up/down/clean";
  main() {
  }

  _up_help = "create and start the services";
  async up() {
  }

  _clean_help = "clean all data";
  clean() {
  }

  _down_help = "stop and delete the services";
  down(force: boolean, timeout: number) {
  }

  doNothing() {
  }

  _priv_method() {
  }
}

@help("This tool is a full example of CliteParser usage")
class ToolDecor {
  retry = 2;

  @help("web URL ...")
  webUrl = "none";

  @help("skip colorize")
  no_color?: string | boolean;

  _priv_field = 123;

  @help("do up/down/clean")
  main() {
  }

  @help("create and start the services")
  async up() {
  }

  @help("clean all data")
  clean() {
  }

  @help("stop and delete the services")
  down(force: boolean, timeout: number) {
  }

  doNothing() {
  }

  _priv_method() {
  }
}

if (import.meta.main) { // if the file is imported, do not execute this block
  const tool = new Tool();
  for (let i = 0; i < 20; i++) {
    const t0 = performance.now();
    cliteRun(tool, { args: ["doNothing"] });
    const t1 = performance.now();
    console.log(`cliteRun() : ${(t1 - t0).toFixed(3)} ms.`);
    // → cliteRun() : 3 ms / 0.30 ms / 0.15 ms / 0.11 ms
  }
} else { // deno bench ./becnh.ts : 40 µs
  const tool = new Tool();
  Deno.bench('cliteRun(Tool, { args: ["doNothing"] })', () => {
    cliteRun(Tool, { args: ["doNothing"] });
  });
  Deno.bench('cliteRun(tool, { args: ["doNothing"] })', () => {
    cliteRun(tool, { args: ["doNothing"] });
  });
  const toolDecor = new ToolDecor();
  Deno.bench('cliteRun(ToolDecor, { args: ["doNothing"] })', () => {
    cliteRun(ToolDecor, { args: ["doNothing"] });
  });
  Deno.bench('cliteRun(toolDecor, { args: ["doNothing"] })', () => {
    cliteRun(toolDecor, { args: ["doNothing"] });
  });
  Deno.bench("toolDecor.doNothing()", () => {
    toolDecor.doNothing();
  });
  Deno.bench("new ToolDecor().doNothing()", () => {
    new ToolDecor().doNothing();
  });
  // benchmark                                      time/iter (avg)        iter/s      (min … max)           p75      p99     p995
  // ---------------------------------------------- ----------------------------- --------------------- --------------------------
  // cliteRun(Tool, { args: ["doNothing"] })                40.2 µs        24,860 ( 34.1 µs … 917.1 µs)  40.1 µs  92.4 µs 135.3 µs
  // cliteRun(tool, { args: ["doNothing"] })                37.0 µs        27,020 ( 34.3 µs … 837.5 µs)  36.4 µs  50.3 µs  76.2 µs
  // cliteRun(ToolDecor, { args: ["doNothing"] })           35.6 µs        28,050 ( 32.0 µs … 325.4 µs)  36.3 µs  49.6 µs  69.7 µs
  // cliteRun(toolDecor, { args: ["doNothing"] })           33.9 µs        29,460 ( 32.0 µs … 218.2 µs)  33.4 µs  45.1 µs  55.5 µs
  // toolDecor.doNothing()                                   5.4 ns   183,500,000 (  5.4 ns …  17.0 ns)   5.4 ns   5.8 ns   6.5 ns
  // new ToolDecor().doNothing()                             7.1 ns   141,400,000 (  7.0 ns …  19.5 ns)   7.0 ns   7.5 ns   7.6 ns
}
