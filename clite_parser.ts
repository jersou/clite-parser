import {
  toCamelCase,
  toKebabCase,
  toSnakeCase,
} from "https://deno.land/std@0.212.0/text/mod.ts";

const COMMENTS_REGEX = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENT_NAMES_REGEX = /\((?<args>.*?)\)/m;
const ARGUMENT_NAME_REGEX = /([^\s,]+)/g;

// deno-lint-ignore ban-types
export function getFunctionArgNames(func: Function): string[] {
  const fnStr = func.toString().replace(COMMENTS_REGEX, "");
  const argNames = ARGUMENT_NAMES_REGEX.exec(fnStr)?.groups?.args;
  const result = argNames?.match(ARGUMENT_NAME_REGEX);
  return result ?? [];
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

// deno-lint-ignore no-explicit-any
export function genHelp(obj: { [index: string]: any }): string {
  const methods = getMethodNames(obj).filter((method) =>
    !method.startsWith("_")
  );
  const defaultCommand = getDefaultMethod(methods);
  const fields = getFieldNames(obj).filter((method) => !method.startsWith("_"));
  const toolName = Object.getPrototypeOf(obj).constructor.name;
  const helpLines: string[] = [];
  helpLines.push(`Usage: ${toolName} [Options] [command [command args]]`);
  if (methods.length > 0) {
    helpLines.push(`Command${methods.length > 1 ? "s" : ""}:`);
    for (const method of methods) {
      let line = `  ${method}`;
      if (method === defaultCommand) {
        line += " (default)";
      }
      const args = getMethodArgNames(obj, method);
      if (args.length > 0) {
        line += " " + args.map((arg) => `<${arg}>`).join(" ");
      }
      helpLines.push(line);
    }
  }
  if (fields.length > 0) {
    helpLines.push(`Option${fields.length > 1 ? "s" : ""}:`);
    for (const field of fields) {
      const defaultValue = obj[field];
      helpLines.push(
        defaultValue != undefined
          ? `  --${toKebabCase(field)}=<value>   (default "${defaultValue}")`
          : `  --${toKebabCase(field)}=<value>`,
      );
    }
  }
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
    command: undefined,
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
    return obj[command](...parseResult.commandArgs);
  }
}
