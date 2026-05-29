import type { Metadata } from "./metadata.d.ts";
import type { ClinferRunConfig, Obj } from "./types.d.ts";
/**
 * Result of parseArgs()
 */
export type ParseResult = {
  options: {
    [index: string]:
      | string
      | boolean
      | number
      | undefined
      | (string | number)[];
  };
  command?: string;
  commandArgs: (string | number)[];
};
/**
 * parse config?.args, or Deno arguments (Deno.args) or node arguments (process.argv.slice(2))
 *
 * @param obj to analyse
 * @param metadata - clinfer metadata
 * @param config - to use to parse
 * @returns the parse result
 */
export declare function parseArgs<O extends Obj>(
  obj: O,
  metadata: Metadata<O>,
  config?: ClinferRunConfig,
): ParseResult;
export declare function fillFields<O extends Obj>(
  parseResult: ParseResult,
  obj: Obj,
  metadata: Metadata<O>,
  config?: ClinferRunConfig,
): void;
export declare function getArgs(config?: ClinferRunConfig): any;
export declare function convertCommandArg(
  v: string | number,
): string | number | boolean;
