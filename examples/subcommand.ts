#!/usr/bin/env -S deno run -A
import { cliFrom, subcommand } from "../mod.ts";

class Up {
  _clifrom_parent?: Tool;
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

cliFrom(new Tool());
