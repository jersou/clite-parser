import type { ParseResult } from "./parse_args.ts";
import type { Obj } from "./types.ts";

import fs from "node:fs";

export function loadConfig(parseResult: ParseResult, obj: Obj) {
  const pathOrJson = parseResult.options.config as string;
  try {
    if (pathOrJson.match(/^\s*{/)) {
      Object.assign(obj, JSON.parse(pathOrJson));
    } else {
      Object.assign(obj, JSON.parse(fs.readFileSync(pathOrJson, "utf8")));
    }
    obj.config = pathOrJson;
  } catch (error) {
    throw new Error(
      `Error while loading the config "${pathOrJson}"`,
      { cause: { clinfer: true, error } },
    );
  }
}
