#!/usr/bin/env -S deno run -A
import yargs from "https://deno.land/x/yargs@v17.7.2-deno/deno.ts";

let ret;

type Options = {
  retry: number;
  dryRun: boolean;
  webUrl: string;
};

const main = (argv: Options) => {
  ret = {
    command: "main",
    options: { retry: argv.retry, dryRun: argv.dryRun, webUrl: argv.webUrl },
  };
};

const up = function (argv: Options) {
  ret = {
    command: "up",
    options: { retry: argv.retry, dryRun: argv.dryRun, webUrl: argv.webUrl },
  };
};

const down = function (argv: Options & { force: string; timeout: number }) {
  ret = {
    command: "down",
    options: { retry: argv.retry, dryRun: argv.dryRun, webUrl: argv.webUrl },
    cmdArgs: { force: argv.force, timeout: argv.timeout },
  };
};

yargs(Deno.args)
  .scriptName("<Tool file>")
  .usage("Usage: $0 [Options] [--] [command [command args]]")
  .command(["main", "$0"], "", (_yargs: any) => {}, main)
  .command("up", "create and start", (_yargs: any) => {}, up)
  .command("down <force> <timeout>", "", (_yargs: any) => {}, down)
  .option("retry", { alias: "r", default: 2 })
  .option("dry-run", {
    alias: "n",
    default: false,
    describe: "no changes mode",
  })
  .option("web-url", { default: "none", describe: "web url" })
  .help()
  .version(false)
  .demandCommand(1)
  .strict()
  .parse();

console.log(ret);

/*
$ ./yargs.ts --help
Usage: <Tool file> [Options] [--] [command [command args]]

Commands:
  <Tool file> main                                                     [default]
  <Tool file> up                      create and start
  <Tool file> down <force> <timeout>

Options:
  -r, --retry                                                       [default: 2]
  -n, --dry-run  no changes mode                                [default: false]
      --web-url  web url                                       [default: "none"]
      --help     Show help                                             [boolean]

$ ./yargs.ts
{
  command: "main",
  options: { retry: 2, dryRun: false, webUrl: "none" }
}

$ ./yargs.ts -r8 --dry-run --web-url=http
{
  command: "main",
  options: { retry: 8, dryRun: false, webUrl: "http" }
}

$ ./yargs.ts down true 40
{
  command: "down",
  options: { retry: 2, dryRun: false, webUrl: "none" },
  cmdArgs: { force: "true", timeout: 40 }
}

$ ./yargs.ts -r8 --dry-run --web-url=http down true 40
{
  command: "down",
  options: { retry: 8, dryRun: false, webUrl: "http" },
  cmdArgs: { force: "true", timeout: 40 }
}

$ ./yargs.ts --unk
<HELP>
...
...
Unknown argument: unk

$ ./yargs.ts unk
<HELP>
...
...
Unknown argument: unk

*/
