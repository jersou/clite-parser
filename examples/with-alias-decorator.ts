#!/usr/bin/env -S deno run -A
import { alias, cliteRun, help, type } from "../clite_parser.ts";

class Tool {
  @alias("a")
  all?: boolean;
  @alias("r")
  retry = 2;
  @alias("w")
  webUrl = "none"; // fields are converted to kebab case as global options

  @alias("nb")
  @alias("n")
  @help("n & b")
  @type("boolean")
  no_color?: string | boolean; // → --no-color

  main() {
    console.log("main command", this);
  }
}

cliteRun(new Tool());
