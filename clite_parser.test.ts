import { assertEquals } from "jsr:@std/assert@1.0.5";
import {
  align,
  cliteRun,
  genHelp,
  getFieldNames,
  getFunctionArgNames,
  getMethodArgNames,
  getMethodNames,
  parseArgs,
  type ParseResult,
} from "./clite_parser.ts";
import { stripAnsiCode } from "jsr:@std/fmt@1.0.2/colors";

Deno.test("getFunctionArgNames", () => {
  function funcTest(arg1: string, arg2: boolean, arg3: number) {
    console.log("funcTest", arg1, arg2, arg3);
  }

  const argNames = getFunctionArgNames(funcTest);
  assertEquals(argNames, ["arg1", "arg2", "arg3"]);
});

class Tool {
  _desc = "test data";
  opt1 = 123;
  opt2 = true;
  opt3 = "azer";
  opt_snake_case?: string;
  optCamelCase?: string;
  _hidden = 5;
  _opt3_desc = "option 3 desc";
  _clean_desc = "clean all data";
  _optCamelCase_desc = "optCamelCase desc";

  up() {
    console.log("up command", this);
  }

  down(force: boolean, timeout = 10) {
    console.log("down command", force, timeout, this);
    return `down force=${force} timeout=${timeout}
    opt1=${this.opt1}
    opt2=${this.opt2}
    opt3=${this.opt3}
    opt_snake_case=${this.opt_snake_case}
    optCamelCase=${this.optCamelCase}`;
  }

  clean() {
    console.log("clean command", this);
  }

  _priv() {
    console.log("this method is not visible in the help (starts with '_')");
  }

  main() {
    console.log("main command", this);
  }
}

Deno.test("getMethodNames", () => {
  const tool = new Tool();
  assertEquals(getMethodNames(tool), [
    "up",
    "down",
    "clean",
    "_priv",
    "main",
  ]);
});

Deno.test("getFieldNames", () => {
  const tool = new Tool();
  assertEquals(getFieldNames(tool), [
    "_desc",
    "opt1",
    "opt2",
    "opt3",
    "opt_snake_case",
    "optCamelCase",
    "_hidden",
    "_opt3_desc",
    "_clean_desc",
    "_optCamelCase_desc",
  ]);
});

Deno.test("args regex", () => {
  const result = "force, timeout = 10".replace(/\s*=\s*[^,]+\s*/g, "")
    .split(",").map((arg) => arg.trim());
  assertEquals(result, [
    "force",
    "timeout",
  ]);
});

Deno.test("getMethodArgNames", () => {
  const tool = new Tool();
  assertEquals(getMethodArgNames(tool, "down"), [
    "force",
    "timeout",
  ]);
});

Deno.test("genHelp", () => {
  const tool = new Tool();
  const expected = `test data

Usage: <Tool file> [Options] [command [command args]]

Commands:
  up
  down <force> <timeout>
  clean                   clean all data
  main                    (default)

Options:
  --opt-1=<OPT_1>                    (default "123")
  --opt-2=<OPT_2>                    (default "true")
  --opt-3=<OPT_3>                    option 3 desc (default "azer")
  --opt-snake-case=<OPT_SNAKE_CASE>
  --opt-camel-case=<OPT_CAMEL_CASE>  optCamelCase desc
  --help                             Show this help`;
  assertEquals(stripAnsiCode(genHelp(tool)), expected);
});

Deno.test("genHelp  noCommand", () => {
  const tool = new Tool();
  const expected = `test data

Usage: <Tool file> [Options] [args]

Options:
  --opt-1=<OPT_1>                    (default "123")
  --opt-2=<OPT_2>                    (default "true")
  --opt-3=<OPT_3>                    option 3 desc (default "azer")
  --opt-snake-case=<OPT_SNAKE_CASE>
  --opt-camel-case=<OPT_CAMEL_CASE>  optCamelCase desc
  --help                             Show this help`;
  assertEquals(stripAnsiCode(genHelp(tool, { noCommand: true })), expected);
});

Deno.test("parseArgs", () => {
  const parseResult = parseArgs({
    args: [
      "--opt2=false",
      "--opt3=qsdf",
      "--opt-snake-case=123",
      "--opt-camel-case=456",
      "down",
      "true",
      "12s",
    ],
  });
  const expected: ParseResult = {
    options: {
      opt2: "false",
      opt3: "qsdf",
      optSnakeCase: "123",
      optCamelCase: "456",
    },
    command: "down",
    commandArgs: ["true", "12s"],
  };
  assertEquals(parseResult, expected);
});

Deno.test("parseArgs noCommand", () => {
  const parseResult = parseArgs({
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
  });
  const expected: ParseResult = {
    options: {
      opt2: "false",
      opt3: "qsdf",
      optSnakeCase: "123",
      optCamelCase: "456",
    },
    command: "main",
    commandArgs: ["down", "true", "12s"],
  };
  assertEquals(parseResult, expected);
});

Deno.test("cliteRun", () => {
  const result = cliteRun(new Tool(), {
    args: [
      "--opt2=false",
      "--opt3=qsdf",
      "--opt-snake-case=123",
      "--opt-camel-case=456",
      "down",
      "true",
      "12s",
    ],
  });
  const expected = `down force=true timeout=12s
    opt1=123
    opt2=false
    opt3=qsdf
    opt_snake_case=123
    optCamelCase=456`;
  assertEquals(result, expected);
});

Deno.test("cliteRun help", () => {
  const result = cliteRun(new Tool(), {
    args: ["--help"],
  });
  const expected = genHelp(new Tool());
  assertEquals(result, expected);
});

Deno.test("align", () => {
  const input: [string, string][] = [["az", "t"], ["azert", "t"]];
  const result = align(input);
  const expected = ["az     t", "azert  t"];
  assertEquals(result, expected);
});
