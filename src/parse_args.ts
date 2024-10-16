import { getMetadata } from "./decorators.ts";
import type { CliteRunConfig } from "../clite_parser.ts";
import { toCamelCase, toKebabCase, toSnakeCase } from "@std/text";
import { parseArgs as stdParseArgs } from "@std/cli";
import { getFieldNames } from "./reflect.ts";

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
 * Obj type
 */
// deno-lint-ignore no-explicit-any
export type Obj = Record<string, any>;

/**
 * parse config?.args, or Deno arguments (Deno.args) or node arguments (process.argv)
 *
 * @param obj to analyse
 * @param config - to use to parse
 * @param defaultMethod - to run if no arg
 * @returns the parse result
 */
export function parseArgs(
  obj: Obj,
  config?: CliteRunConfig,
  defaultMethod = "main",
): ParseResult {
  // TODO : refactor this function
  const argsResult: ParseResult = {
    options: {},
    commandArgs: [],
  };
  const args = getArgs(config);
  const stringProp: string[] = [];
  const arrayProp: string[] = [];
  const booleanProp: string[] = [];
  const alias: Record<string, string[]> = { help: ["h"] };
  const negatableMetadata = getMetadata(obj, "clite_negatables") ?? {};
  const negatable = Object.keys(negatableMetadata);

  for (const name of getFieldNames(obj).filter((n) => !n.startsWith("_"))) {
    alias[name] = [];
    const kebabCase = toKebabCase(name);
    if (name !== kebabCase) {
      alias[name].push(kebabCase);
    }

    switch (typeof obj[name]) {
      case "boolean":
        booleanProp.push(name);
        break;
      case "string":
        stringProp.push(name);
        break;
      case "object":
        if (Array.isArray(obj[name])) {
          arrayProp.push(name);
        }
    }
    if (obj[`_${name}_alias`]) {
      (alias[name] as string[]).push(...obj[`_${name}_alias`]);
    }
    if (obj[`_${name}_negatable`]) {
      negatable.push(name);
    }
  }
  // deno-lint-ignore no-explicit-any
  const aliasMetadata = getMetadata(obj, "clite_alias") as Record<string, any>;
  if (aliasMetadata) {
    for (const [prop, aliasName] of Object.entries(aliasMetadata)) {
      if (!alias[prop]) {
        alias[prop] = [];
      }
      alias[prop].push(...aliasName);
    }
  }

  const stdRes = stdParseArgs(args, {
    negatable: negatable.map(toKebabCase),
    string: stringProp.map(toKebabCase),
    boolean: booleanProp.map(toKebabCase),
    collect: arrayProp.map(toKebabCase),
    alias,
    stopEarly: true,
  });

  const fields = getFieldNames(obj);
  const fieldsKebabCase = fields.map(toKebabCase);
  const aliasKey = Object.values(alias).flat();
  const noCommandMetadata = getMetadata(obj, "clite_noCommand") as Obj;
  const noCommand = !!noCommandMetadata || obj._no_command;

  for (const [key, value] of Object.entries(stdRes)) {
    if (key === "_") {
      if (config?.noCommand || noCommand) {
        argsResult.command = defaultMethod;
        argsResult.commandArgs = stdRes._;
      } else if (stdRes._.length > 0) {
        argsResult.command = stdRes._[0].toString();
        argsResult.commandArgs = stdRes._.slice(1);
      }
    } else {
      if (
        key !== "help" && !fieldsKebabCase.includes(key) &&
        !fields.includes(key) && !aliasKey.includes(key) &&
        (!config?.configCli && key === "config")
      ) {
        throw new Error(`The option "${key}" doesn't exist`, {
          cause: { clite: true },
        });
      }
      argsResult.options[toCamelCase(key)] = value;
    }
  }
  return argsResult;
}

export function fillFields(parseResult: ParseResult, obj: Obj) {
  // deno-lint-ignore no-explicit-any
  const aliasMetadata = getMetadata(obj, "clite_alias") as Record<string, any>;
  const aliasNames = aliasMetadata ? Object.values(aliasMetadata).flat() : [];
  const fields = getFieldNames(obj) as string[];
  const publicFields = fields.filter(
    (f) => !f.startsWith("_") && !f.startsWith("#"),
  );
  for (const field of publicFields) {
    if (obj[`_${field}_alias`]) {
      aliasNames.push(...obj[`_${field}_alias`]);
    }
  }

  for (const option of (getFieldNames(parseResult.options) as string[])) {
    if (fields.includes(option)) {
      obj[option] = parseResult.options[option];
    } else if (fields.includes(toSnakeCase(option))) {
      obj[toSnakeCase(option)] = parseResult.options[option];
    } else {
      if (!aliasNames.includes(option)) {
        throw new Error(`The option "${option}" doesn't exist`, {
          cause: { clite: true },
        });
      }
    }
  }
}

// use globalThis instead of Deno/process to be compatible with Node & Deno
export function getArgs(config?: CliteRunConfig) {
  if (config?.args) {
    return config?.args;
    // deno-lint-ignore no-explicit-any
  } else if ((globalThis as any)["Deno"]?.args) {
    // deno-lint-ignore no-explicit-any
    return (globalThis as any)["Deno"]?.args;
    // deno-lint-ignore no-explicit-any
  } else if ((globalThis as any)["process"]) {
    // deno-lint-ignore no-explicit-any
    return (globalThis as any)["process"].argv.slice(2);
  } else {
    return [];
  }
}

export function convertCommandArg(v: string | number) {
  if (typeof v === "string") {
    if (v === "true") {
      return true;
    } else if (v === "false") {
      return false;
    } else {
      if (!isNaN(v as unknown as number) && !isNaN(parseFloat(v))) {
        return parseFloat(v);
      }
    }
  }
  return v;
}
