#!/usr/bin/env -S deno run -A

// deno install -g -f --name dcpm -A https://jsr.io/@jersou/clite/0.7.0/examples/dcpm.ts

import { cliteRun } from "../clite_parser.ts";
import $ from "jsr:@david/dax@0.42.0";
import { DockerComposePs } from "./dcpps.ts";

class DockerComposeUpMenu {
  _help = `Print menu to select services to up with docker compose`;

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
  cliteRun(DockerComposeUpMenu);
}
