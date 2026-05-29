#!/usr/bin/env -S deno run -A
import { clinfer } from "../mod.ts";
import { Tool } from "./example.ts";

if (import.meta.main) { // if the file is imported, do not execute this block
  clinfer(Tool, { noCommand: true });
}
