#!/usr/bin/env -S deno run -A
import { cliFrom } from "../mod.ts";
import * as tool from "./example-module.ts";

cliFrom(tool);

// $ ./examples/example-module-import.ts --help
// Usage: <Object file> [Options] [--] [command [command args]]
//
// Commands:
//   down <force> <timeout> down custom help
//   main                   [default]
//   up
//
// Options:
//  -h, --help Show this help [default: false]
//      --opt                 [default: "foo"]
