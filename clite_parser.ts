import { bgRed, bold, gray, underline } from "jsr:@std/fmt@1.0.2/colors";
import { toCamelCase, toKebabCase, toSnakeCase } from "jsr:@std/text@1.0.6";
import { parseArgs as stdParseArgs } from "jsr:@std/cli@1.0.6/parse-args";

// TODO split this file
// TODO @negatable

/**
 * Obj type
 */
// deno-lint-ignore no-explicit-any
export type Obj = { [index: string]: any };

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
  if (prototype.constructor.name === "Object") {
    return (
      Object.getOwnPropertyNames(obj)
        // @ts-ignore dyn
        .filter((n) => typeof obj[n] === "function")
    );
  } else {
    return Object.getOwnPropertyNames(prototype).filter(
      (n) => n !== "constructor",
    );
  }
}

/**
 * @param obj Object to analyse
 * @returns field names of the object
 */
export function getFieldNames(obj: object): string[] {
  return (
    Object.getOwnPropertyNames(obj)
      // @ts-ignore dyn
      .filter((n) => typeof obj[n] !== "function")
  );
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

function getDefaultMethod(methods: string[]) {
  if (methods.length == 1) {
    return methods[0];
  } else {
    return methods.includes("main") ? "main" : undefined;
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
export function align(input: [string, string, string, string][]): string[] {
  const maxCol0 = input.reduce((prev, cur) => Math.max(prev, cur[0].length), 0);
  const maxCol1 = input.reduce((prev, cur) => Math.max(prev, cur[1].length), 0);
  const maxCol23 = input.reduce(
    (prev, cur) => Math.max(prev, cur[2].length + cur[3].length),
    0,
  ) + 1;
  return input.map(([col0, col1, col2, col3]) =>
    `${col0.padStart(maxCol0)}${col1.padEnd(maxCol1)} ${
      col2.padEnd(maxCol23 - col3.length) ?? ""
    }${col3 ?? ""}`.trimEnd()
  );
}

function genCommandHelp(obj: Obj, helpLines: string[]) {
  const allMethods = getMethodNames(obj);
  const methods = allMethods.filter((method) => !method.startsWith("_"));
  const defaultCommand = getDefaultMethod(methods);
  const helpMetadata = getMetadata(obj, "clite_help");
  if (methods.length > 0) {
    helpLines.push(boldUnder(`\nCommand${methods.length > 1 ? "s" : ""}:`));
    const linesCols: [string, string, string, string][] = [];
    for (const method of methods) {
      let col1 = bold(`  ${method}`);
      const args = getMethodArgNames(obj, method);
      if (args.length > 0) {
        col1 += " " + args.map((arg) => `<${arg}>`).join(" ");
      }
      let col2 = helpMetadata?.[method] ??
        obj[`_${method}_help`] ??
        obj[`_${method}_desc`] ??
        "";

      if (method === defaultCommand) {
        col2 += col2.length ? " " : "";
        col2 += bold("[default]");
      }

      const col3 = "";
      linesCols.push(["", col1, col2, col3]);
    }
    helpLines.push(...align(linesCols));
  }
}

// deno-lint-ignore no-explicit-any
type MetadataMap = Record<string, any>;

function genOptionsHelp(obj: Obj, helpLines: string[]) {
  const helpMetadata = getMetadata(obj, "clite_help");
  const aliasMetadata = getMetadata(obj, "clite_alias") as MetadataMap;
  const typesMetadata = getMetadata(obj, "clite_types") as MetadataMap;
  const defaultMetadata = getMetadata(obj, "clite_defaults") as MetadataMap;
  const negatableMetadata = getMetadata(obj, "clite_negatables") as MetadataMap;
  const negatables = Object.keys(negatableMetadata ?? {});
  const allFields = getFieldNames(obj);
  const fields = allFields.filter((method) => !method.startsWith("_"));
  helpLines.push(boldUnder(`\nOption${fields.length ? "s" : ""}:`));
  const linesCols: [string, string, string, string][] = [];
  linesCols.push([
    bold(` -h,`),
    bold(` --help`),
    "Show this help",
    gray("[default: false]"),
  ]);
  for (const field of fields) {
    const alias: string[] = aliasMetadata?.[field] || [];
    if (obj[`_${name}_alias`]) {
      alias.push(...obj[`_${name}_alias`]);
    }

    const aliasHelp = (Array.isArray(alias) ? alias : [alias])
      .map((a) => (a.length === 1 ? `-${a},` : `--${toKebabCase(a)},`))
      .join(" ");

    const col0 = bold(` ${aliasHelp}`);
    const col1 = bold(` --${toKebabCase(field)}`);
    let col2 = "";
    let col3 = "";
    const desc = helpMetadata?.[field] ??
      obj[`_${field}_help`] ??
      obj[`_${field}_desc`] ??
      "";
    if (desc) {
      col2 += desc;
    }
    const defaultValue = defaultMetadata?.[field] ?? obj[field];
    if (defaultValue != undefined) {
      const defaultHelp = typeof defaultValue === "string"
        ? `"${defaultValue}"`
        : defaultValue;
      col3 = gray(`[default: ${defaultHelp}]`);
    } else {
      const type = typesMetadata?.[field] ?? obj[`_${field}_type`];
      if (type) {
        col3 = gray(`[${type}]`);
      }
    }
    linesCols.push([col0, col1, col2, col3]);
    // TODO refactor
    if (negatables.includes(field)) {
      linesCols.push([
        bold(" "),
        bold(` --${toKebabCase("no_" + field)}`),
        negatableMetadata?.[field] ?? "",
        "",
      ]);
    } else if (obj[`_${field}_negatable`]) {
      linesCols.push([
        bold(" "),
        bold(` --${toKebabCase("no_" + field)}`),
        typeof obj[`_${field}_negatable`] === "string"
          ? obj[`_${field}_negatable`]
          : "",
        "",
      ]);
    }
  }
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
  const helpMetadata = getMetadata(obj, "clite_help");
  const objHelp = helpMetadata?.[Object.getPrototypeOf(obj).constructor.name] ??
    obj._help ??
    obj._desc;
  if (objHelp) {
    helpLines.push(objHelp + "\n");
  }
  const usage = boldUnder("Usage:");
  const name = Object.getPrototypeOf(obj).constructor.name;
  const mainFile = config?.mainFile ??
    config?.meta?.url?.replace(/.*\//, "./") ??
    `<${name} file>`;
  if (config?.noCommand) {
    helpLines.push(`${usage} ${mainFile} [Options] [args]`);
  } else {
    helpLines.push(`${usage} ${mainFile} [Options] [command [command args]]`);
    genCommandHelp(obj, helpLines);
  }
  genOptionsHelp(obj, helpLines);
  return helpLines.join("\n");
}

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
  const argsResult: ParseResult = {
    options: {},
    commandArgs: [],
  };
  const args = getArgs(config);
  const stringProp: string[] = [];
  const arrayProp: string[] = [];
  const booleanProp: string[] = [];
  const alias: Record<string, string[]> = { help: ["h"] };
  for (const name of getFieldNames(obj)) {
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
      if (!alias[name]) {
        alias[name] = [];
      }
      (alias[name] as string[]).push(obj[`_${name}_alias`]);
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
  const negatableMetadata = getMetadata(obj, "clite_negatables") ?? {};

  const stdRes = stdParseArgs(args, {
    negatable: Object.keys(negatableMetadata),
    string: stringProp,
    boolean: booleanProp,
    collect: arrayProp,
    alias,
  });
  for (const [key, value] of Object.entries(stdRes)) {
    if (key === "_") {
      if (config?.noCommand) {
        argsResult.command = defaultMethod;
        argsResult.commandArgs = stdRes._;
      } else if (stdRes._.length > 0) {
        argsResult.command = stdRes._[0].toString();
        argsResult.commandArgs = stdRes._.slice(1);
      }
    } else {
      argsResult.options[toCamelCase(key)] = value;
    }
  }
  return argsResult;
}

function fillFields(parseResult: ParseResult, obj: Obj) {
  // deno-lint-ignore no-explicit-any
  const aliasMetadata = getMetadata(obj, "clite_alias") as Record<string, any>;
  const aliasNames = aliasMetadata ? Object.values(aliasMetadata).flat() : [];
  const fields = getFieldNames(obj);
  const publicFields = fields.filter(
    (f) => !f.startsWith("_") && !f.startsWith("#"),
  );
  for (const field of publicFields) {
    if (obj[`_${field}_alias`]) {
      aliasNames.push(...obj[`_${field}_alias`]);
    }
  }

  for (const option of getFieldNames(parseResult.options)) {
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
   * no default command : do not run "main" method if no arg
   */
  noCommand?: boolean;
  /**
   * print the help if an error is thrown and then re-throw the error
   */
  printHelpOnError?: boolean;
  /**
   * allows to change the name of the file in the help, instead of the default <{Class name} file>
   */
  mainFile?: string;
  /**
   * import.meta to use : don't run if the file is imported, and use the basename of import.meta.url in the help
   */
  meta?: ImportMeta;
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
  cmdArgs: (string | number)[],
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

// from decorator with experimentalDecorators = false or true
// deno-lint-ignore no-explicit-any
function addMetadata(target: any, prop: any, key: string, val: any) {
  let metadata;
  let propName;
  if (prop.addInitializer) {
    // experimentalDecorators = false
    metadata = prop.metadata;
    propName = prop.name;
  } else {
    // experimentalDecorators = true
    if (!target.constructor[Symbol.metadata]) {
      target.constructor[Symbol.metadata] = {};
    }
    metadata = target.constructor[Symbol.metadata];
    propName = prop;
  }
  if (!metadata[key]) {
    metadata[key] = {};
  }
  if (Object.hasOwn(metadata[key], propName)) {
    if (!Array.isArray(metadata[key][propName])) {
      metadata[key][propName] = [metadata[key][propName]];
    }
    metadata[key][propName].push(val);
  } else {
    metadata[key][propName] = val;
  }
}

// deno-lint-ignore no-explicit-any
function getMetadata(obj: any, key: string) {
  return Object.getPrototypeOf(obj).constructor[Symbol.metadata]?.[key];
}

/**
 * decorator on classes/methods/properties : `@help("description...")`
 * @param description - to display in the help
 */
// deno-lint-ignore no-explicit-any
export function help(description: string): any {
  // deno-lint-ignore no-explicit-any
  return function (target: any, prop?: any) {
    addMetadata(target, prop, "clite_help", description);
  };
}

/**
 * decorator on properties : `@alias("p")`
 * @param alias - to use as short alias
 */
// deno-lint-ignore no-explicit-any
export function alias(alias: string): any {
  // deno-lint-ignore no-explicit-any
  return function (target: any, prop?: any) {
    addMetadata(target, prop, "clite_alias", alias);
  };
}

/**
 * decorator on properties : `@type("string")`
 * @param typeHelp - to add to the help
 */
// deno-lint-ignore no-explicit-any
export function type(typeHelp: string): any {
  // deno-lint-ignore no-explicit-any
  return function (target: any, prop?: any) {
    addMetadata(target, prop, "clite_types", typeHelp);
  };
}

/**
 * decorator on properties : `@default("default in help")`
 * @param defaultHelp - to add to the help
 */
// deno-lint-ignore no-explicit-any
export function defaultHelp(defaultHelp: string): any {
  // deno-lint-ignore no-explicit-any
  return function (target: any, prop?: any) {
    addMetadata(target, prop, "clite_defaults", defaultHelp);
  };
}

/**
 * decorator on properties : `@negatable` on boolean, negated by prefixing it with --no-
 * @param help - to add to the help (optional)
 */
// deno-lint-ignore no-explicit-any
export function negatable(help?: string): any {
  // deno-lint-ignore no-explicit-any
  return function (target: any, prop?: any) {
    addMetadata(target, prop, "clite_negatables", help);
  };
}

/**
 * Run the command of obj depending on the Deno/Node script arguments
 * @param obj instance of the object to parse by clite-parser
 * @param config - of clite-parser
 */
export function cliteRun(obj: Obj, config?: CliteRunConfig): unknown {
  if (!config?.meta || config?.meta.main) {
    const help = genHelp(obj, config);
    try {
      const methods = getMethodNames(obj);
      const defaultMethod = getDefaultMethod(methods);
      const parseResult = parseArgs(obj, config, defaultMethod);
      if (getFieldNames(parseResult.options).includes("help")) {
        console.error(help);
        return help;
      } else {
        const command = parseResult.command ?? defaultMethod;
        if (!command) {
          throw new Error(`no method defined or no "main" method`, {
            cause: { clite: true },
          });
        }
        if (!methods.includes(command)) {
          throw new Error(`The command "${command}" doesn't exist`, {
            cause: { clite: true },
          });
        }
        fillFields(parseResult, obj);
        return runCommand(obj, command, parseResult.commandArgs, config);
      }
    } catch (e) {
      if (e.cause?.clite || config?.printHelpOnError) {
        console.error(bgRed(bold("An error occurred ! The help :")));
        console.error(help);
        console.error();
        console.error(bgRed(bold("The error :")));
      }
      throw e;
    }
  }
}
