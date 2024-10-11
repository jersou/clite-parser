#!/usr/bin/env -S deno run -A
import { cliteRun } from "jsr:@jersou/clite@0.6.0";

cliteRun({
  retry: 2,
  main() {
    console.log("main command", this);
  },
  up(svc: string, timeout = 10) {
    console.log("up command", { svc, timeout, retry: this.retry });
  },
  down(svc: string) {
    console.log("down command", { svc, retry: this.retry });
  },
});
/*
    $ ./plain_object_lite.ts --help
    Usage: <Object file> [Options] [--] [command [command args]]

    Commands:
      main               [default]
      up <svc> <timeout>
      down <svc>

    Options:
     -h, --help  Show this help [default: false]
         --retry                    [default: 2]

    $ ./plain_object_lite.ts --retry 6 up foo 3
    up command { svc: "foo", timeout: 3, retry: 6 }
*/
