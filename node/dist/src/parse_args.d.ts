import type { Metadata } from "./metadata.d.ts";
import type { ClifromRunConfig, Obj } from "./types.d.ts";
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
 * parse config?.args, or Deno arguments (Deno.args) or node arguments (process.argv)
 *
 * @param obj to analyse
 * @param metadata - cli-from metadata
 * @param config - to use to parse
 * @returns the parse result
 */
export declare function parseArgs<O extends Obj>(
  obj: O,
  metadata: Metadata<O>,
  config?: ClifromRunConfig,
): ParseResult;
export declare function fillFields<O extends Obj>(
  parseResult: ParseResult,
  obj: Obj,
  metadata: Metadata<O>,
  config?: ClifromRunConfig,
): void;
export declare function getArgs(config?: ClifromRunConfig): any;
export declare function convertCommandArg(
  v: string | number,
): string | number | boolean;
