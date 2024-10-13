import { assertEquals } from "jsr:@std/assert@1.0.5";
import { cliteParse, cliteRun, noCommand, subcommand } from "./clite_parser.ts";
import { genHelp } from "./src/help.ts";
import { Tool } from "./src/test_data.test.ts";
import type { Obj } from "./src/parse_args.ts";

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
