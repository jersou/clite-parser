import type { CliteResult, CliteRunConfig, Obj } from "./types.d.ts";
/**
 * Run the command of obj depending on the Deno/Node script arguments
 * @param objOrClass class or object to parse by clite-parser (the class will be instanced)
 * @param config - of clite-parser
 */
export declare function cliteRun<O extends Obj>(
  objOrClass: O | {
    new (): O;
  },
  config?: CliteRunConfig,
): unknown;
/**
 * Return the parsing result of obj and the Deno/Node script arguments
 * @param objOrClass class or object to parse by clite-parser (the class will be instanced)
 * @param config - of clite-parser
 */
export declare function cliteParse<
  O extends Obj & {
    config?: string;
  },
>(
  objOrClass: O | {
    new (): O;
  },
  config?: CliteRunConfig,
): CliteResult<O>;
