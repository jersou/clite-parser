#!/usr/bin/env -S deno run -A
import { cliteRun } from "../mod.ts";
export class Tool {
  noThrow = false;

  main() {
    if (!this.noThrow) {
      throw new Error("add --no-throw option !", { cause: { clite: true } });
    }
    console.log("OK !");
  }
}
cliteRun(Tool);

/*
    $ ./example-throw.ts --help
    Usage: <Tool file> [Options] [--] [command [command args]]

    Command:
      main [default]

    Options:
     -h, --help  Show this help     [default: false]
          --no-throw                [default: false]

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
