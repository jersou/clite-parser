import type { ParseResult } from "./parse_args.ts";
import type { Obj } from "./types.ts";

// deno-lint-ignore no-explicit-any
let fs: any = undefined;
if (!globalThis.Deno) {
  fs = await import("node:fs");
}

export function loadConfig(parseResult: ParseResult, obj: Obj) {
  const pathOrJson = parseResult.options.config as string;
  try {
    if (pathOrJson.match(/^\s*{/)) {
      Object.assign(obj, JSON.parse(pathOrJson));
    } else {
      if ((globalThis as Obj)["Deno"]?.args) { // Deno implementation
        Object.assign(obj, JSON.parse(Deno.readTextFileSync(pathOrJson)));
      } else if (fs) {
        Object.assign(obj, JSON.parse(fs.readFileSync(pathOrJson, "utf8")));
      } else {
        throw new Error("Load config is not implemented in this runtime");
      }
    }
    obj.config = pathOrJson;
  } catch (error) {
    throw new Error(
      `Error while loading the config "${pathOrJson}"`,
      { cause: { clite: true, error } },
    );
  }
}
