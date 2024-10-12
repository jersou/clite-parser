#!/usr/bin/env -S deno run -A
import { cliteRun } from "jsr:@jersou/clite@0.6.1";

function ext(param1: string) {
  console.log("ext", param1, this);
}

cliteRun({
  _help: "plain object example",
  retry: 2,
  _no_color_help: "skip colorize",
  no_color: undefined,
  main() {
    console.log("main command", this);
  },
  down() {
    console.log("down command", this);
  },
  _up_help: "create and start the services",
  up(svc: string, timeout = 10) {
    console.log("up command", svc, timeout, this);
  },
  _hiddenMethod() {
    console.log("private method", this);
  },
  alone: () => console.log("Warning no this here !", this),
  ext,
});
/*
    $ ./plain_object.ts --help
    plain object example

    Usage: <Object file> [Options] [--] [command [command args]]

    Commands:
      main               [default]
      down
      up <svc> <timeout> create and start the services
      alone
      ext <param1>

    Options:
     -h, --help     Show this help [default: false]
         --retry                       [default: 2]
         --no-color skip colorize

    $ ./plain_object.ts --retry 3 up foo 12
    up command foo 12 {
      _help: "plain object example",
      retry: 3,
      _no_color_help: "skip colorize",
      no_color: undefined,
      main: [Function: main],
      down: [Function: down],
      _up_help: "create and start the services",
      up: [Function: up],
      _hiddenMethod: [Function: _hiddenMethod],
      alone: [Function: alone],
      ext: [Function: ext]
    }
 */
