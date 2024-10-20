#!/usr/bin/env -S deno run -A
// deno install -g -f --name dcpps -A https://jsr.io/@jersou/clite/.6.0/examples/dcpps.ts
//
// Colorize the "docker compose ps" command and watch changes
//
// Usage: <DockerComposePs file> [Options] [--] [command [command args]]
//
// Commands:
//   main  Colorize the ps one time [default]
//   watch Repeat the colorization of the "docker compose ps" command
//
// Options:
//   -h, --help     Show this help                [default: false]
//       --interval repeat watch every <INTERVAL> sec [default: 1]

import { cliteRun, help } from "jsr:@jersou/clite@0.7.4";
import $ from "jsr:@david/dax@0.42.0";
import { assert } from "jsr:@std/assert@1.0.5";
import {
  bgBrightGreen,
  bgGreen,
  bgRed,
  bgYellow,
  black,
} from "jsr:@std/fmt@1.0.2/colors";
import { parse as parseYaml } from "jsr:@std/yaml@1.0.5";

type DockerComposePsLine = {
  "Service": string;
  "State": string;
  "Health": string;
};

@help(`Colorize the "docker compose ps" command and watch changes`)
export class DockerComposePs {
  @help("repeat watch every <INTERVAL> sec")
  interval = 1;

  @help("Colorize the ps one time")
  async main() {
    this._check();
    console.log(await this.#getDockerComposePsLines(this._getServices()));
  }

  @help('Repeat the colorization of the "docker compose ps" command')
  async watch() {
    this._check();
    const services = this._getServices();
    console.clear();
    let prevPs = "";
    while (true) {
      const newPs = await this.#getDockerComposePsLines(services);
      if (newPs !== prevPs) {
        console.clear();
        console.log(newPs);
        prevPs = newPs;
      }
      await $.sleep(this.interval * 1000);
    }
  }

  #getYamlPath() {
    if ($.path("./docker-compose.yml").existsSync()) {
      return "./docker-compose.yml";
    } else if ($.path("./docker-compose.yaml").existsSync()) {
      return "./docker-compose.yaml";
    }
    return undefined;
  }

  _check() {
    assert(
      this.#getYamlPath(),
      `No file docker-compose.yml or docker-compose.yaml in "${Deno.cwd()}" !`,
    );
  }

  _getServices() {
    // deno-lint-ignore no-explicit-any
    const yaml = parseYaml($.path(this.#getYamlPath()!).readTextSync()) as any;
    return Object.entries(yaml.services)
      // deno-lint-ignore no-explicit-any
      .filter(([_, service]: [string, any]) =>
        !(service.labels?.["hide-from-dcpps"])
      )
      .map(([key]) => key).sort();
  }

  async #getDockerComposePsData() {
    return (await $`docker compose ps --format json`
      .lines())
      .filter((l: string) => l)
      .map((l: string) => JSON.parse(l)) as unknown as DockerComposePsLine[];
  }

  #getColor(state: string, Health: string) {
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

  #getPrefix(state: string, Health: string): string {
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

  #getLine({ State, Service, Health }: DockerComposePsLine) {
    const color = this.#getColor(State, Health);
    const prefix = this.#getPrefix(State, Health);
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

  async #getDockerComposePsLines(services: string[]) {
    const psData = await this.#getDockerComposePsData();
    return services
      .map((service) =>
        psData.find((line) => line.Service === service) ?? {
          Service: service,
          Health: "",
          State: "not created",
        } as DockerComposePsLine
      )
      .map((l) => this.#getLine(l)).join("\n");
  }
}

// if the file is imported, do not execute this block
if (import.meta.main) {
  cliteRun(DockerComposePs);
}
