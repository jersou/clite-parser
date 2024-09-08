import { bold, gray, underline } from "@std/fmt/colors";
import { toCamelCase, toKebabCase, toSnakeCase } from "@std/text";

/**
 * Obj type
 */
// deno-lint-ignore no-explicit-any
export type Obj = { [index: string]: any };

const COMMENTS_REGEX = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENT_NAMES_REGEX = /\((?<args>.*?)\)/m;

/**
 * @param func to analyse
 * @returns argument names of the func function
 */
// deno-lint-ignore ban-types
export function getFunctionArgNames(func: Function): string[] {
  const fnStr = func.toString().replace(COMMENTS_REGEX, "");
  const argNames = ARGUMENT_NAMES_REGEX.exec(fnStr);
  return argNames?.[1].length && argNames?.[1]?.replace(/\s*=\s*[^,]+\s*/g, "")
        .split(",")
        .map((arg) => arg.replace(/[\s()]+/g, "")) || [];
}

/**
 * @param obj Object to analyse
 * @returns method names of the object
 */
export function getMethodNames(obj: object): string[] {
  return Object.getOwnPropertyNames(Object.getPrototypeOf(obj))
    .filter((n) => n !== "constructor");
}

/**
 * @param obj Object to analyse
 * @returns field names of the object
 */
export function getFieldNames(obj: object): string[] {
  return Object.getOwnPropertyNames(obj);
}

/**
 * @param obj Object to analyse
 * @param methodName method name to analyse
 * @returns arguments of methodName of obj
 */
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

/**
 * Align the 2 columns
 *
 * @param input array of string pairs
 * @returns array of string of aligned pairs
 */
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

/**
 * Generate the CLI help of obj
 *
 * @param obj to analyse
 * @param config CliteRunConfig
 * @returns the help as string
 */
export function genHelp(obj: Obj, config?: CliteRunConfig): string {
  const helpLines: string[] = [];
  if (obj._desc) {
    helpLines.push(obj._desc + "\n");
  }
  const usage = boldUnder("Usage:");
  const name = Object.getPrototypeOf(obj).constructor.name;
  if (config?.noCommand) {
    helpLines.push(`${usage} <${name} file> [Options] [args]`);
  } else {
    helpLines.push(
      `${usage} <${name} file> [Options] [command [command args]]`,
    );
    genCommandHelp(obj, helpLines);
  }
  genOptionsHelp(obj, helpLines);
  return helpLines.join("\n");
}

/**
 * Result of parseArgs()
 */
export type ParseResult = {
  options: { [index: string]: string | boolean };
  command?: string;
  commandArgs: string[];
};

/**
 * parse config?.args, or Deno arguments (Deno.args) or node arguments (process.argv)
 *
 * @param config - to use to parse
 * @param defaultMethod - to run if no arg
 * @returns the parse result
 */
export function parseArgs(
  config?: CliteRunConfig,
  defaultMethod = "main",
): ParseResult {
  const args = getArgs(config);
  const argsResult: ParseResult = {
    options: {},
    commandArgs: [],
  };
  for (const arg of args) {
    if (argsResult.command) {
      argsResult.commandArgs.push(arg);
    } else if (arg.startsWith("--")) {
      if (arg.includes("=")) {
        const [key, value] = /^--([^=]+)=(.*)$/.exec(arg)!.slice(1);
        argsResult.options[toCamelCase(key)] = value;
      } else {
        argsResult.options[toCamelCase(arg.substring(2))] = true;
      }
    } else if (config?.noCommand) {
      argsResult.command = defaultMethod;
      argsResult.commandArgs.push(arg);
    } else {
      argsResult.command = arg;
    }
  }
  return argsResult;
}

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

/**
 * CliteRunConfig
 */
export type CliteRunConfig = {
  /**
   * default : Deno.args or process.argv.slice(2)
   */
  args?: string[];
  /**
   * default : false, print the command return
   */
  dontPrintResult?: boolean;
  /**
   * no default command : do not run "main" methode if no arg
   */
  noCommand?: boolean;
};

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

// use globalThis instead of Deno/process to be compatible with Node & Deno
function getArgs(config?: CliteRunConfig) {
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

/**
 * Run the command of obj depending on the Deno/Node script arguments
 * @param obj instance of the object to parse by clite-parser
 * @param config - of clite-parser
 */
export function cliteRun(obj: Obj, config?: CliteRunConfig): unknown {
  const methods = getMethodNames(obj);
  const defaultMethod = getDefaultMethod(methods);
  const parseResult = parseArgs(config, defaultMethod);
  if (getFieldNames(parseResult.options).includes("help")) {
    const help = genHelp(obj, config);
    console.log(help);
    return help;
  } else {
    const command = parseResult.command ?? defaultMethod;
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
