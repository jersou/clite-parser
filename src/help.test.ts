import { assert, assertEquals } from "@std/assert";
import { stripAnsiCode } from "@std/fmt/colors";
import { align, genHelp } from "./help.ts";
import { Tool } from "./test_data.test.ts";
import { defaultHelp, help, hidden, type, usage } from "./decorators.ts";
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

class Tool_Help {
  foo = 12;
  _foo_help = "foo help";
}
Deno.test({
  name: "_help",
  fn() {
    const result = cliteParse(Tool_Help, { args: ["--help"] });
    assert(result.help.includes("foo help"));
  },
});

Deno.test({
  name: "config",
  fn() {
    const result = cliteParse(Tool_Help, { args: ["--help"], configCli: true });
    assert(
      result.help.includes(
        "Use this file to read option before processing the args",
      ),
    );
  },
});

Deno.test({
  name: "config custom help",
  fn() {
    const result = cliteParse(Tool_Help, {
      args: ["--help"],
      configCli: "custom config help",
    });
    assert(result.help.includes("custom config help"));
  },
});

class Tool_Alias {
  _foo_alias = "f";
  foo = 12;
  _bar_alias = ["b", "ba"];
  bar = 45;
}

Deno.test({
  name: "_alias",
  fn() {
    const result = cliteParse(Tool_Alias, { args: ["--help"] });
    assertEquals(
      stripAnsiCode(result.help),
      `Usage: <Tool_Alias file> [Options] [--] [command [command args]]

Options:
       -h, --help Show this help [default: false]
       -f, --foo                    [default: 12]
 -b, --ba, --bar                    [default: 45]`,
    );
  },
});

Deno.test({
  name: "@help",
  fn() {
    class ToolHelp {
      @help("foo help")
      foo = 12;
      @type("string")
      unkStr?: string;
      @defaultHelp("default of unk")
      unk: unknown;
    }

    const result = cliteParse(ToolHelp, { args: ["--help"] });
    assertEquals(
      stripAnsiCode(result.help),
      `Usage: <ToolHelp file> [Options] [--] [command [command args]]

Options:
 -h, --help    Show this help [default: false]
     --foo     foo help          [default: 12]
     --unk-str                        [string]
     --unk         [default: "default of unk"]`,
    );
  },
});

Deno.test({
  name: "@help",
  fn() {
    class ToolHelp {
    }
    const result = cliteParse(ToolHelp, {
      args: ["--help"],
      mainFile: "CustomTitle",
    });
    assertEquals(
      stripAnsiCode(result.help),
      `Usage: CustomTitle [Options] [--] [command [command args]]

Option:
 -h, --help Show this help [default: false]`,
    );
  },
});

Deno.test({
  name: "@help",
  fn() {
    class ToolHelp {
    }
    const result = cliteParse(ToolHelp, {
      args: ["--help"],
      meta: import.meta,
    });
    assertEquals(
      stripAnsiCode(result.help),
      `Usage: ./help.test.ts [Options] [--] [command [command args]]

Option:
 -h, --help Show this help [default: false]`,
    );
  },
});

Deno.test({
  name: "_negatable help",
  fn() {
    class Tool {
      _dryRun_negatable = true;
      dryRun = true;
      main() {}
    }
    const res = cliteParse(Tool, { args: [] });
    assertEquals(
      stripAnsiCode(res.help),
      `Usage: <Tool file> [Options] [--] [command [command args]]

Command:
  main [default]

Options:
 -h, --help       Show this help [default: false]
     --dry-run                    [default: true]
     --no-dry-run`,
    );
  },
});

Deno.test({
  name: "_negatable custom help",
  fn() {
    class Tool {
      _dryRun_negatable = "to cancel dry-run";
      dryRun = true;
      main() {}
    }
    const res = cliteParse(Tool, { args: [] });
    assertEquals(
      stripAnsiCode(res.help),
      `Usage: <Tool file> [Options] [--] [command [command args]]

Command:
  main [default]

Options:
 -h, --help       Show this help [default: false]
     --dry-run                    [default: true]
     --no-dry-run to cancel dry-run`,
    );
  },
});
