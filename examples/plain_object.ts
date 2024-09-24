#!/usr/bin/env -S deno run -A
import { cliteRun } from "../clite_parser.ts";

function ext(param1: string) {
  console.log("ext", param1, this);
}

cliteRun({
  _desc: "plain object example",
  retry: 2,
  _no_color_desc: "skip colorize",
  no_color: undefined,
  main() {
    console.log("main command", this);
  },
  down() {
    console.log("down command", this);
  },
  _up_desc: "create and start the services",
  up(svc: string, timeout = 10) {
    console.log("up command", svc, timeout, this);
  },
  _hiddenMethod() {
    console.log("private method", this);
  },
  alone: () => console.log("Warning no this here !", this),
  ext,
});
