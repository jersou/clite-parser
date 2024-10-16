#!/usr/bin/env -S deno run -A
import { cliteRun, subcommand } from "../clite_parser.ts";

class Up {
  _parent?: Tool;
  watch = false;
  main(_count: number) {
    console.log("Up", this);
  }
}

class Tool {
  dryRun = false;

  @subcommand()
  up = Up;

  @subcommand()
  down = {
    volumes: false,
    main(force: boolean, timeout: number) {
      console.log("Down", this);
    },
  };
}

cliteRun(new Tool());
