#!/usr/bin/env -S deno run -A
import { clinfer, help, noCommand, subcommand, usage } from "../mod.ts";

@noCommand()
@usage("git branch [Options] [--] <branchname>")
@help("git-branch - List, create, or delete branches")
class Branch {
  @help("Delete a branch.")
  delete = false;
  _clinfer_parent?: ToolWithSubcommand;

  main(branchname: string) {
    console.log("main branch command", {
      gitDir: this._clinfer_parent?.gitDir,
      delete: this.delete,
      branchname,
    });
    return { branch: this, branchname };
  }
}

class ToolWithSubcommand {
  gitDir = ".";
  @subcommand()
  @help("List, create, or delete branches")
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

  main(opt: string) {
    console.log("main command", this, opt);
    return this;
  }
}

clinfer(ToolWithSubcommand, { dontPrintResult: true });

/*
$ ./git-subcommand.ts --help
Usage: <ToolWithSubcommand file> [Options] [--] [command [command args]]

Commands:
  main <opt>                                 [default]
  branch --help | [sub Options / cmd / args]
  commit --help | [sub Options / cmd / args]

Options:
 -h, --help    Show this help [default: false]
     --git-dir                  [default: "."]
     --commit       [default: [object Object]]

$ ./git-subcommand.ts branch --help
git-branch - List, create, or delete branches

Usage: git branch [Options] [--] <branchname>

Options:
 -h, --help   Show this help   [default: false]
     --delete Delete a branch. [default: false]
*/
