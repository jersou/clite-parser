import { assertEquals } from "@std/assert";
import { parseArgs, type ParseResult } from "./parse_args.ts";

Deno.test("args regex", () => {
  const result = "force, timeout = 10"
    .replace(/\s*=\s*[^,]+\s*/g, "")
    .split(",")
    .map((arg) => arg.trim());
  assertEquals(result, ["force", "timeout"]);
});

Deno.test("parseArgs", () => {
  const parseResult = parseArgs(
    {},
    {
      args: [
        "--opt2=false",
        "--opt3=qsdf",
        "--opt-snake-case=123",
        "--opt-camel-case=456",
        "down",
        "true",
        "12s",
      ],
    },
  );
  const expected: ParseResult = {
    options: {
      opt2: "false",
      opt3: "qsdf",
      optSnakeCase: 123,
      optCamelCase: 456,
    },
    command: "down",
    commandArgs: ["true", "12s"],
  };
  assertEquals(parseResult, expected);
});

Deno.test("parseArgs noCommand", () => {
  const parseResult = parseArgs(
    {},
    {
      args: [
        "--opt2=false",
        "--opt3=qsdf",
        "--opt-snake-case=123",
        "--opt-camel-case=456",
        "down",
        "true",
        "12s",
      ],
      noCommand: true,
    },
  );
  const expected: ParseResult = {
    options: {
      opt2: "false",
      opt3: "qsdf",
      optSnakeCase: 123,
      optCamelCase: 456,
    },
    command: "main",
    commandArgs: ["down", "true", "12s"],
  };
  assertEquals(parseResult, expected);
});

Deno.test("parseArgs full", () => {
  const parseResult = parseArgs(
    {},
    {
      args: [
        "--opt1=123",
        "--opt2=false",
        "-u=qsdf",
        "-abc",
        "--opt-snake-case",
        "123",
        "-o",
        "456",
        "--",
        "down",
        "true",
        "-y",
        "12s",
      ],
    },
  );

  const expected: ParseResult = {
    options: {
      opt1: 123,
      opt2: "false",
      u: "qsdf",
      a: true,
      b: true,
      c: true,
      optSnakeCase: 123,
      o: 456,
    },
    command: "down",
    commandArgs: ["true", "-y", "12s"],
  };
  assertEquals(parseResult, expected);
});
