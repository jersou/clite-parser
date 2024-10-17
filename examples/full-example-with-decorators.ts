#!/usr/bin/env -S deno -A
import {
  alias,
  cliteRun,
  defaultHelp,
  help,
  hidden,
  jsonConfig,
  negatable,
  subcommand,
  type,
  usage,
} from "../clite_parser.ts";

@help("This tool is an example of CliteParser")
@usage("Usage: full-example [Options] [command [command args]]")
@jsonConfig("Use json file or string to read the options")
class Tool {
  retry = 2;

  @help("no changes mode")
  @negatable("don't use dry run")
  @alias("n")
  dryRun = false;

  @alias("w")
  @alias("u")
  webUrl = "none";

  @type("object")
  @defaultHelp("empty object")
  foo = {};

  @hidden()
  hiddenField = 88;

  main() {
    console.log("main command", this);
  }

  @help("create and start")
  up() {
    console.log("up command", this);
  }

  @help("down")
  down(force: boolean, timeout: number) {
    console.log("down command", { force, timeout }, this);
    this._priv();
    this.#priv2();
  }

  @hidden()
  other() {
    console.log("this method is not visible in the help (use @hidden)");
  }

  _priv() {
    console.log("this method is not visible in the help (starts with '_')");
  }

  #priv2() {
    console.log("this method is not visible in the help (starts with '#')");
  }

  @subcommand()
  sub = SubCmd;
}

class SubCmd {
  _clite_parent?: Tool;
  @help("Sub option of subcmd")
  subOpt = 89;
  subCmd1(param1: string) {
    console.log("SubCmd > sub1 :", {
      retry: this._clite_parent?.retry,
      subOpt: this.subOpt,
      param1,
    });
  }
  subCmd2(param1: string, param2: string) {
    console.log("SubCmd > sub1 :", {
      retry: this._clite_parent?.retry,
      subOpt: this.subOpt,
      param1,
      param2,
    });
  }
}
if (import.meta.main) { // if the file is imported, do not execute this block
  cliteRun(Tool); // or cliteRun(new Tool());
}

/*
$ ./full-example-with-decorators.ts --help
This tool is an example of CliteParser

Usage: Usage: full-example [Options] [command [command args]]

Commands:
  main                                    [default]
  up                                      create and start
  down <force> <timeout>                  down
  sub --help | [sub Options / cmd / args]

Options:
     -h, --help       Show this help                      [default: false]
         --config     Use json file or string to read the options [string]
         --retry                                              [default: 2]
     -n, --dry-run    no changes mode                     [default: false]
         --no-dry-run don't use dry run
 -u, -w, --web-url                                       [default: "none"]
         --foo                                   [default: "empty object"]

$ ./full-example-with-decorators.ts sub subCmd2 AA BB
SubCmd > sub1 : { retry: 2, subOpt: 89, param1: "AA", param2: "BB" }

$ ./full-example-with-decorators.ts --retry 44 sub subCmd2 AA BB
SubCmd > sub1 : { retry: 44, subOpt: 89, param1: "AA", param2: "BB" }

$ ./full-example-with-decorators.ts --retry 44 down true 77
down command { force: true, timeout: 77 } Tool {
  retry: 44,
  dryRun: false,
  webUrl: "none",
  foo: {},
  hiddenField: 88,
  sub: [class SubCmd] {
    [Symbol(Symbol.metadata)]: [Object: null prototype] {
      clite: { help: { subOpt: "Sub option of subcmd" } }
    }
  },
  config: undefined
}
this method is not visible in the help (starts with '_')
this method is not visible in the help (starts with '#')

 */
