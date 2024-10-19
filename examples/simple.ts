#!/usr/bin/env -S deno run -A
import { cliteRun } from "../mod.ts";
// or after "deno add @jersou/clite" : import { cliteRun } from "@jersou/clite";
// or for Node usage, after "npx jsr add @jersou/clite" (same import from "@jersou/clite")
// or for Node usage : import { cliteRun } from "clite-parser"; // after "npm clite-parser"

class Tool {
  retry = 2; // 2 is the default value, overwrite by "--retry 8" by example
  dryRun = false; // fields are converted to kebab case as global options
  webUrl = "none"; // → --web-url

  main() { // call if : $ ./example-lite-lite.ts // or if $ ./example-lite-lite.ts main
    console.log("main command", this);
  }

  up() { // call if : $ ./example-lite-lite.ts up
    console.log("up command", this);
  }

  down(force: boolean, timeout: number) { // call if : $ ./example-lite-lite.ts down true 14
    console.log("down command", { force, timeout }, this);
  }
}

cliteRun(Tool);

/*
    $ ./example-lite-lite.ts --help
    Usage: <Tool file> [Options] [--] [command [command args]]

    Commands:
      main                   [default]
      up
      down <force> <timeout>

    Options:
     -h, --help    Show this help [default: false]
         --retry                      [default: 2]
         --dry-run                [default: false]
         --web-url               [default: "none"]

    $ ./example-lite-lite.ts
    main command Tool { retry: 2, dryRun: false, webUrl: "none" }

    $ ./example-lite-lite.ts --dry-run --retry 8  down true 14
    down command { force: "true", timeout: 14 } Tool { retry: 8, dryRun: false, webUrl: "none" }

    $ ./example-lite-lite.ts --retry 8 --dry-run -- down true 14
    down command { force: "true", timeout: "14" } Tool { retry: 8, dryRun: false, webUrl: "none" }

    $ ./example-lite-lite.ts --retry 8 --dry-run true down true 14
    down command { force: "true", timeout: 14 } Tool { retry: 8, dryRun: false, webUrl: "none" }
*/
