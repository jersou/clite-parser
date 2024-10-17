#!/usr/bin/env -S deno run -A
import { cliteRun } from "../clite_parser.ts";

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

cliteRun(Tool, { configCli: true });

/*
    $ ./load-config.ts --help
    Usage: <Tool file> [Options] [--] [command [command args]]

    Commands:
      main                   [default]
      up
      down <force> <timeout>

    Options:
     -h, --help    Show this help                           [default: false]
         --config  Use this json file or string to read the options [string]
         --retry                                                [default: 2]
         --dry-run                                          [default: false]
         --web-url                                         [default: "none"]

    $ ./load-config.ts  down
    down command { force: undefined, timeout: undefined } Tool { retry: 2, dryRun: false, webUrl: "none" }

    $ cat load-config.json
    { "retry": 44, "dryRun": true, "webUrl": "yyy" }

    $ ./load-config.ts --retry 88 --config ./load-config.json down
    down command { force: undefined, timeout: undefined } Tool {
      retry: 88,
      dryRun: false,
      webUrl: "yyy",
      config: "./load-config.json"
    }

    $ ./load-config.ts --config '{"retry": 44}'
    main command Tool {
      retry: 44,
      dryRun: false,
      webUrl: "none",
      config: '{"retry": 44}'
    }
 */
