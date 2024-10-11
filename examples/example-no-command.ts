#!/usr/bin/env -S deno run -A
import { cliteRun } from "jsr:@jersou/clite@0.6.0";
import { Tool } from "./example.ts";

if (import.meta.main) { // if the file is imported, do not execute this block
  cliteRun(new Tool(), { noCommand: true });
}
