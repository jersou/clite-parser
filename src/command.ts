import type { ClinferResult, ClinferRunConfig, Obj } from "./types.ts";

function processCommandResult(result: unknown, config?: ClinferRunConfig) {
  if (result != undefined && !config?.dontPrintResult) {
    Promise.resolve(result)
      .then((res) => (res != undefined) && console.log(res));
  }
}

export function runCommand<O extends Obj>(res: ClinferResult<O>) {
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
