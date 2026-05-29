#!/usr/bin/env -S deno run -A
import { alias, clinfer, help } from "../../mod.ts";

let ret;

@help("This tool is a little example")
class Tool {
  @alias("r")
  retry = 2;

  @alias("n")
  @help("no changes mode")
  dryRun = false;

  @help("web url")
  webUrl = "none";

  main() {
    ret = {
      command: "main",
      options: { retry: this.retry, dryRun: this.dryRun, webUrl: this.webUrl },
    };
  }

  @help("create and start")
  up() {
    ret = {
      command: "up",
      options: { retry: this.retry, dryRun: this.dryRun, webUrl: this.webUrl },
    };
  }

  down(force: boolean, timeout: number) {
    ret = {
      command: "down",
      options: { retry: this.retry, dryRun: this.dryRun, webUrl: this.webUrl },
      cmdArgs: { force, timeout },
    };
  }
}

clinfer(Tool);
console.log(ret);

/*
$ ./clinfer.ts --help
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

$ ./clinfer.ts
{
  command: "main",
  options: { retry: 2, dryRun: false, webUrl: "none" }
}

$ ./clinfer.ts -r8 --dry-run --web-url=http
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

$ ./clinfer.ts -r8 --dry-run --web-url=http down true 40
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
