#!/usr/bin/env -S deno run -A
import { cliteRun } from "../clite_parser.ts";
import { alias, help, type } from "../src/decorators.ts";

class Tool {
  @alias("a")
  all?: boolean;
  @alias("r")
  retry = 2;
  @alias("w")
  webUrl = "none";

  @alias("nb")
  @alias("n")
  @help("n & b")
  @type("boolean")
  no_color?: string | boolean;

  main() {
    console.log("main command", this);
  }
}

cliteRun(new Tool());

/*
$ ./alias-with-decorator.ts -h
Usage: <Tool file> [Options] [--] [command [command args]]

Command:
  main [default]

Options:
       -h, --help     Show this help [default: false]
       -a, --all
       -r, --retry                       [default: 2]
       -w, --web-url                [default: "none"]
 -n, --nb, --no-color n & b                 [boolean]

$ ./alias-with-decorator.ts -an -r 8
main command Tool { all: true, retry: 8, webUrl: "none", no_color: true }
*/
