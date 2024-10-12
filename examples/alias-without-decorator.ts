#!/usr/bin/env -S deno run -A
import { cliteRun } from "../clite_parser.ts";

class Tool {
  _all_alias = "a";
  all?: boolean;
  _retry_alias = "r";
  retry = 2;
  _webUrl_alias = "w";
  webUrl = "none";

  _no_color_alias = ["nb", "n"];
  _no_color_help = "n & b";
  _no_color_type = "boolean";
  no_color?: string | boolean;

  main() {
    console.log("main command", this);
  }
}

cliteRun(Tool);

/*
$ ./alias-without-decorator.ts --help
Usage: <Tool file> [Options] [--] [command [command args]]

Command:
  main [default]

Options:
       -h, --help     Show this help [default: false]
       -a, --all
       -r, --retry                       [default: 2]
       -w, --web-url                [default: "none"]
 --nb, -n, --no-color n & b                 [boolean]

$ ./alias-without-decorator.ts -an -r 8
main command Tool {
  _all_alias: "a",
  all: true,
  _retry_alias: "r",
  retry: 8,
  _webUrl_alias: "w",
  webUrl: "none",
  _no_color_alias: [ "nb", "n" ],
  _no_color_help: "n & b",
  _no_color_type: "boolean",
  no_color: true
}
*/
