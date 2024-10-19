import type { Metadata } from "./metadata.d.ts";
import type { CliteRunConfig, Obj } from "./types.d.ts";
export declare const boldUnder: (str: string) => any;
/**
 * Align the 2 columns
 *
 * @param input array of string pairs
 * @returns array of string of aligned pairs
 */
export declare function align(
  input: [string, string, string, string][],
): string[];
/**
 * Generate the CLI help of obj
 *
 * @param obj to analyse
 * @param metadata - clite metadata
 * @param config CliteRunConfig
 * @returns the help as string
 */
export declare function genHelp<O extends Obj>(
  obj: O,
  metadata: Metadata<O>,
  config?: CliteRunConfig,
): string;
