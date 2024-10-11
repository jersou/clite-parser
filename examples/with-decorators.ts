#!/usr/bin/env -S deno -A
import { alias, cliteRun, help } from "jsr:@jersou/clite@0.5.0";

@help("This tool is a little example of CliteParser") // optional description
class Tool {
  @alias("r") // optional alias -r for --retry
  retry = 2;
  @help("no changes mode") // optional description for "--dry-run" field
  dryRun = false; // fields are converted to kebab case as global options
  webUrl = "none"; // → --web-url

  main() {
    console.log("main command", this);
  }

  @help("create and start") // optional description for "up" command
  up() {
    console.log("up command", this);
  }

  down(force: boolean, timeout: number) {
    console.log("down command", { force, timeout }, this);
  }
}

if (import.meta.main) { // if the file is imported, do not execute this block
  cliteRun(new Tool());
}

/*
    $ ./example-without-decorator.js --help
    This tool is a little example of CliteParser

    Usage: <Tool file> [Options] [--] [command [command args]]

    Commands:
      main                   [default]
      up                     create and start
      down <force> <timeout>

    Options:
     -h, --help    Show this help  [default: false]
     -r, --retry                       [default: 2]
         --dry-run no changes mode [default: false]
         --web-url                [default: "none"]
 */
