import { assertEquals, assertThrows } from "jsr:@std/assert@1.0.5";
import { cliteParse, cliteRun, noCommand, subcommand } from "./clite_parser.ts";
import { genHelp } from "./src/help.ts";
import { Tool } from "./src/test_data.test.ts";
import type { Obj } from "./src/parse_args.ts";
import { getCliteMetadata } from "./src/metadata.ts";

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

Deno.test({
  name: "subcommand",
  fn() {
    const result = cliteRun(ToolWithSubcommand, {
      args: ["--git-dir=/tmp", "branch", "--delete", "foo"],
    }) as Obj;
    assertEquals(result.branch._clite_parent.gitDir, "/tmp");
    assertEquals(result.branch.delete, true);
    assertEquals(result.branchname, "foo");
  },
});

Deno.test({
  name: "config file",
  fn() {
    class ToolWithConfig {
      foo = "bar";
      main() {}
    }

    const result = cliteParse(ToolWithConfig, {
      args: ["--config", "src/test-data/test-config.json"],
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
    // TODO check output
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
      // TODO check output
    });
  },
});

Deno.test({
  name: "no method defined",
  fn() {
    class ToolWithoutCmd {}
    assertThrows(() => {
      cliteRun(ToolWithoutCmd, { args: [] });
      // TODO check output
    });
  },
});
Deno.test({
  name: "The command doesn't exist",
  fn() {
    class ToolWithoutCmd {}
    assertThrows(() => {
      cliteRun(ToolWithoutCmd, { args: ["foo"] });
      // TODO check output
    });
  },
});
