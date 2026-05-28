import { assert, assertEquals, assertRejects } from "jsr:@std/assert@1.0.5";
import { cliFrom, cliFromParse } from "./clifrom_parser.ts";
import { help, hidden, noCommand, subcommand } from "./decorators.ts";
import { genHelp } from "./help.ts";
import { Tool } from "./test_data.test.ts";
import { getClifromMetadata } from "./metadata.ts";
import { stripAnsiCode } from "@std/fmt/colors";
import type { Obj } from "./types.ts";

Deno.test("cliFrom", async () => {
  const result = await cliFrom(new Tool(), {
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

Deno.test("cliFrom help", async () => {
  const result = await cliFrom(new Tool(), {
    args: ["--help"],
  });
  const tool = new Tool();
  const metadata = getClifromMetadata(tool);
  const expected = genHelp(tool, metadata);
  assertEquals(result, expected);
});

Deno.test("cliFromParse", async () => {
  const result = await cliFromParse(Tool, {
    args: ["--opt1=78", "down", "true"],
  });
  assertEquals(result.command, "down");
  assertEquals(result.commandArgs, [true]);
});

Deno.test({
  name: "subcommand",
  async fn() {
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
    const result = (await cliFrom(ToolWithSubcommand, {
      args: ["--git-dir=/tmp", "branch", "--delete", "foo"],
    })) as Obj;
    assertEquals(result.branch._clifrom_parent.gitDir, "/tmp");
    assertEquals(result.branch.delete, true);
    assertEquals(result.branchname, "foo");

    const result2 = (await cliFrom(ToolWithSubcommand, {
      args: ["--git-dir=/tmp", "commit", "--all", "--message", "bar"],
    })) as Obj;
    assertEquals(result2._clifrom_parent.gitDir, "/tmp");
    assertEquals(result2.all, true);
    assertEquals(result2.message, "bar");
  },
});

Deno.test({
  name: "boolean true",
  async fn() {
    class Tool {
      dryRun = true;
      main() {}
    }

    const result = await cliFromParse(Tool, {});
    assertEquals(result.obj.dryRun, true);
  },
});

Deno.test({
  name: "config file",
  async fn() {
    class ToolWithConfig {
      foo = "bar";
      b = true;
      dryRun = true;
      main() {}
    }

    const result = await cliFromParse(ToolWithConfig, {
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
  async fn() {
    class ToolWithConfig {
      foo = "bar";
      main() {}
    }

    const result = await cliFromParse(ToolWithConfig, {
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
    assertRejects(() =>
      cliFromParse(ToolWithConfig, {
        args: ["--config", "src/test-data/bad-config.json"],
        configCli: true,
      })
    );
  },
});

Deno.test({
  name: "bad config file wihout configCli",
  fn() {
    class ToolWithConfig {
      foo = "bar";
      main() {}
    }
    assertRejects(() =>
      cliFromParse(ToolWithConfig, {
        args: ["--config", "src/test-data/test-config.json"],
        configCli: false,
      })
    );
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
    assertRejects(() =>
      cliFrom(ToolWithConfig, { args: [], printHelpOnError: true })
    );
  },
});

Deno.test({
  name: "throws on cli-from ",
  fn() {
    class ToolWithConfig {
      main() {
        throw new Error("", { cause: { cliFrom: true } });
      }
    }
    assertRejects(() => cliFrom(ToolWithConfig, { args: [] }));
  },
});

Deno.test({
  name: "no method defined",
  fn() {
    class ToolWithoutCmd {}
    assertRejects(() => cliFrom(ToolWithoutCmd, { args: [] }));
  },
});

Deno.test({
  name: "The command doesn't exist",
  fn() {
    class ToolWithoutCmd {}
    assertRejects(() => cliFrom(ToolWithoutCmd, { args: ["foo"] }));
  },
});

Deno.test("cliFrom meta", async () => {
  const result = await cliFrom(new Tool(), {
    args: ["--help"],
    meta: { main: true, url: "./test.ts", resolve: () => "" },
  }) as string;
  assert(stripAnsiCode(result).includes("Usage: ./test.ts [Options]"));
});

Deno.test("dontConvertCmdArgs", async () => {
  const result = await cliFromParse(Tool, {
    args: ["--", "main", "123", "true", "foo"],
    dontConvertCmdArgs: true,
  });
  assertEquals(result.command, "main");
  assertEquals(result.commandArgs, ["123", "true", "foo"]);
  const result2 = await cliFromParse(Tool, {
    args: ["--", "main", "123", "true", "foo"],
  });
  assertEquals(result2.command, "main");
  assertEquals(result2.commandArgs, [123, true, "foo"]);
});

Deno.test("extends", async () => {
  class Tool {
    retry = 2;
    @help("no changes mode")
    dryRun = false;
    @hidden()
    webUrl = "none";
    main() {
      console.log("main command", this);
    }
    @help("create and start")
    up() {
    }
    down() {
    }
  }

  class Child extends Tool {
    @help("opt-from-child")
    optFromChild = 123;
    _up_hidden = true;
    @help("from-child")
    fromChild() {
    }
  }
  const child = new Child();
  const result = await cliFromParse(child, {});
  assertEquals(
    stripAnsiCode(result.help),
    `Usage: <script path> [Options] [--] [command [command args]]

Commands:
  main      [default]
  down
  fromChild from-child

Options:
 -h, --help           Show this help  [default: false]
     --retry                              [default: 2]
     --dry-run        no changes mode [default: false]
     --opt-from-child opt-from-child    [default: 123]`,
  );
});
