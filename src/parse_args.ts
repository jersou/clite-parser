import type { CliteRunConfig } from "../clite_parser.ts";
import { toCamelCase, toKebabCase, toSnakeCase } from "@std/text";
import { parseArgs as stdParseArgs } from "@std/cli";
import { getFieldNames } from "./reflect.ts";
import type { Metadata } from "./metadata.ts";

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
 * @param metadata - clite metadata
 * @param config - to use to parse
 * @returns the parse result
 */
export function parseArgs<O extends Obj>(
  obj: O,
  metadata: Metadata<O>,
  config?: CliteRunConfig,
): ParseResult {
  const argsResult: ParseResult = {
    options: {},
    commandArgs: [],
  };
  const args = getArgs(config);
  const stringProp: string[] = [];
  const arrayProp: string[] = [];
  const booleanProp: string[] = [];
  const alias: Record<string, string[]> = { help: ["h"] };
  const negatable = Object.entries(metadata.fields)
    .filter(([, v]) => v?.negatable)
    .map(([k]) => k);

  for (const name of Object.keys(metadata.fields)) {
    alias[name] = metadata.fields[name]?.alias ?? [];
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
  }

  const stdRes = stdParseArgs(args, {
    negatable: negatable.map(toKebabCase),
    string: stringProp.map(toKebabCase),
    boolean: booleanProp.map(toKebabCase),
    collect: arrayProp.map(toKebabCase),
    alias,
    stopEarly: true,
  });

  const fields = Object.keys(metadata.fields);
  const fieldsKebabCase = fields.map(toKebabCase);
  const aliasKey = Object.values(alias).flat();

  for (const [key, value] of Object.entries(stdRes)) {
    if (key === "_") {
      if (config?.noCommand || !!metadata.noCommand) {
        argsResult.command = metadata.defaultCommand ?? "main";
        argsResult.commandArgs = stdRes._;
      } else if (stdRes._.length > 0) {
        argsResult.command = stdRes._[0].toString();
        argsResult.commandArgs = stdRes._.slice(1);
      }
    } else {
      if (
        key !== "help" && !fieldsKebabCase.includes(key) &&
        !fields.includes(key) && !aliasKey.includes(key) &&
        (!(config?.configCli || metadata.jsonConfig) && key === "config")
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

export function fillFields<O extends Obj>(
  parseResult: ParseResult,
  obj: Obj,
  metadata: Metadata<O>,
  config?: CliteRunConfig,
) {
  const aliasNames = Object.entries(metadata.fields)
    .flatMap(([, v]) => v?.alias);
  const fields = Object.keys(metadata.fields);
  for (const option of (getFieldNames(parseResult.options) as string[])) {
    if (fields.includes(option)) {
      obj[option] = parseResult.options[option];
    } else if (fields.includes(toSnakeCase(option))) {
      obj[toSnakeCase(option)] = parseResult.options[option];
    } else if (
      !aliasNames.includes(option) &&
      (option !== "config" || !(config?.configCli || metadata.jsonConfig))
    ) {
      throw new Error(`The option "${option}" doesn't exist`, {
        cause: { clite: true },
      });
    }
  }
}

// use globalThis instead of Deno/process to be compatible with Node & Deno
export function getArgs(config?: CliteRunConfig) {
  // deno-lint-ignore no-explicit-any
  const gt = globalThis as any;
  return config?.args || gt["Deno"]?.args || gt["process"]?.argv.slice(2) || [];
}

export function convertCommandArg(v: string | number) {
  switch (true) {
    case v === "true":
      return true;
    case v === "false":
      return false;
    case typeof v === "string" &&
      !isNaN(v as unknown as number) &&
      !isNaN(parseFloat(v)):
      return parseFloat(v);
    default:
      return v;
  }
}
