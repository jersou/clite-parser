import {
  bold,
  gray,
  underline,
} from "https://deno.land/std@0.212.0/fmt/colors.ts";
import {
  toCamelCase,
  toKebabCase,
  toSnakeCase,
} from "https://deno.land/std@0.212.0/text/mod.ts";

const COMMENTS_REGEX = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENT_NAMES_REGEX = /\((?<args>.*?)\)/m;

// deno-lint-ignore ban-types
export function getFunctionArgNames(func: Function): string[] {
  const fnStr = func.toString().replace(COMMENTS_REGEX, "");
  const argNames = ARGUMENT_NAMES_REGEX.exec(fnStr);
  return argNames?.[1].length && argNames?.[1]?.replace(/\s*=\s*[^,]+\s*/g, "")
        .split(",")
        .map((arg) => arg.replace(/[\s()]+/g, "")) || [];
}

export function getMethodNames(obj: object): string[] {
  return Object.getOwnPropertyNames(Object.getPrototypeOf(obj))
    .filter((n) => n !== "constructor");
}

export function getFieldNames(obj: object): string[] {
  return Object.getOwnPropertyNames(obj);
}

export function getMethodArgNames(obj: object, methodName: string): string[] {
  return getFunctionArgNames(Object.getPrototypeOf(obj)[methodName]);
}

function getDefaultMethod(methods: string[]) {
  return methods.length == 1
    ? methods[0]
    : (methods.includes("main") ? "main" : undefined);
}

function boldUnder(str: string) {
  return bold(underline(str));
}

// deno-lint-ignore no-explicit-any
export function genHelp(obj: { [index: string]: any }): string {
  const allMethods = getMethodNames(obj);
  const methods = allMethods.filter((method) => !method.startsWith("_"));
  const defaultCommand = getDefaultMethod(methods);
  const allFields = getFieldNames(obj);
  const fields = allFields.filter((method) => !method.startsWith("_"));
  const name = Object.getPrototypeOf(obj).constructor.name;
  const helpLines: string[] = [];
  if (obj._desc) {
    helpLines.push(obj._desc + "\n");
  }
  const usage = boldUnder("Usage:");
  helpLines.push(`${usage} <${name} file> [Options] [command [command args]]`);
  if (methods.length > 0) {
    helpLines.push(boldUnder(`\nCommand${methods.length > 1 ? "s" : ""}:`));
    for (const method of methods) {
      let line = bold(`  ${method}`);
      if (method === defaultCommand) {
        line += gray(" (default)");
      }
      const args = getMethodArgNames(obj, method);
      if (args.length > 0) {
        line += " " + args.map((arg) => `<${arg}>`).join(" ");
      }
      const desc = obj[`_${method}_desc`] ?? "";
      if (desc) {
        line += gray(`  ${desc}`);
      }
      helpLines.push(line);
    }
  }
  helpLines.push(boldUnder(`\nOption${fields.length ? "s" : ""}:`));
  for (const field of fields) {
    let fieldHelp = bold(`  --${toKebabCase(field)}`) +
      gray(`=<${toSnakeCase(field).toUpperCase()}>`);
    const desc = obj[`_${field}_desc`] ?? "";
    if (desc) {
      fieldHelp += gray(`  ${desc}`);
    }
    const defaultValue = obj[field];
    if (defaultValue != undefined) {
      fieldHelp += gray(` (default "${defaultValue}")`);
    }
    helpLines.push(fieldHelp);
  }
  helpLines.push(bold(`  --help`) + gray("  Show this help"));
  return helpLines.join("\n");
}

export type ParseResult = {
  options: { [index: string]: string | boolean };
  command?: string;
  commandArgs: string[];
};

export function parseArgs(args: string[]): ParseResult {
  const argsResult: ParseResult = {
    options: {},
    commandArgs: [],
  };
  for (const arg of args) {
    if (argsResult.command) {
      argsResult.commandArgs.push(arg);
    } else if (arg.startsWith("--")) {
      if (arg.includes("=")) {
        const [key, value] = arg.substring(2).split("=");
        argsResult.options[toCamelCase(key)] = value;
      } else {
        argsResult.options[toCamelCase(arg.substring(2))] = true;
      }
    } else {
      argsResult.command = arg;
    }
  }
  return argsResult;
}

// deno-lint-ignore no-explicit-any
export function cliteRun(obj: { [index: string]: any }, args?: string[]) {
  const parseResult = parseArgs(args ?? Deno.args);
  if (getFieldNames(parseResult.options).includes("help")) {
    const help = genHelp(obj);
    console.log(help);
    return help;
  } else {
    const methods = getMethodNames(obj);
    const fields = getFieldNames(obj);
    const command = parseResult.command ?? getDefaultMethod(methods);
    if (!command) {
      throw new Error(`no method defined or no "main" method`);
    }
    if (!methods.includes(command)) {
      throw new Error(`The command "${command}" doesn't exist`);
    }
    for (const option of getFieldNames(parseResult.options)) {
      if (fields.includes(option)) {
        obj[option] = parseResult.options[option];
      } else if (fields.includes(toSnakeCase(option))) {
        obj[toSnakeCase(option)] = parseResult.options[option];
      } else {
        throw new Error(`The option "${option}" doesn't exist`);
      }
    }
    const result = obj[command](...parseResult.commandArgs);
    if (
      result != undefined &&
      Deno.env.get("CLITE_RUN_DONT_PRINT_RESULT") !== "true"
    ) {
      console.log(result);
    }
    return result;
  }
}
