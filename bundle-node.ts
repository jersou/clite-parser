#!/usr/bin/env -S deno run -A

import $ from "jsr:@david/dax@0.42.0";
const code = await $`deno bundle ./mod.ts`.text();
await $`mkdir -p node/dist`;
Deno.writeTextFileSync("node/dist/mod.mjs", code);
await $`npx --yes -p typescript tsc ./mod.ts --declaration --allowJs --emitDeclarationOnly --outDir node/dist`
  .noThrow();
await $`deno fmt node/dist`;
await $`rm -rf node/dist/node/`.noThrow();
for (const entry of $.path("node/dist/src").readDirSync()) {
  const content = entry.path.readTextSync().replaceAll('.ts"', '.d.ts"');
  entry.path.writeTextSync(content);
}
await $`cp README.md node/README.md`;
