#!/usr/bin/env -S deno run -A
import { cliteRun } from "./clite_parser.ts";

class Tool {
  _desc = "This tool is a full example\nof CliteParser usage";
  retry = 2;
  webUrl = "none";
  _webUrl_desc = "web URL ...";
  no_color?: boolean;
  _no_color_desc = "skip colorize";
  _clean_desc = "clean all data";
  _main_desc = "do nothing...";
  _up_desc = "create and start the services";
  _down_desc = "stop and delete the services";

  main() {
    console.log("main command", this);
  }

  up() {
    console.log("up command", this);
  }

  clean() {
    console.log("clean command", this);
  }

  down(force: boolean, timeout: number) {
    console.log("down command");
    console.log("command args :", { force, timeout });
    console.log("options :", this);
  }

  _priv() {
    console.log("this method is not visible in the help (starts with '_')");
  }
}

if (import.meta.main) { // if the file is imported, do not execute this block
  cliteRun(new Tool());
}

// $ ./example.ts --retry=4 --web-url=tttt --no-color down true 14
// > down command
// > command args : { force: "true", timeout: "14" }
// > options : Tool { retry: "4", webUrl: "tttt", no_color: true }

// $ ./example.ts --help
// > Usage: Tool [Options] [command [command args]]
// > Commands:
// >   main (default)
// >   up
// >   down <force> <timeout>
// > Options:
// >   --retry=<value>   (default "2")
// >   --web-url=<value>   (default "none")
// >   --no-color=<value>
