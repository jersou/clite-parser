#!/usr/bin/env -S deno run -A
import { cliteRun } from "jsr:@jersou/clite@0.6.0";
// or after "deno add @jersou/clite" : import { cliteRun } from "@jersou/clite";
// or for Node usage, after "npx jsr add @jersou/clite" (same import from "@jersou/clite")

class Tool {
  retry = 2;
  dryRun = false; // fields are converted to kebab case as global options
  webUrl = "none"; // → --web-url

  main() {
    console.log("main command", this);
  }

  up() {
    console.log("up command", this);
  }

  down(force: boolean, timeout: number) {
    console.log("down command", { force, timeout }, this);
  }
}

cliteRun(new Tool());

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
