#!/usr/bin/env -S deno run -A
import { parseArgs } from "jsr:@std/cli@^1.0.6/parse-args";
import { toKebabCase } from "https://jsr.io/@std/text/1.0.7/to_kebab_case.ts";

let ret;

const defaultOptions = {
  retry: 2,
  dryRun: false,
  webUrl: "none",
  help: false,
} as const;
type Options = {
  [key in keyof typeof defaultOptions]: typeof defaultOptions[key];
};
const alias: Record<string, string[]> = {};
Object.keys(defaultOptions).forEach((k) => alias[k] = [toKebabCase(k)]);
alias.retry.push("r");
alias.dryRun.push("n");
const res = parseArgs(Deno.args, {
  default: defaultOptions,
  alias,
}) as Options & { _: string[] };

const aliasNames = Object.values(alias).flat();
for (const key of Object.keys(res)) {
  if (
    key !== "_" && !aliasNames.includes(key) &&
    !Object.keys(defaultOptions).includes(key)
  ) {
    throw new Error(`No option ${key}`);
  }
}

const main = () => {
  ret = {
    command: "main",
    options: { retry: res.retry, dryRun: res.dryRun, webUrl: res.webUrl },
  };
};

const up = function () {
  ret = {
    command: "up",
    options: { retry: res.retry, dryRun: res.dryRun, webUrl: res.webUrl },
  };
};

const down = function () {
  ret = {
    command: "down",
    options: { retry: res.retry, dryRun: res.dryRun, webUrl: res.webUrl },
    cmdArgs: { force: res._[1], timeout: res._[2] },
  };
};

if (res.help) {
  console.log(`This tool is a little example

Usage: <Tool file> [Options] [--] [command [command args]]

Commands:
  main                   [default]
  up                     create and start
  down <force> <timeout>

Options:
 -h, --help    Show this help  [default: false]
 -r, --retry                       [default: 2]
 -n, --dry-run no changes mode [default: false]
     --web-url web url        [default: "none"]`);
} else {
  switch (res._[0]) {
    case undefined:
    case "main":
      main();
      break;
    case "up":
      up();
      break;
    case "down":
      down();
      break;
    default:
      throw new Error(`Command not found: ${res._[0]}`);
  }
  console.log(ret);
}

/*
$ ./std-cli.ts --help
This tool is a little example

Usage: <Tool file> [Options] [--] [command [command args]]

Commands:
  main                   [default]
  up                     create and start
  down <force> <timeout>

Options:
 -h, --help    Show this help  [default: false]
 -r, --retry                       [default: 2]
 -n, --dry-run no changes mode [default: false]
     --web-url web url        [default: "none"]

$ ./std-cli.ts
{
  command: "main",
  options: { retry: 2, dryRun: false, webUrl: "none" }
}

$ ./std-cli.ts  -r8 --dry-run --web-url=http
{
  command: "main",
  options: { retry: 8, dryRun: true, webUrl: "http" }
}

$ ./std-cli.ts down true 40
{
  command: "down",
  options: { retry: 2, dryRun: false, webUrl: "none" },
  cmdArgs: { force: "true", timeout: 40 }
}

$ ./std-cli.ts -r8 --dry-run --web-url=http down true 40
{
  command: "down",
  options: { retry: 8, dryRun: true, webUrl: "http" },
  cmdArgs: { force: "true", timeout: 40 }
}


$ ./clite.ts --unk
error: Uncaught (in promise) Error: No option unk
...

$ ./clite.ts unk
error: Uncaught (in promise) Error: Command not found: unk
...

*/
