import { bgGreen, bgRed, bgYellow, bold } from "@std/fmt/colors";
import { genHelp } from "./help.ts";
import { convertCommandArg, fillFields, parseArgs } from "./parse_args.ts";
import { runCommand } from "./command.ts";
import { getCliteMetadata } from "./metadata.ts";
import { loadConfig } from "./load_config.ts";
import type { CliteError, CliteResult, CliteRunConfig, Obj } from "./types.ts";
import { getFieldNames, getMethodNames } from "./reflect.ts";
import { appendFileSync } from "node:fs";
import path from "node:path";

/**
 * Run the command of obj depending on the Deno/Node script arguments
 * @param objOrClass class or object to parse by clite-parser (the class will be instanced)
 * @param config - of clite-parser
 */
export async function cliteRun<O extends Obj>(
  objOrClass: O | { new (): O },
  config?: CliteRunConfig,
): Promise<unknown> {
  let res;
  try {
    res = await cliteParse(objOrClass, config);
  } catch (e) {
    if (
      (e as CliteError).cause?.clite &&
      (e as CliteError).cause?.relaunchAfterUpdate
    ) {
      return;
    } else {
      throw e;
    }
  }

  if (res && (!config?.meta || config?.meta.main)) {
    try {
      return runCommand<O>(res);
      // deno-lint-ignore no-explicit-any
    } catch (e: any) {
      if (e.cause?.clite || config?.printHelpOnError) {
        console.error(bgRed(bold("An error occurred ! The help :")));
        console.error(res.help);
        console.error();
        console.error(bgRed(bold("The error :")));
      }
      throw e;
    }
  }
}

function isImportMeta(obj: Obj) {
  return (typeof obj === "object" && obj !== null &&
    Object.getPrototypeOf(obj) === null && "url" in obj);
}

async function getObj<O extends Obj & { config?: string }>(
  objOrClass: O | { new (): O },
) {
  if (isImportMeta(objOrClass)) {
    const meta = objOrClass as unknown as ImportMeta;
    const module = await import(meta.url);
    const obj = Object.create(
      Object.prototype,
      Object.getOwnPropertyDescriptors(module),
    );
    const allMethods = getMethodNames(obj);
    const fields = getFieldNames(obj) as string[];
    const missingSetters = fields.filter((field) =>
      !allMethods.includes(`_set_${field}`)
    );

    if (missingSetters.length) {
      const typescript = meta.filename!.toLowerCase().endsWith(".ts");
      const setters = missingSetters.map(
        (field) =>
          typescript
            ? `export const _set_${field} = (v: typeof ${field}) => (${field} = v);`
            : `export const _set_${field} = (v) => (${field} = v);`,
      );
      console.log(
        bgYellow(
          `This module contains exported variables without 'clite' setters : ${
            missingSetters.join(", ")
          }`,
        ),
      );
      console.log(
        bgYellow(
          `You must append this lines to "${path.basename(meta.filename!)}" :`,
        ),
      );
      console.log(`${setters.map((s) => `    ${s}`).join("\n")}`);

      const userResp = await confirmDefaultTrue(
        bold(bgYellow(
          `Do you want me to append this lines at the end of "${meta.filename}" now ?`,
        )),
      );
      if (userResp) {
        const newCode = ["", ...setters].join("\n");
        appendFileSync(meta.filename!, newCode);
        console.log(bgGreen(`File updated !`));
        console.log(bgYellow(`You must relauch your command`));
        throw new Error("file updated, relaunch !", {
          cause: { clite: true, relaunchAfterUpdate: true },
        });
      }
    } else {
      return obj;
    }
  } else {
    return typeof objOrClass === "function" ? new objOrClass() : objOrClass;
  }
}

async function confirmDefaultTrue(message: string): Promise<boolean> {
  await Deno.stdout.write(new TextEncoder().encode(`${message} [Y/n] `));
  const buffer = new Uint8Array(1024);
  const n = await Deno.stdin.read(buffer);
  if (n === null) {
    return true;
  } else {
    const input = new TextDecoder()
      .decode(buffer.subarray(0, n))
      .trim()
      .toLowerCase();
    return !input.startsWith("n");
  }
}

/**
 * Return the parsing result of obj and the Deno/Node script arguments
 * @param objOrClass class or object to parse by clite-parser (the class will be instanced)
 * @param config - of clite-parser
 */
export async function cliteParse<O extends Obj & { config?: string }>(
  objOrClass: O | { new (): O },
  config?: CliteRunConfig,
): Promise<CliteResult<O>> {
  const obj = await getObj(objOrClass);
  const metadata = getCliteMetadata(obj, isImportMeta(objOrClass));
  const help = genHelp(obj, metadata, config);
  try {
    const parseResult = parseArgs(obj, metadata, config);

    if (Object.keys(parseResult.options).includes("help")) {
      return { obj, command: "--help", commandArgs: [], config, help };
    } else {
      if (config?.configCli || metadata.jsonConfig) {
        if (Object.keys(parseResult.options).includes("config")) {
          loadConfig(parseResult, obj);
        } else {
          obj.config = undefined;
        }
      }
      const command = parseResult.command ?? metadata.defaultCommand;
      if (!command) {
        throw new Error(`no method defined or no "main" method`, {
          cause: { clite: true },
        });
      }
      fillFields(parseResult, obj, metadata, config);

      if (metadata.subcommands.includes(command)) {
        const subcommandObj = typeof obj[command] === "function"
          ? new obj[command]()
          : obj[command];
        subcommandObj._clite_parent = obj;
        const args = parseResult.commandArgs.map((e) => e.toString());
        const subcommand = await cliteParse(subcommandObj, { ...config, args });
        return { obj, command, commandArgs: [], config, help, subcommand };
      } else if (
        !Object.hasOwn(metadata.methods, command) &&
        !getMethodNames(obj).includes(command) // allow exec of private methods
      ) {
        throw new Error(`The command "${command}" doesn't exist`, {
          cause: { clite: true },
        });
      }
      const commandArgs = config?.dontConvertCmdArgs
        ? parseResult.commandArgs
        : parseResult.commandArgs.map(convertCommandArg);
      return { obj, command, commandArgs, config, help };
    }
  } catch (e: unknown | CliteError) {
    if ((e as CliteError).cause?.clite || config?.printHelpOnError) {
      console.error(bgRed(bold("An error occurred ! The help :")));
      console.error(`${help}\n${bgRed(bold("The error :"))}`);
    }
    throw e;
  }
}
