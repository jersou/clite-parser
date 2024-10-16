import type { Obj } from "./parse_args.ts";
import type { CliteRunConfig } from "../clite_parser.ts";
import type { CliteResult } from "../clite_parser.ts";

function processCommandResult(result: unknown, config?: CliteRunConfig) {
  if (result != undefined && !config?.dontPrintResult) {
    Promise.resolve(result)
      .then((res) => (res != undefined) && console.log(res));
  }
}

export function runCommand<O extends Obj>(res: CliteResult<O>) {
  if (res.command === "--help") {
    console.error(res.help);
    return res.help;
  } else if (res.subcommand) {
    return runCommand(res.subcommand);
  } else {
    const result = res.obj[res.command](...res.commandArgs);
    processCommandResult(result, res.config);
    return result;
  }
}
