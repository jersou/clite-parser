#!/usr/bin/env -S deno run -A
import { clinfer } from "../../../mod.ts";

export let retry = 2;
export let dryRun = false;
export let webUrl = "none";

export function main() {
  console.log({
    command: "main",
    options: { retry, dryRun, webUrl },
  });
}

export function up() {
  console.log({
    command: "up",
    options: { retry, dryRun, webUrl },
  });
}

export function down(force: boolean, timeout: number) {
  console.log({
    command: "down",
    options: { retry, dryRun, webUrl },
    cmdArgs: { force, timeout },
  });
}

// clinfer setters for options, added automatically at first run
export const _set_dryRun = (v: typeof dryRun) => (dryRun = v);
export const _set_retry = (v: typeof retry) => (retry = v);
export const _set_webUrl = (v: typeof webUrl) => (webUrl = v);

clinfer(import.meta);

/*
$ ./clinfer.ts --help
Usage: ./clinfer.ts [Options] [--] [command [command args]]

Commands:
  down <force> <timeout>
  main                   [default]
  up

Options:
 -h, --help    Show this help [default: false]
     --dry-run                [default: false]
     --retry                      [default: 2]
     --web-url               [default: "none"]

$ ./clinfer.ts
{
  command: "main",
  options: { retry: 2, dryRun: false, webUrl: "none" }
}

$ ./clinfer.ts --retry 8 --dry-run --web-url=http
{
  command: "main",
  options: { retry: 8, dryRun: true, webUrl: "http" }
}

$ ./clinfer.ts down true 40
{
  command: "down",
  options: { retry: 2, dryRun: false, webUrl: "none" },
  cmdArgs: { force: true, timeout: 40 }
}

$ ./clinfer.ts --retry 8 --dry-run --web-url=http down true 40
{
  command: "down",
  options: { retry: 8, dryRun: true, webUrl: "http" },
  cmdArgs: { force: true, timeout: 40 }
}


$ ./clinfer.ts --unk
An error occurred ! The help :
...
The error :
error: Uncaught (in promise) Error: The option "unk" doesn't exist


$ ./clinfer.ts unk
An error occurred ! The help :
...
The error :
error: Uncaught (in promise) Error: The command "unk" doesn't exist
...

 */
