import { getMetadata } from "./decorators.ts";
import type { CliteRunConfig } from "../clite_parser.ts";
import { toKebabCase } from "jsr:@std/text@1.0.6";
import type { Obj } from "./parse_args.ts";
import { getFieldNames, getMethodArgNames, getMethodNames } from "./reflect.ts";
import { bold, gray, underline } from "jsr:@std/fmt@1.0.2/colors";

export function boldUnder(str: string) {
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

export function getDefaultMethod(methods: string[]) {
  if (methods.length == 1) {
    return methods[0];
  } else {
    return methods.includes("main") ? "main" : undefined;
  }
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

function genOptionsHelp(obj: Obj, helpLines: string[]) {
  const helpMetadata = getMetadata(obj, "clite_help");
  const aliasMetadata = getMetadata(obj, "clite_alias") as Obj;
  const typesMetadata = getMetadata(obj, "clite_types") as Obj;
  const defaultMetadata = getMetadata(obj, "clite_defaults") as Obj;
  const negatableMetadata = getMetadata(obj, "clite_negatables") as Obj;
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
