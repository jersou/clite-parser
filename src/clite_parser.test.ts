import { assert, assertEquals, assertThrows } from "jsr:@std/assert@1.0.5";
import { cliteParse, cliteRun } from "./clite_parser.ts";
import { help, hidden, noCommand, subcommand } from "./decorators.ts";
import { genHelp } from "./help.ts";
import { Tool } from "./test_data.test.ts";
import { getCliteMetadata } from "./metadata.ts";
import { stripAnsiCode } from "@std/fmt/colors";
import type { Obj } from "./types.ts";

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
  const tool = new Tool();
  const metadata = getCliteMetadata(tool);
  const expected = genHelp(tool, metadata);
  assertEquals(result, expected);
});

Deno.test("cliteParse", () => {
  const result = cliteParse(Tool, { args: ["--opt1=78", "down", "true"] });
  assertEquals(result.command, "down");
  assertEquals(result.commandArgs, [true]);
});

Deno.test({
  name: "subcommand",
  fn() {
    @noCommand()
    class Branch {
      delete = false;

      main(branchname: string) {
        console.log("main branch command", this, { branchname });
        return { branch: this, branchname };
      }
    }
    class ToolWithSubcommand {
      gitDir = ".";
      @subcommand()
      branch = Branch;

      @subcommand()
      commit = {
        _no_command: true,
        all: false,
        message: "",
        main() {
          console.log("main commit command", this);
          return this;
        },
      };

      main() {
        console.log("main command", this);
        return this;
      }
    }
    const result = cliteRun(ToolWithSubcommand, {
      args: ["--git-dir=/tmp", "branch", "--delete", "foo"],
    }) as Obj;
    assertEquals(result.branch._clite_parent.gitDir, "/tmp");
    assertEquals(result.branch.delete, true);
    assertEquals(result.branchname, "foo");

    const result2 = cliteRun(ToolWithSubcommand, {
      args: ["--git-dir=/tmp", "commit", "--all", "--message", "bar"],
    }) as Obj;
    assertEquals(result2._clite_parent.gitDir, "/tmp");
    assertEquals(result2.all, true);
    assertEquals(result2.message, "bar");
  },
});

Deno.test({
  name: "boolean true",
  fn() {
    class Tool {
      dryRun = true;
      main() {}
    }

    const result = cliteParse(Tool, {});
    assertEquals(result.obj.dryRun, true);
  },
});

Deno.test({
  name: "config file",
  fn() {
    class ToolWithConfig {
      foo = "bar";
      b = true;
      dryRun = true;
      main() {}
    }

    const result = cliteParse(ToolWithConfig, {
      args: ["--config", "src/test-data/test-config.json"],
      configCli: true,
    });
    assertEquals(result.obj.foo, "from-config");
    assertEquals(result.obj.dryRun, false);
    assertEquals(result.obj.b, true);
  },
});

Deno.test({
  name: "config json",
  fn() {
    class ToolWithConfig {
      foo = "bar";
      main() {}
    }

    const result = cliteParse(ToolWithConfig, {
      args: ["--config", `{"foo": "from-config"}`],
      configCli: true,
    });
    assertEquals(result.obj.foo, "from-config");
  },
});

Deno.test({
  name: "bad config file",
  fn() {
    class ToolWithConfig {
      foo = "bar";
      main() {}
    }
    assertThrows(() => {
      cliteParse(ToolWithConfig, {
        args: ["--config", "src/test-data/bad-config.json"],
        configCli: true,
      });
    });
  },
});

Deno.test({
  name: "bad config file wihout configCli",
  fn() {
    class ToolWithConfig {
      foo = "bar";
      main() {}
    }
    assertThrows(() => {
      cliteParse(ToolWithConfig, {
        args: ["--config", "src/test-data/test-config.json"],
        configCli: false,
      });
    });
  },
});

Deno.test({
  name: "throws on printHelpOnError",
  fn() {
    class ToolWithConfig {
      main() {
        throw new Error();
      }
    }
    assertThrows(() => {
      cliteRun(ToolWithConfig, {
        args: [],
        printHelpOnError: true,
      });
    });
  },
});

Deno.test({
  name: "throws on clite ",
  fn() {
    class ToolWithConfig {
      main() {
        throw new Error("", { cause: { clite: true } });
      }
    }
    assertThrows(() => {
      cliteRun(ToolWithConfig, { args: [] });
    });
  },
});

Deno.test({
  name: "no method defined",
  fn() {
    class ToolWithoutCmd {}
    assertThrows(() => {
      cliteRun(ToolWithoutCmd, { args: [] });
    });
  },
});

Deno.test({
  name: "The command doesn't exist",
  fn() {
    class ToolWithoutCmd {}
    assertThrows(() => {
      cliteRun(ToolWithoutCmd, { args: ["foo"] });
    });
  },
});

Deno.test("cliteRun meta", () => {
  const result = cliteRun(new Tool(), {
    args: ["--help"],
    meta: { main: true, url: "./test.ts", resolve: () => "" },
  }) as string;
  assert(stripAnsiCode(result).includes("Usage: ./test.ts [Options]"));
});

Deno.test("dontConvertCmdArgs", () => {
  const result = cliteParse(Tool, {
    args: ["--", "main", "123", "true", "foo"],
    dontConvertCmdArgs: true,
  });
  assertEquals(result.command, "main");
  assertEquals(result.commandArgs, ["123", "true", "foo"]);
  const result2 = cliteParse(Tool, {
    args: ["--", "main", "123", "true", "foo"],
  });
  assertEquals(result2.command, "main");
  assertEquals(result2.commandArgs, [123, true, "foo"]);
});

Deno.test("extends", () => {
  class Tool {
    retry = 2;
    @help("no changes mode") // optional description for "--dry-run" field
    dryRun = false; // fields are converted to kebab case as global options
    @hidden()
    webUrl = "none"; // → --web-url
    main() {
      console.log("main command", this);
    }
    @help("create and start") // optional description for "up" command
    up() {
    }
    down() {
    }
  }

  class Child extends Tool {
    optFromChild = 123;
    _up_hidden = true;
    fromChild() {
    }
  }
  const child = new Child();
  const result = cliteParse(child, {});
  assertEquals(
    stripAnsiCode(result.help),
    `Usage: <Child file> [Options] [--] [command [command args]]

Commands:
  main      [default]
  down
  fromChild

Options:
 -h, --help           Show this help  [default: false]
     --retry                              [default: 2]
     --dry-run        no changes mode [default: false]
     --opt-from-child                   [default: 123]`,
  );
});
