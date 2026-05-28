import type { ClifromResult, ClifromRunConfig, Obj } from "./types.d.ts";
/**
 * Run the command of obj depending on the Deno/Node script arguments
 * @param objOrClass class or object to parse by cli-from (the class will be instanced)
 * @param config - of cli-from
 */
export declare function cliFrom<O extends Obj>(
  objOrClass: O | {
    new (): O;
  },
  config?: ClifromRunConfig,
): Promise<unknown>;
/**
 * Return the parsing result of obj and the Deno/Node script arguments
 * @param objOrClass class or object to parse by cli-from (the class will be instanced)
 * @param config - of cli-from
 */
export declare function cliFromParse<
  O extends Obj & {
    config?: string;
  },
>(
  objOrClass: O | {
    new (): O;
  },
  config?: ClifromRunConfig,
): Promise<ClifromResult<O>>;
