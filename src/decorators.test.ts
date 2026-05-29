import { assertEquals } from "@std/assert";
import { clinferParse } from "./clinfer_parser.ts";
import { negatable } from "./decorators.ts";

Deno.test({
  name: "@negatable",
  async fn() {
    class Tool {
      @negatable()
      dryRun = true;
      main() {}
    }
    const res = await clinferParse(Tool, { args: ["--no-dry-run"] });
    assertEquals(res.obj.dryRun, false);
  },
});
