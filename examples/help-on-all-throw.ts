#!/usr/bin/env -S deno run -A
import { cliteRun } from "../clite_parser.ts";
export class Tool {
  throw = "true";
  main() {
    if (this.throw === "true") {
      throw new Error("add --throw=false option !");
    }
    console.log("OK !");
  }
}
cliteRun(Tool, { printHelpOnError: true });

/*
    $ ./example-throw-all.ts --help
    Usage: <Tool file> [Options] [--] [command [command args]]

    Command:
      main [default]

    Options:
     -h, --help  Show this help [default: false]
         --throw               [default: "true"]

    $ ./example-throw-all.ts
    An error occurred ! The help :
    Usage: <Tool file> [Options] [--] [command [command args]]

    Command:
      main [default]

    Options:
     -h, --help  Show this help [default: false]
         --throw               [default: "true"]

    The error :
    error: Uncaught (in promise) Error: add --throw=false option !
          throw new Error("add --throw=false option !");
                ^
        at Tool.main (file:///tmp/CliteParser/examples/example-throw-all.ts:7:13)
*/
