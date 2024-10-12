#!/usr/bin/env -S deno run -A
import { cliteRun } from "jsr:@jersou/clite@0.6.1";

class Tool {
  obj?: { foo: { bar1?: number; bar2?: number }; toto?: number };

  main() {
    console.log("main command", this);
  }
}

cliteRun(Tool);

// ./example-object.ts --obj.foo.bar1 12 --obj.foo.bar2 45  --obj.toto 89 --obj.tata 77
// main command Tool { obj: { foo: { bar1: 12, bar2: 45 }, toto: 89, tata: 77 } }

/*

*/
