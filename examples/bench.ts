#!/usr/bin/env -S deno run -A
import { cliFrom, help } from "../mod.ts";

class Tool {
  _help = "This tool is a full example of Clifrom usage";

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

@help("This tool is a full example of Clifrom usage")
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
// ESM BEGIN
export let retry = 2;
export let webUrl = "none";
export let no_color = "";
let _priv_field = 123;
export function main() {}
main._help = "do up/down/clean";
export async function up() {}
up._help = "create and start the services";
export function clean() {}
clean._help = "clean all data";
export function down(force: boolean, timeout: number) {}
down._help = "stop and delete the services";
export function doNothing() {}
function _priv_method() {}
export const _set_no_color = (v: typeof no_color) => (no_color = v);
export const _set_retry = (v: typeof retry) => (retry = v);
export const _set_webUrl = (v: typeof webUrl) => (webUrl = v);
// ESM END

if (import.meta.main) { // if the file is imported, do not execute this block
  const tool = new Tool();
  for (let i = 0; i < 20; i++) {
    const t0 = performance.now();
    cliFrom(tool, { args: ["doNothing"] });
    const t1 = performance.now();
    console.log(`cliFrom() : ${(t1 - t0).toFixed(3)} ms.`);
    // → cliFrom() : 3 ms / 0.30 ms / 0.15 ms / 0.11 ms
  }
} else {
  // deno bench ./bench.ts : 40 µs
  const tool = new Tool();
  Deno.bench('cliFrom(import.meta, { args: ["doNothing"] })', async () => {
    await cliFrom(import.meta, { args: ["doNothing"] });
  });
  Deno.bench('cliFrom(Tool, { args: ["doNothing"] })', async () => {
    await cliFrom(Tool, { args: ["doNothing"] });
  });
  Deno.bench('cliFrom(tool, { args: ["doNothing"] })', async () => {
    await cliFrom(tool, { args: ["doNothing"] });
  });
  const toolDecor = new ToolDecor();
  Deno.bench('cliFrom(ToolDecor, { args: ["doNothing"] })', async () => {
    await cliFrom(ToolDecor, { args: ["doNothing"] });
  });
  Deno.bench('cliFrom(toolDecor, { args: ["doNothing"] })', async () => {
    await cliFrom(toolDecor, { args: ["doNothing"] });
  });
  Deno.bench("new ToolDecor().doNothing()", () => {
    new ToolDecor().doNothing();
  });
  Deno.bench("toolDecor.doNothing()", () => {
    toolDecor.doNothing();
  });
  // | benchmark                                        | time/iter (avg) | time/iter (avg sec) |        iter/s |      (min … max)      |      p75 |      p99 |     p995 |
  // | ------------------------------------------------ | --------------- | ------------------- | ------------- | --------------------- | -------- | -------- | -------- |
  // | cliFrom(import.meta, { args: ["doNothing"] })   |         31.5 µs |     0.0000315       |        31,770 | ( 27.1 µs … 346.7 µs) |  31.6 µs |  56.8 µs |  93.7 µs |
  // | cliFrom(Tool, { args: ["doNothing"] })          |         19.7 µs |     0.0000197       |        50,670 | ( 16.4 µs … 506.9 µs) |  19.5 µs |  36.2 µs |  79.1 µs |
  // | cliFrom(tool, { args: ["doNothing"] })          |         17.8 µs |     0.0000178       |        56,120 | ( 16.2 µs … 198.9 µs) |  17.5 µs |  25.8 µs |  34.6 µs |
  // | cliFrom(ToolDecor, { args: ["doNothing"] })     |         19.2 µs |     0.0000192       |        52,020 | ( 16.6 µs … 263.4 µs) |  18.7 µs |  35.1 µs |  48.9 µs |
  // | cliFrom(toolDecor, { args: ["doNothing"] })     |         18.5 µs |     0.0000185       |        54,110 | ( 16.7 µs … 263.8 µs) |  18.1 µs |  28.8 µs |  34.1 µs |
  // | new ToolDecor().doNothing()                      |          3.6 ns |     0.0000000036    |   278,400,000 | (  3.4 ns …  15.8 ns) |   3.6 ns |   4.5 ns |   4.6 ns |
  // | toolDecor.doNothing()                            |        294.0 ps |     0.000000000294  | 3,402,000,000 | (263.5 ps …  14.0 ns) | 294.7 ps | 409.7 ps | 499.1 ps |
}
