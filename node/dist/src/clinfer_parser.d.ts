import type { ClinferResult, ClinferRunConfig, Obj } from "./types.d.ts";
/**
 * Run the command of obj depending on the Deno/Node script arguments
 * @param objOrClass class or object to parse by clinfer (the class will be instanced)
 * @param config - of clinfer
 */
export declare function clinfer<O extends Obj>(
  objOrClass: O | {
    new (): O;
  },
  config?: ClinferRunConfig,
): Promise<unknown>;
/**
 * Return the parsing result of obj and the Deno/Node script arguments
 * @param objOrClass class or object to parse by clinfer (the class will be instanced)
 * @param config - of clinfer
 */
export declare function clinferParse<
  O extends Obj & {
    config?: string;
  },
>(
  objOrClass: O | {
    new (): O;
  },
  config?: ClinferRunConfig,
): Promise<ClinferResult<O>>;
