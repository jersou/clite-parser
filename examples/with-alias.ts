#!/usr/bin/env -S deno run -A
import { cliteRun } from "../clite_parser.ts";

class Tool {
  _retry_alias = "r";
  retry = 2;
  _webUrl_alias = "w";
  webUrl = "none"; // fields are converted to kebab case as global options
  _no_color_alias = "nb";
  no_color?: string | boolean; // → --no-color

  main() {
    console.log("main command", this);
  }
}

cliteRun(new Tool());
