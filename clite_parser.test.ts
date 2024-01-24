import { assertEquals } from "https://deno.land/std@0.212.0/assert/mod.ts";
import {
  cliteRun,
  genHelp,
  getFieldNames,
  getFunctionArgNames,
  getMethodArgNames,
  getMethodNames,
  parseArgs,
  ParseResult,
} from "./clite_parser.ts";

Deno.test("getFunctionArgNames", () => {
  function funcTest(arg1: string, arg2: boolean, arg3: number) {
    console.log("funcTest", arg1, arg2, arg3);
  }

  const argNames = getFunctionArgNames(funcTest);
  assertEquals(argNames, ["arg1", "arg2", "arg3"]);
});

class Tool {
  opt1 = 123;
  opt2 = true;
  opt3 = "azer";
  opt_snake_case?: string;
  optCamelCase?: string;
  _hidden = 5;

  up() {
    console.log("up", this);
  }

  down(force: boolean, timeout = 10) {
    console.log("down", force, timeout, this);
    return `down force=${force} timeout=${timeout}
    opt1=${this.opt1}
    opt2=${this.opt2}
    opt3=${this.opt3}
    opt_snake_case=${this.opt_snake_case}
    optCamelCase=${this.optCamelCase}`;
  }

  _priv() {
    console.log("this method is not visible in the help (starts with '_')");
  }

  main() {
    console.log("main", this);
  }
}

Deno.test("getMethodNames", () => {
  const tool = new Tool();
  assertEquals(getMethodNames(tool), [
    "up",
    "down",
    "_priv",
    "main",
  ]);
});

Deno.test("getFieldNames", () => {
  const tool = new Tool();
  assertEquals(getFieldNames(tool), [
    "opt1",
    "opt2",
    "opt3",
    "opt_snake_case",
    "optCamelCase",
    "_hidden",
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
  const expected = `Tool Help
Usage: <Tool file> [Options] [command [command args]]
Commands:
  up
  down <force> <timeout>
  main (default)
Options:
  --opt1=<value>   (default "123")
  --opt2=<value>   (default "true")
  --opt3=<value>   (default "azer")
  --opt-snake-case=<value>
  --opt-camel-case=<value>`;
  assertEquals(genHelp(tool), expected);
});
Deno.test("parseArgs", () => {
  const parseResult = parseArgs([
    "--opt2=false",
    "--opt3=qsdf",
    "--opt-snake-case=123",
    "--opt-camel-case=456",
    "down",
    "true",
    "12s",
  ]);
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

Deno.test("cliteRun", () => {
  const result = cliteRun(new Tool(), [
    "--opt2=false",
    "--opt3=qsdf",
    "--opt-snake-case=123",
    "--opt-camel-case=456",
    "down",
    "true",
    "12s",
  ]);
  const expected = `down force=true timeout=12s
    opt1=123
    opt2=false
    opt3=qsdf
    opt_snake_case=123
    optCamelCase=456`;
  assertEquals(result, expected);
});

Deno.test("cliteRun help", () => {
  const result = cliteRun(new Tool(), [
    "--help",
  ]);
  const expected = genHelp(new Tool());
  assertEquals(result, expected);
});
