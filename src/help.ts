import type { CliteRunConfig } from "../clite_parser.ts";
import { toKebabCase } from "@std/text";
import type { Obj } from "./parse_args.ts";
import { getMethodArgNames } from "./reflect.ts";
import { bold, gray, underline } from "@std/fmt/colors";
import type { Metadata } from "./metadata.ts";

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

function genCommandHelp<O extends Obj>(
  obj: O,
  metadata: Metadata<O>,
  helpLines: string[],
) {
  metadata.methods.push(...metadata.subcommands); //TODO REFACTOR
  if (metadata.methods.length > 0) {
    helpLines.push(
      boldUnder(`\nCommand${metadata.methods.length > 1 ? "s" : ""}:`),
    );
    const linesCols: [string, string, string, string][] = [];
    for (const method of metadata.methods) {
      let col1 = bold(`  ${method}`);
      if (!metadata.subcommands.includes(method)) {
        //TODO REFACTOR
        const args = getMethodArgNames(obj, method);
        if (args.length > 0) {
          col1 += " " + args.map((arg) => `<${arg}>`).join(" ");
        }
      }
      let col2 = metadata.fields?.[method]?.help ??
        obj[`_${method}_help`] ??
        "";

      if (method === metadata.defaultCommand) {
        col2 += col2.length ? " " : "";
        col2 += bold("[default]");
      }

      const col3 = "";
      linesCols.push(["", col1, col2, col3]);
    }
    helpLines.push(...align(linesCols));
  }
}

function genOptionsHelp<O extends Obj>(
  obj: Obj,
  metadata: Metadata<O>,
  helpLines: string[],
  config?: CliteRunConfig,
) {
  const allFields = Object.keys(metadata.fields);
  const fields = allFields.filter((f) => !metadata.fields[f]?.hidden);
  helpLines.push(boldUnder(`\nOption${fields.length ? "s" : ""}:`));
  const linesCols: [string, string, string, string][] = [];
  linesCols.push([
    bold(` -h,`),
    bold(` --help`),
    "Show this help",
    gray("[default: false]"),
  ]);
  if (config?.configCli) {
    linesCols.push([
      bold(""),
      bold(` --config`),
      typeof config?.configCli === "string"
        ? config?.configCli
        : "Use this file to read option before processing the args",
      gray("[string]"),
    ]);
  }

  for (const field of fields) {
    const alias = metadata.fields[field]?.alias ?? [];
    const aliasHelp = (Array.isArray(alias) ? alias : [alias])
      .map((a) => (a.length === 1 ? `-${a},` : `--${toKebabCase(a)},`))
      .join(" ");

    const col0 = bold(` ${aliasHelp}`);
    const col1 = bold(` --${toKebabCase(field)}`);
    let col2 = "";
    let col3 = "";
    const help = metadata.fields[field]?.help ?? "";
    if (help) {
      col2 += help;
    }
    const defaultValue = metadata.fields[field]?.defaultHelp ?? obj[field];
    if (defaultValue != undefined) {
      const defaultHelp = typeof defaultValue === "string"
        ? `"${defaultValue}"`
        : defaultValue;
      col3 = gray(`[default: ${defaultHelp}]`);
    } else {
      const type = metadata.fields[field]?.type;
      if (type) {
        col3 = gray(`[${type}]`);
      }
    }
    linesCols.push([col0, col1, col2, col3]);
    // TODO refactor
    if (metadata.fields[field]?.negatable) {
      linesCols.push([
        bold(" "),
        bold(` --${toKebabCase("no_" + field)}`),
        typeof metadata.fields[field]?.negatable === "string"
          ? metadata.fields[field]?.negatable
          : "",
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
 * @param metadata - clite metadata
 * @param config CliteRunConfig
 * @returns the help as string
 */
export function genHelp<O extends Obj>(
  obj: O,
  metadata: Metadata<O>,
  config?: CliteRunConfig,
): string {
  const helpLines: string[] = [];
  if (metadata.help) {
    helpLines.push(metadata.help + "\n");
  }
  const name = Object.getPrototypeOf(obj).constructor.name;
  const mainFile = config?.mainFile ??
    config?.meta?.url?.replace(/.*\//, "./") ??
    `<${name} file>`;

  let usage = `${boldUnder("Usage:")} `;
  if (metadata.usage) {
    usage = `${usage}${metadata.usage}`;
  } else if (config?.noCommand || metadata.noCommand) {
    usage = `${usage}${mainFile} [Options] [--] [args]`;
  } else {
    usage = `${usage}${mainFile} [Options] [--] [command [command args]]`;
  }
  helpLines.push(usage);
  if (!config?.noCommand && !metadata.noCommand) {
    genCommandHelp(obj, metadata, helpLines);
  }
  genOptionsHelp(obj, metadata, helpLines, config);
  return helpLines.join("\n");
}
