import { assertEquals, assertThrows } from "@std/assert";
import { parseArgs, type ParseResult } from "./parse_args.ts";
import { cliteParse } from "../clite_parser.ts";
import { StudioPackGenerator } from "../examples/studio_pack_generator.ts";

Deno.test("args regex", () => {
  const result = "force, timeout = 10"
    .replace(/\s*=\s*[^,]+\s*/g, "")
    .split(",")
    .map((arg) => arg.trim());
  assertEquals(result, ["force", "timeout"]);
});

Deno.test("parseArgs", () => {
  const parseResult = parseArgs(
    {
      opt2: true,
      opt3: "ee",
      optSnakeCase: 1,
      optCamelCase: 4,
    },
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
      opt2: false,
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
    {
      opt2: true,
      opt3: "ee",
      optSnakeCase: 1,
      optCamelCase: 4,
    },
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
      opt2: false,
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
    {
      opt1: 1,
      opt2: true,
      optSnakeCase: 1,
      a: false,
      b: false,
      c: false,
      o: 1,
      u: "a",
    },
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
      opt2: false,
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

class ToolBooleanBeforeCmd {
  retry = 1;
  dryRun = false;
  mainFunc(arg1: string, arg2: string) {
    console.log(this, { arg1, arg2 });
  }
}
Deno.test({
  name: "ToolBooleanBeforeCmd",
  fn() {
    const res = cliteParse(ToolBooleanBeforeCmd, {
      args: ["--retry", "2", "--dry-run", "mainFunc", "bar"],
    });
    assertEquals(res.commandArgs, ["bar"]);
    assertEquals(res.command, "mainFunc");
    assertEquals(res.obj.dryRun, true);
    assertEquals(res.obj.retry, 2);
  },
});

Deno.test({
  name: "ToolBooleanBeforeCmdNoCmd",
  fn() {
    const res = cliteParse(ToolBooleanBeforeCmd, {
      args: ["--retry", "2", "--dry-run", "foo", "bar"],
      noCommand: true,
    });
    assertEquals(res.commandArgs, ["foo", "bar"]);
    assertEquals(res.command, "mainFunc");
    assertEquals(res.obj.dryRun, true);
    assertEquals(res.obj.retry, 2);
  },
});

Deno.test({
  name: "ToolBooleanBeforeCmdNoCmdSpg",
  fn() {
    const res = cliteParse(StudioPackGenerator, {
      noCommand: true,
      args: ["--skip-extract-image-from-mp-3", "https://...xml"],
    });
    assertEquals(res.command, "main");
    assertEquals(
      (res.obj as StudioPackGenerator).skipExtractImageFromMp3,
      true,
    );
    assertEquals(res.commandArgs, ["https://...xml"]);
  },
});

Deno.test({
  name: "Throw if the option is not found",
  fn() {
    assertThrows(() => {
      cliteParse(StudioPackGenerator, {
        noCommand: true,
        args: ["--skip-extract-image-from-mp3", "https://...xml"], // should be --skip-extract-image-from-mp-3
      });
    });
  },
});
