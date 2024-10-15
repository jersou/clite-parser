import { assertEquals } from "@std/assert";
import { cliteParse, negatable } from "../clite_parser.ts";

Deno.test({
  name: "@negatable",
  fn() {
    class Tool {
      @negatable()
      dryRun = true;
      main() {}
    }
    const res = cliteParse(Tool, { args: ["--no-dry-run"] });
    assertEquals(res.obj.dryRun, false);
  },
});
