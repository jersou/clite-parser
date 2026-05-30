#!/usr/bin/env -S deno run -A
import yargs from "https://deno.land/x/yargs@v17.7.2-deno/deno.ts";

type Options = {
  retry: number;
  dryRun: boolean;
  webUrl: string;
};

function main(argv: Options) {
  console.log({
    command: "main",
    options: { retry: argv.retry, dryRun: argv.dryRun, webUrl: argv.webUrl },
  });
}

function up(argv: Options) {
  console.log({
    command: "up",
    options: { retry: argv.retry, dryRun: argv.dryRun, webUrl: argv.webUrl },
  });
}

function down(argv: Options & { force: string; timeout: number }) {
  console.log({
    command: "down",
    options: { retry: argv.retry, dryRun: argv.dryRun, webUrl: argv.webUrl },
    cmdArgs: { force: argv.force, timeout: argv.timeout },
  });
}

yargs(Deno.args)
  .command(["main", "$0"], "", (_yargs: any) => {}, main)
  .command("up", "", (_yargs: any) => {}, up)
  .command("down <force> <timeout>", "", (_yargs: any) => {}, down)
  .option("retry", { default: 2 })
  .option("dry-run", { default: false })
  .option("web-url", { default: "none" })
  .help()
  .version(false)
  .demandCommand(1)
  .strict()
  .parse();

/*
$ ./yargs.ts --help
deno run

Commands:
  deno run main                                                        [default]
  deno run up
  deno run down <force> <timeout>

Options:
  --retry                                                           [default: 2]
  --dry-run                                                     [default: false]
  --web-url                                                    [default: "none"]
  --help     Show help                                                 [boolean]

$ ./yargs.ts
{
  command: "main",
  options: { retry: 2, dryRun: false, webUrl: "none" }
}

$ ./yargs.ts --retry 8 --dry-run --web-url=http
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

$ ./yargs.ts --retry 8 --dry-run --web-url=http down true 40
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
