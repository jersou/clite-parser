#!/usr/bin/env -S deno run -A
import { cliteRun } from "../clite_parser.ts";
import { Tool } from "./example.ts";

if (import.meta.main) { // if the file is imported, do not execute this block
  cliteRun(Tool, { noCommand: true });
}
