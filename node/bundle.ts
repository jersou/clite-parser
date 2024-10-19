#!/usr/bin/env -S deno run -A

import { bundle } from "jsr:@deno/emit@0.45.0";
import $ from "jsr:@david/dax@0.42.0";
const result = await bundle(
  import.meta.resolve("./mod.ts"),
  { importMap: import.meta.resolve("./deno.json") },
);

const { code } = result;

await $`mkdir -p dist`;

// FIXME bundle...
Deno.writeTextFileSync(
  "dist/mod.mjs",
  code.replace(
    "let fs = undefined;",
    'import fs from "node:fs";',
  ),
);
await $`npx --yes -p typescript tsc ./mod.ts --declaration --allowJs --emitDeclarationOnly --outDir dist`
  .noThrow();
await $`deno fmt dist`;
await $`rm -rf dist/node/`.noThrow();
for (const entry of $.path("dist/src").readDirSync()) {
  const content = entry.path.readTextSync().replaceAll('.ts"', '.d.ts"');
  entry.path.writeTextSync(content);
}
