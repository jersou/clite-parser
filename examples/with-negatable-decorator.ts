#!/usr/bin/env -S deno run -A
import { cliteRun, help, negatable } from "../mod.ts";

class Tool {
  @negatable("disable TTY")
  @help("enable TTY")
  tty?: boolean;

  main() {
    console.log("main command", this);
  }
}

cliteRun(Tool);

/*
    $ ./with-negatable-decorator.ts --help
    Usage: <Tool file> [Options] [--] [command [command args]]

    Command:
      main [default]

    Options:
     -h, --help   Show this help [default: false]
         --tty    enable TTY
         --no-tty disable TTY

    $ ./with-negatable-decorator.ts --tty
    main command Tool { tty: true }

    $ ./with-negatable-decorator.ts --no-tty
    main command Tool { tty: false }
*/
