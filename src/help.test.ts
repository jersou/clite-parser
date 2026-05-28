import { assert, assertEquals } from "@std/assert";
import { stripAnsiCode } from "@std/fmt/colors";
import { align, genHelp } from "./help.ts";
import { Tool } from "./test_data.test.ts";
import {
  defaultHelp,
  help,
  hidden,
  jsonConfig,
  type,
  usage,
} from "./decorators.ts";
import { cliFromParse } from "./clifrom_parser.ts";
import { getClifromMetadata } from "./metadata.ts";

Deno.test("genHelp", () => {
  const tool = new Tool();
  const expected = `test data

Usage: <script path> [Options] [--] [command [command args]]

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
  const metadata = getClifromMetadata(tool);
  assertEquals(stripAnsiCode(genHelp(tool, metadata)), expected);
});

Deno.test("genHelp  noCommand", () => {
  const tool = new Tool();
  const expected = `test data

Usage: <script path> [Options] [--] 

Options:
 -h, --help           Show this help [default: false]
     --opt-1                           [default: 123]
     --opt-2                          [default: true]
     --opt-3          option 3 desc [default: "azer"]
     --opt-snake-case
     --opt-camel-case optCamelCase desc`;
  const metadata = getClifromMetadata(tool);
  assertEquals(
    stripAnsiCode(genHelp(tool, metadata, { noCommand: true })),
    expected,
  );
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
  const metadata = getClifromMetadata(tool);
  assertEquals(
    stripAnsiCode(genHelp(tool, metadata, { mainFile: "the_tool_file" })),
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
  async fn() {
    const result = await cliFromParse(ToolUsage, { args: ["--help"] });
    assert(result.help.includes(" new usage\n"));
  },
});

class Tool_Usage {
  _usage = "new usage";
}

Deno.test({
  name: "_usage",
  async fn() {
    const result = await cliFromParse(Tool_Usage, { args: ["--help"] });
    assert(result.help.includes(" new usage\n"));
  },
});

Deno.test({
  name: "@hidden method",
  async fn() {
    class ToolHiddenField {
      @hidden()
      foo() {}
      bar() {}
    }
    const result = await cliFromParse(ToolHiddenField, { args: ["--help"] });
    assert(!result.help.includes("foo"), "Help includes foo :\n" + result.help);
    assert(result.help.includes("bar"));
  },
});

Deno.test({
  name: "@hidden",
  async fn() {
    class ToolHiddenField {
      @hidden()
      foo = 12;
    }
    const result = await cliFromParse(ToolHiddenField, { args: ["--help"] });
    assert(!result.help.includes("foo"), "Help includes foo :\n" + result.help);
  },
});

Deno.test({
  name: "_hidden",
  async fn() {
    class Tool_HiddenField {
      _foo_hidden = true;
      foo = 12;
    }
    const result = await cliFromParse(Tool_HiddenField, { args: ["--help"] });
    assert(!result.help.includes("foo"), "Help includes foo :\n" + result.help);
  },
});

class Tool_Help {
  foo = 12;
  _foo_help = "foo help";
}
Deno.test({
  name: "_help",
  async fn() {
    const result = await cliFromParse(Tool_Help, { args: ["--help"] });
    assert(result.help.includes("foo help"));
  },
});

Deno.test({
  name: "config",
  async fn() {
    const result = await cliFromParse(Tool_Help, {
      args: ["--help"],
      configCli: true,
    });
    assert(
      result.help.includes(
        "Use this json file or string to read the options",
      ),
    );
  },
});

Deno.test({
  name: "config custom help",
  async fn() {
    const result = await cliFromParse(Tool_Help, {
      args: ["--help"],
      configCli: "custom config help",
    });
    assert(result.help.includes("custom config help"));
  },
});

Deno.test({
  name: "@jsonConfig custom help",
  async fn() {
    @jsonConfig("custom config help")
    class Tool_Help {
      foo = 12;
      main() {}
    }
    const result = await cliFromParse(Tool_Help);
    assert(result.help.includes("custom config help"));
  },
});

Deno.test({
  name: "@jsonConfig",
  async fn() {
    @jsonConfig()
    class Tool_Help {
      foo = 12;
      main() {}
    }
    const result = await cliFromParse(Tool_Help);
    assert(
      result.help.includes("Use this json file or string to read the options"),
    );
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
  async fn() {
    const result = await cliFromParse(Tool_Alias, { args: ["--help"] });
    assertEquals(
      stripAnsiCode(result.help),
      `Usage: <script path> [Options] [--] [command [command args]]

Options:
       -h, --help Show this help [default: false]
       -f, --foo                    [default: 12]
 -b, --ba, --bar                    [default: 45]`,
    );
  },
});

Deno.test({
  name: "@help",
  async fn() {
    class ToolHelp {
      @help("foo help")
      foo = 12;
      @type("string")
      unkStr?: string;
      @defaultHelp("default of unk")
      unk: unknown;
    }

    const result = await cliFromParse(ToolHelp, { args: ["--help"] });
    assertEquals(
      stripAnsiCode(result.help),
      `Usage: <script path> [Options] [--] [command [command args]]

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
  async fn() {
    class ToolHelp {
    }
    const result = await cliFromParse(ToolHelp, {
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
  async fn() {
    class ToolHelp {
    }
    const result = await cliFromParse(ToolHelp, {
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
  async fn() {
    class Tool {
      _dryRun_negatable = true;
      dryRun = true;
      main() {}
    }
    const res = await cliFromParse(Tool, { args: [] });
    assertEquals(
      stripAnsiCode(res.help),
      `Usage: <script path> [Options] [--] [command [command args]]

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
  async fn() {
    class Tool {
      _dryRun_negatable = "to cancel dry-run";
      dryRun = true;
      main() {}
    }
    const res = await cliFromParse(Tool, { args: [] });
    assertEquals(
      stripAnsiCode(res.help),
      `Usage: <script path> [Options] [--] [command [command args]]

Command:
  main [default]

Options:
 -h, --help       Show this help [default: false]
     --dry-run                    [default: true]
     --no-dry-run to cancel dry-run`,
    );
  },
});
