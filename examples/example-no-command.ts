#!/usr/bin/env -S deno run -A
import { cliFrom } from "../mod.ts";
import { Tool } from "./example.ts";

if (import.meta.main) { // if the file is imported, do not execute this block
  cliFrom(Tool, { noCommand: true });
}
