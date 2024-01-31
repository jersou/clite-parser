#!/usr/bin/env -S deno run -A

// deno install -f --name dcpm -A https://deno.land/x/clite_parser@0.2.1/examples/dcpm.ts

import { cliteRun } from "https://deno.land/x/clite_parser@0.2.1/clite_parser.ts";
import $ from "https://deno.land/x/dax@0.37.1/mod.ts";
import { DockerComposePs } from "./dcpps.ts";

class DockerComposeUpMenu {
  _desc = `Print menu to select services to up with docker compose`;

  _getServices() {
    const dcpPs = new DockerComposePs();
    dcpPs._check();
    return dcpPs._getServices();
  }

  async main() {
    const options = this._getServices();
    const indexes = await $.multiSelect({
      options,
      message: "Select services to up :",
      noClear: true,
    });
    if (indexes.length > 0) {
      const servicesToUp = indexes.map((index) => options[index]);
      await $.raw`docker compose up ${servicesToUp}`.printCommand();
    }
  }
}

// if the file is imported, do not execute this block
if (import.meta.main) {
  cliteRun(new DockerComposeUpMenu());
}
