import { assertEquals } from "@std/assert";
import { cliFromParse } from "./clifrom_parser.ts";
import { negatable } from "./decorators.ts";

Deno.test({
  name: "@negatable",
  async fn() {
    class Tool {
      @negatable()
      dryRun = true;
      main() {}
    }
    const res = await cliFromParse(Tool, { args: ["--no-dry-run"] });
    assertEquals(res.obj.dryRun, false);
  },
});
