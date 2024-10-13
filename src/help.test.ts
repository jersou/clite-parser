import { assert, assertEquals } from "@std/assert";
import { stripAnsiCode } from "@std/fmt/colors";
import { align, genHelp } from "./help.ts";
import { Tool } from "./test_data.test.ts";
import { hidden, usage } from "./decorators.ts";
import { cliteParse } from "../clite_parser.ts";

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
    const result = cliteParse(ToolUsage, { args: ["--help"] });
    assert(result.help.includes(" new usage\n"));
  },
});

class Tool_Usage {
  _usage = "new usage";
}

Deno.test({
  name: "_usage",
  fn() {
    const result = cliteParse(Tool_Usage, { args: ["--help"] });
    assert(result.help.includes(" new usage\n"));
  },
});

class ToolHiddenField {
  @hidden()
  foo = 12;
}

Deno.test({
  name: "@hidden",
  fn() {
    const result = cliteParse(ToolHiddenField, {
      args: ["--help"],
    });
    assert(!result.help.includes("foo"), "Help includes foo :\n" + result.help);
  },
});

class Tool_HiddenField {
  _foo_hidden = true;
  foo = 12;
}
Deno.test({
  name: "_hidden",
  fn() {
    const result = cliteParse(Tool_HiddenField, { args: ["--help"] });
    assert(!result.help.includes("foo"), "Help includes foo :\n" + result.help);
  },
});
