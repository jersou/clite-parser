import type { Obj } from "./types.d.ts";
/**
 * @param func to analyse
 * @returns argument names of the func function
 */
export declare function getFunctionArgNames(func: Function): string[];
/**
 * @param obj Object to analyse
 * @returns method names of the object
 */
export declare function getMethodNames(obj: object): string[];
/**
 * @param obj Object to analyse
 * @returns method names of the object and inherited class
 */
export declare function getMethodNamesDeep(obj: object): string[];
/**
 * @param obj Object to analyse
 * @returns field names of the object
 */
export declare function getFieldNames<O extends Obj>(obj: O): (keyof O)[];
/**
 * @param obj Object to analyse
 * @param methodName method name to analyse
 * @returns arguments of methodName of obj
 */
export declare function getMethodArgNames(
  obj: object,
  methodName: string,
): string[];
