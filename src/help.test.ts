import { assert, assertEquals } from "@std/assert";
import { stripAnsiCode } from "@std/fmt/colors";
import { align, genHelp } from "./help.ts";
import { Tool } from "./test_data.test.ts";
import { usage } from "./decorators.ts";
import { cliteRun, type DontRunResult } from "../clite_parser.ts";

Deno.test("genHelp", () => {
  const tool = new Tool();
  const expected = `test data

Usage: <Tool file> [Options] [--] [command [command args]]

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

Usage: <Tool file> [Options] [--] [args]

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

Usage: the_tool_file [Options] [--] [command [command args]]

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

Deno.test("align", () => {
  const input: [string, string, string, string][] = [
    ["az ", "t", "sssss ", "hhh"],
    ["azert ", "t", "ss ", "h"],
  ];
  const result = align(input);
  const expected = ["   az t sssss  hhh", "azert t ss       h"];
  assertEquals(result, expected);
});

@usage("new usage")
class ToolUsage {
}

Deno.test({
  name: "@usage",
  fn() {
    const result = cliteRun(ToolUsage, {
      args: ["--help"],
      dontRun: true,
    }) as DontRunResult;
    assert(result.help.includes(" new usage\n"));
  },
});

class Tool_Usage {
  _usage = "new usage";
}

Deno.test({
  name: "_usage",
  fn() {
    const result = cliteRun(Tool_Usage, {
      args: ["--help"],
      dontRun: true,
    }) as DontRunResult;
    assert(result.help.includes(" new usage\n"));
  },
});
