import type { Obj } from "./types.ts";

const COMMENTS_REGEX = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;
const ARGUMENT_NAMES_REGEX = /\((?<args>.*?)\)/m;

/**
 * @param func to analyse
 * @returns argument names of the func function
 */
// deno-lint-ignore ban-types
export function getFunctionArgNames(func: Function): string[] {
  const fnStr = func.toString().replace(COMMENTS_REGEX, "");
  const argNames = ARGUMENT_NAMES_REGEX.exec(fnStr);
  return (
    (argNames?.[1].length &&
      argNames?.[1]
        ?.replace(/\s*=\s*[^,]+\s*/g, "")
        .split(",")
        .map((arg) => arg.replace(/[\s()]+/g, ""))) ||
    []
  );
}

/**
 * @param obj Object to analyse
 * @returns method names of the object
 */
export function getMethodNames(obj: object): string[] {
  const prototype = Object.getPrototypeOf(obj);
  return prototype.constructor.name === "Object"
    ? Object.getOwnPropertyNames(obj)
      // @ts-ignore dyn
      .filter((n) => typeof obj[n] === "function")
    : Object.getOwnPropertyNames(prototype)
      .filter((n) => n !== "constructor");
}

/**
 * @param obj Object to analyse
 * @returns field names of the object
 */
export function getFieldNames<O extends Obj>(obj: O): (keyof O)[] {
  return Object.getOwnPropertyNames(obj)
    // @ts-ignore dyn
    .filter((n) => typeof obj[n] !== "function");
}

/**
 * @param obj Object to analyse
 * @param methodName method name to analyse
 * @returns arguments of methodName of obj
 */
export function getMethodArgNames(obj: object, methodName: string): string[] {
  const prototype = Object.getPrototypeOf(obj);
  if (prototype.constructor.name === "Object") {
    // @ts-ignore dyn
    return getFunctionArgNames(obj[methodName]);
  } else {
    return getFunctionArgNames(prototype[methodName]);
  }
}
