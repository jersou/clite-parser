#!/usr/bin/env -S deno run -A

// deno install -f --name dcpm -A https://deno.land/x/clite_parser@0.2.2/examples/dcpm.ts

import { cliteRun } from "jsr:@jersou/clite@0.3.1";
import $ from "jsr:@david/dax@0.41.0";
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
