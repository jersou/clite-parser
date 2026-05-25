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
} else { // deno bench ./bench.ts : 40 µs
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
  // | benchmark                                      | time/iter (avg) |        iter/s |      (min … max)      |      p75 |      p99 |     p995 |
  // | ---------------------------------------------- | --------------- | ------------- | --------------------- | -------- | -------- | -------- |
  // | cliteRun(Tool, { args: ["doNothing"] })        |        547.6 ns |     1,826,000 | (119.3 ns …   3.2 µs) | 690.5 ns |   2.3 µs |   3.2 µs |
  // | cliteRun(tool, { args: ["doNothing"] })        |        591.0 ns |     1,692,000 | (116.7 ns …  12.2 µs) | 697.0 ns |  12.2 µs |  12.2 µs |
  // | cliteRun(ToolDecor, { args: ["doNothing"] })   |        665.8 ns |     1,502,000 | (111.5 ns …  15.4 µs) | 722.6 ns |  15.4 µs |  15.4 µs |
  // | cliteRun(toolDecor, { args: ["doNothing"] })   |        589.5 ns |     1,696,000 | (105.0 ns …  12.0 µs) | 760.3 ns |   3.2 µs |  12.0 µs |
  // | toolDecor.doNothing()                          |          3.5 ns |   288,500,000 | (  3.4 ns …   8.9 ns) |   3.4 ns |   4.0 ns |   4.0 ns |
  // | new ToolDecor().doNothing()                    |          4.6 ns |   216,500,000 | (  4.6 ns …   7.0 ns) |   4.6 ns |   5.1 ns |   5.3 ns |
}
