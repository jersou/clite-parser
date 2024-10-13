#!/usr/bin/env -S deno run -A
// import {noCommand, subcommand} from "../src/decorators.ts";
import {
  cliteRun,
  help,
  noCommand,
  subcommand,
  usage,
} from "../clite_parser.ts";

@noCommand()
@usage("git branch  [Options] [--] <branchname>")
@help("git-branch - List, create, or delete branches")
class Branch {
  @help("Delete a branch.")
  delete = false;
  _clite_parent?: ToolWithSubcommand;

  main(branchname: string) {
    console.log("main branch command", {
      gitDir: this._clite_parent?.gitDir,
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

  main() {
    console.log("main command", this);
    return this;
  }
}

cliteRun(ToolWithSubcommand, { dontPrintResult: true });
