import { assertEquals } from "jsr:@std/assert@1.0.5";
import { cliteRun } from "./clite_parser.ts";
import { stripAnsiCode } from "jsr:@std/fmt@1.0.2/colors";
import { align, genHelp } from "./src/help.ts";
import { parseArgs, type ParseResult } from "./src/parse_args.ts";
import {
  getFieldNames,
  getFunctionArgNames,
  getMethodArgNames,
  getMethodNames,
} from "./src/reflect.ts";

Deno.test("getFunctionArgNames", () => {
  function funcTest(arg1: string, arg2: boolean, arg3: number) {
    console.log("funcTest", arg1, arg2, arg3);
  }

  const argNames = getFunctionArgNames(funcTest);
  assertEquals(argNames, ["arg1", "arg2", "arg3"]);
});

class Tool {
  _help = "test data";
  opt1 = 123;
  opt2 = true;
  opt3 = "azer";
  opt_snake_case?: string;
  optCamelCase?: string;
  _hidden = 5;
  _opt3_help = "option 3 desc";
  _clean_help = "clean all data";
  _optCamelCase_help = "optCamelCase desc";

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
  assertEquals(getMethodNames(tool), ["up", "down", "clean", "_priv", "main"]);
});

Deno.test("getFieldNames", () => {
  const tool = new Tool();
  assertEquals(getFieldNames(tool), [
    "_help",
    "opt1",
    "opt2",
    "opt3",
    "opt_snake_case",
    "optCamelCase",
    "_hidden",
    "_opt3_help",
    "_clean_help",
    "_optCamelCase_help",
  ]);
});

Deno.test("args regex", () => {
  const result = "force, timeout = 10"
    .replace(/\s*=\s*[^,]+\s*/g, "")
    .split(",")
    .map((arg) => arg.trim());
  assertEquals(result, ["force", "timeout"]);
});

Deno.test("getMethodArgNames", () => {
  const tool = new Tool();
  assertEquals(getMethodArgNames(tool, "down"), ["force", "timeout"]);
});

Deno.test("genHelp", () => {
  const tool = new Tool();
  const expected = `test data

Usage: <Tool file> [Options] [command [command args]]

Commands:
  up
  down <force> <timeout>
  clean                  clean all data
  main                   [default]

Options:
 -h, --help           Show this help [default: false]
     --opt-1                           [default: 123]
     --opt-2                          [default: true]
     --opt-3          option 3 desc [default: "azer"]
     --opt-snake-case
     --opt-camel-case optCamelCase desc`;
  assertEquals(stripAnsiCode(genHelp(tool)), expected);
});

Deno.test("genHelp  noCommand", () => {
  const tool = new Tool();
  const expected = `test data

Usage: <Tool file> [Options] [args]

Options:
 -h, --help           Show this help [default: false]
     --opt-1                           [default: 123]
     --opt-2                          [default: true]
     --opt-3          option 3 desc [default: "azer"]
     --opt-snake-case
     --opt-camel-case optCamelCase desc`;
  assertEquals(stripAnsiCode(genHelp(tool, { noCommand: true })), expected);
});

Deno.test("genHelp  mainFile", () => {
  const tool = new Tool();
  const expected = `test data

Usage: the_tool_file [Options] [command [command args]]

Commands:
  up
  down <force> <timeout>
  clean                  clean all data
  main                   [default]

Options:
 -h, --help           Show this help [default: false]
     --opt-1                           [default: 123]
     --opt-2                          [default: true]
     --opt-3          option 3 desc [default: "azer"]
     --opt-snake-case
     --opt-camel-case optCamelCase desc`;
  assertEquals(
    stripAnsiCode(genHelp(tool, { mainFile: "the_tool_file" })),
    expected,
  );
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
  const input: [string, string, string, string][] = [
    ["az ", "t", "sssss ", "hhh"],
    ["azert ", "t", "ss ", "h"],
  ];
  const result = align(input);
  const expected = ["   az t sssss  hhh", "azert t ss       h"];
  assertEquals(result, expected);
});
