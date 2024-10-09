import type { Obj } from "./parse_args.ts";
import type { CliteRunConfig } from "../clite_parser.ts";

function processCommandResult(result: unknown, config?: CliteRunConfig) {
  if (result != undefined && !config?.dontPrintResult) {
    Promise.resolve(result).then((res) => {
      if (res != undefined) {
        console.log(res);
      }
    });
  }
}

export function runCommand(
  obj: Obj,
  command: string,
  cmdArgs: (string | number)[],
  config?: CliteRunConfig,
) {
  const result = obj[command](...cmdArgs);
  processCommandResult(result, config);
  return result;
}
