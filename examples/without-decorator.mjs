#!/usr/bin/env -S deno -A
import { cliteRun } from "jsr:@jersou/clite@0.6.0";

class Tool {
  _help = "This tool is a little example of CliteParser"; // optional description

  _retry_alias = "r"; // optional alias -r for --retry
  retry = 2;
  _dryRun_help = "no changes mode"; // optional description for "--dry-run" field
  dryRun = false; // fields are converted to kebab case as global options
  webUrl = "none"; // → --web-url

  main() {
    console.log("main command", this);
  }

  _up_help = "create and start"; // optional description for "up" command
  up() {
    console.log("up command", this);
  }

  down(force, timeout) {
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

    $ ./without-decorator.mjs --retry 12 --dry-run
    main command Tool {
      _help: "This tool is a little example of CliteParser",
      _retry_alias: "r",
      retry: 12,
      _dryRun_help: "no changes mode",
      dryRun: false,
      webUrl: "none",
      _up_help: "create and start"
    }
 */
