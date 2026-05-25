#!/usr/bin/env -S node
import { cliteRun } from "./dist/mod.mjs";

export const _json_config = true;

export const retry = 2;

export function main() {
  console.log("main command", this);
}

cliteRun(import.meta);

// Clite setters for options
export const _set__json_config = (v) => (_json_config = v);
export const _set_retry = (v) => (retry = v);