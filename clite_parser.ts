import {
  bold,
  gray,
  underline,
} from "https://deno.land/std@0.213.0/fmt/colors.ts";
import {
  toCamelCase,
  toKebabCase,
  toSnakeCase,
} from "https://deno.land/std@0.213.0/text/mod.ts";

const COMMENTS_REGEX = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENT_NAMES_REGEX = /\((?<args>.*?)\)/m;

// deno-lint-ignore no-explicit-any
export type Obj = { [index: string]: any };

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
  if (methods.length == 1) {
    return methods[0];
  } else {
    return (methods.includes("main") ? "main" : undefined);
  }
}

function boldUnder(str: string) {
  return bold(underline(str));
}

export function align(input: [string, string][]): string[] {
  const max: number = input.reduce(
    (prev, curr) => Math.max(prev, curr[0].trimEnd().length),
    0,
  );
  return input.map(([col1, col2]) =>
    `${col1.padEnd(max)}  ${col2 ?? ""}`.trimEnd()
  );
}

function genCommandHelp(obj: Obj, helpLines: string[]) {
  const allMethods = getMethodNames(obj);
  const methods = allMethods.filter((method) => !method.startsWith("_"));
  const defaultCommand = getDefaultMethod(methods);
  if (methods.length > 0) {
    helpLines.push(boldUnder(`\nCommand${methods.length > 1 ? "s" : ""}:`));
    const linesCols: [string, string][] = [];
    for (const method of methods) {
      let col1 = bold(`  ${method}`);
      let col2 = "";
      const args = getMethodArgNames(obj, method);
      if (args.length > 0) {
        col1 += " " + args.map((arg) => `<${arg}>`).join(" ");
      }
      const desc = obj[`_${method}_desc`] ?? "";
      if (desc) {
        col2 += gray(desc) + " ";
      }
      if (method === defaultCommand) {
        col2 += gray("(default)");
      }
      linesCols.push([col1, col2]);
    }
    helpLines.push(...align(linesCols));
  }
}

function genOptionsHelp(obj: Obj, helpLines: string[]) {
  const allFields = getFieldNames(obj);
  const fields = allFields.filter((method) => !method.startsWith("_"));
  helpLines.push(boldUnder(`\nOption${fields.length ? "s" : ""}:`));
  const linesCols: [string, string][] = [];
  for (const field of fields) {
    const col1 = bold(`  --${toKebabCase(field)}`) +
      gray(`=<${toSnakeCase(field).toUpperCase()}>`);
    let col2 = "";
    const desc = obj[`_${field}_desc`] ?? "";
    if (desc) {
      col2 += gray(desc) + " ";
    }
    const defaultValue = obj[field];
    if (defaultValue != undefined) {
      col2 += gray(`(default "${defaultValue}")`);
    }
    linesCols.push([col1, col2]);
  }
  linesCols.push([bold(`  --help`) + gray(""), gray("Show this help")]);
  helpLines.push(...align(linesCols));
}

export function genHelp(obj: Obj): string {
  const helpLines: string[] = [];
  if (obj._desc) {
    helpLines.push(obj._desc + "\n");
  }
  const usage = boldUnder("Usage:");
  const name = Object.getPrototypeOf(obj).constructor.name;
  helpLines.push(`${usage} <${name} file> [Options] [command [command args]]`);
  genCommandHelp(obj, helpLines);
  genOptionsHelp(obj, helpLines);
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

export type CliteRunConfig = {
  args?: string[]; // default : Deno.args
  dontPrintResult?: boolean; // default : false
};

function fillFields(parseResult: ParseResult, obj: Obj) {
  const fields = getFieldNames(obj);
  for (const option of getFieldNames(parseResult.options)) {
    if (fields.includes(option)) {
      obj[option] = parseResult.options[option];
    } else if (fields.includes(toSnakeCase(option))) {
      obj[toSnakeCase(option)] = parseResult.options[option];
    } else {
      throw new Error(`The option "${option}" doesn't exist`);
    }
  }
}

function processResult(result: unknown, config?: CliteRunConfig) {
  if (result != undefined && !config?.dontPrintResult) {
    Promise.resolve(result).then((res) => {
      if (res != undefined) {
        console.log(res);
      }
    });
  }
}

function runCommand(
  obj: Obj,
  command: string,
  cmdArgs: string[],
  config?: CliteRunConfig,
) {
  const result = obj[command](...cmdArgs);
  processResult(result, config);
  return result;
}

export function cliteRun(obj: Obj, config?: CliteRunConfig) {
  const parseResult = parseArgs(config?.args ?? Deno.args);
  if (getFieldNames(parseResult.options).includes("help")) {
    const help = genHelp(obj);
    console.log(help);
    return help;
  } else {
    const methods = getMethodNames(obj);
    const command = parseResult.command ?? getDefaultMethod(methods);
    if (!command) {
      throw new Error(`no method defined or no "main" method`);
    }
    if (!methods.includes(command)) {
      throw new Error(`The command "${command}" doesn't exist`);
    }
    fillFields(parseResult, obj);
    return runCommand(obj, command, parseResult.commandArgs, config);
  }
}
