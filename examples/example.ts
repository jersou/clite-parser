#!/usr/bin/env -S deno run -A
import { cliteRun } from "jsr:@jersou/clite@0.6.0";
// or after "deno add @jersou/clite" : import { cliteRun } from "@jersou/clite";
// or for Node usage, after "npx jsr add @jersou/clite" (same import from "@jersou/clite")

export class Tool {
  _help = "This tool is a full example of CliteParser usage";
  retry = 2;
  webUrl = "none";
  _webUrl_help = "web URL ...";
  no_color?: string | boolean;
  _no_color_help = "skip colorize";
  _clean_help = "clean all data";
  _main_help = "do up/down/clean";
  _up_help = "create and start the services";
  _down_help = "stop and delete the services";
  _priv_field = 123;

  main() {
    console.log("main command", this);
    this.up();
    this.down(false, 2);
    this.clean();
  }

  async up() {
    console.log("up command", this);
    await new Promise((resolve) => setTimeout(resolve, 100));
    return "up ok";
  }

  clean() {
    console.log("clean command", this);
    return "clean ok";
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
  cliteRun(Tool); // or cliteRun(new Tool());
}

// $ ./example.ts --retry=4 --web-url=tttt --no-color down true 14
// > down command
// > command args : { force: "true", timeout: "14" }
// > options : Tool { retry: "4", webUrl: "tttt", no_color: true }

// $ ./example.ts --help
// > Usage: Tool [Options] [--] [command [command args]]
// > Commands:
// >   main (default)
// >   up
// >   down <force> <timeout>
// > Options:
// >   --retry=<value>   (default "2")
// >   --web-url=<value>   (default "none")
// >   --no-color=<value>
