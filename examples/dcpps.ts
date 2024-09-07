#!/usr/bin/env -S deno run -A

// deno install -g -f --name dcpps -A https://jsr.io/@jersou/clite/0.3.1/examples/dcpps.ts

// Colorize the "docker compose ps" command and watch changes
//
// Usage: <DockerComposePs file> [Options] [command [command args]]
//
// Commands:
//   main   Colorize the ps one time (default)
//   watch  Repeat the colorization of the "docker compose ps" command
//
// Options:
//   --interval=<INTERVAL>  repeat watch every <INTERVAL> sec (default "1")
//   --help                 Show this help

import { cliteRun } from "jsr:@jersou/clite@0.3.1";
import $ from "jsr:@david/dax@0.41.0";
import { assert } from "jsr:@std/assert@^1.0.4";
import {
  bgBrightGreen,
  bgGreen,
  bgRed,
  bgYellow,
  black,
} from "jsr:@std/fmt@^1.0.2/colors";
import { parse as parseYaml } from "jsr:@std/yaml@1.0.5";

type DockerComposePsLine = {
  "Service": string;
  "State": string;
  "Health": string;
};

export class DockerComposePs {
  interval = 1;
  _interval_desc = "repeat watch every <INTERVAL> sec";
  _desc = `Colorize the "docker compose ps" command and watch changes`;
  _main_desc = "Colorize the ps one time";
  _watch_desc = 'Repeat the colorization of the "docker compose ps" command';

  async main() {
    this._check();
    console.log(await this._getDockerComposePsLines(this._getServices()));
  }

  async watch() {
    this._check();
    const services = this._getServices();
    console.clear();
    let prevPs = "";
    while (true) {
      const newPs = await this._getDockerComposePsLines(services);
      if (newPs !== prevPs) {
        console.clear();
        console.log(newPs);
        prevPs = newPs;
      }
      await $.sleep(this.interval * 1000);
    }
  }

  _getYamlPath() {
    if ($.path("./docker-compose.yml").existsSync()) {
      return "./docker-compose.yml";
    } else if ($.path("./docker-compose.yaml").existsSync()) {
      return "./docker-compose.yaml";
    }
    return undefined;
  }

  _check() {
    assert(
      this._getYamlPath(),
      `No file docker-compose.yml or docker-compose.yaml in "${Deno.cwd()}" !`,
    );
  }

  _getServices() {
    // deno-lint-ignore no-explicit-any
    const yaml = parseYaml($.path(this._getYamlPath()!).readTextSync()) as any;
    return Object.entries(yaml.services)
      // deno-lint-ignore no-explicit-any
      .filter(([_, service]: [string, any]) =>
        !(service.labels?.["hide-from-dcpps"])
      )
      .map(([key]) => key).sort();
  }

  async _getDockerComposePsData() {
    return (await $`docker compose ps --format json`
      .text()).split("\n").filter((l) => l).map((t) =>
        JSON.parse(t)
      ) as unknown as DockerComposePsLine[];
  }

  _getColor(state: string, Health: string) {
    switch (state) {
      case "not created":
      case "dead":
      case "removing":
      case "paused":
      case "exited":
        return Health === "starting" ? bgYellow : bgRed;
      case "restarting":
      case "created":
        return (txt: string) => bgYellow(black(txt));
      case "running":
        switch (Health) {
          case "starting":
            return (txt: string) => bgYellow(black(txt));
          case "healthy":
            return (txt: string) => bgBrightGreen(black(txt));
          default:
            return (txt: string) => bgGreen(black(txt));
        }
      default:
        return (txt: string) => txt;
    }
  }

  _getPrefix(state: string, Health: string): string {
    switch (state) {
      case "not created":
      case "dead":
      case "removing":
      case "paused":
      case "exited":
        return Health === "starting" ? "⏩" : "❌";
      case "restarting":
      case "created":
        return "⏩";
      case "running":
        switch (Health) {
          case "starting":
            return "⏩";
          case "healthy":
            return "✅";
          case "unhealthy":
            return "⚠️ ️ ";
          default:
            return "✅";
        }
      default:
        return "";
    }
  }

  _getLine({ State, Service, Health }: DockerComposePsLine) {
    const color = this._getColor(State, Health);
    const prefix = this._getPrefix(State, Health);
    return color(
      [
        "",
        prefix.padEnd(2, " "),
        Service.padEnd(30, " "),
        State.padEnd(12, " "),
        Health.padEnd(10, " "),
      ]
        .join(" "),
    );
  }

  async _getDockerComposePsLines(services: string[]) {
    const psData = await this._getDockerComposePsData();
    return services
      .map((service) =>
        psData.find((line) => line.Service === service) ?? {
          Service: service,
          Health: "",
          State: "not created",
        } as DockerComposePsLine
      )
      .map((l) => this._getLine(l)).join("\n");
  }
}

// if the file is imported, do not execute this block
if (import.meta.main) {
  cliteRun(new DockerComposePs());
}
