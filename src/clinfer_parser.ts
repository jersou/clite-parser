import { bgGreen, bgRed, bgYellow, bold } from "@std/fmt/colors";
import { genHelp } from "./help.ts";
import { convertCommandArg, fillFields, parseArgs } from "./parse_args.ts";
import { runCommand } from "./command.ts";
import { getClinferMetadata } from "./metadata.ts";
import { loadConfig } from "./load_config.ts";
import type {
  ClinferError,
  ClinferResult,
  ClinferRunConfig,
  Obj,
} from "./types.ts";
import { getFieldNames, getMethodNames } from "./reflect.ts";
import { appendFileSync } from "node:fs";
import readline from "node:readline/promises";
import path from "node:path";

/**
 * Run the command of obj depending on the Deno/Node script arguments
 * @param objOrClass class or object to parse by clinfer (the class will be instanced)
 * @param config - of clinfer
 */
export async function clinfer<O extends Obj>(
  objOrClass: O | { new (): O },
  config: ClinferRunConfig = {},
): Promise<unknown> {
  let res;
  try {
    res = await clinferParse(objOrClass, config);
  } catch (e) {
    if (
      (e as ClinferError).cause?.clinfer &&
      (e as ClinferError).cause?.relaunchAfterUpdate
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
      if (e.cause?.clinfer || config?.printHelpOnError) {
        console.error(bgRed(bold("An error occurred ! The help :")));
        console.error(res.help);
        console.error();
        console.error(bgRed(bold("The error :")));
      }
      throw e;
    }
  }
}

/**
 * Return the parsing result of obj and the Deno/Node script arguments
 * @param objOrClass class or object to parse by clinfer (the class will be instanced)
 * @param config - of clinfer
 */
export async function clinferParse<O extends Obj & { config?: string }>(
  objOrClass: O | { new (): O },
  config: ClinferRunConfig = {},
): Promise<ClinferResult<O>> {
  const obj = await getObj(objOrClass);
  if (typeof objOrClass === "function" && !isConstructor(objOrClass)) {
    config.noCommand = true;
  }
  const isImportMetaObj = isImportMeta(objOrClass);
  if (isImportMetaObj && !config.meta) {
    config.meta = objOrClass as unknown as ImportMeta;
  }
  const metadata = getClinferMetadata(obj, isImportMetaObj);
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
          cause: { clinfer: true },
        });
      }
      fillFields(parseResult, obj, metadata, config);

      if (metadata.subcommands.includes(command)) {
        const subcommandObj = typeof obj[command] === "function"
          ? new obj[command]()
          : obj[command];
        subcommandObj._clinfer_parent = obj;
        const args = parseResult.commandArgs.map((e) => e.toString());
        const subcommand = await clinferParse(subcommandObj, {
          ...config,
          args,
        });
        return { obj, command, commandArgs: [], config, help, subcommand };
      } else if (
        !Object.hasOwn(metadata.methods, command) &&
        !getMethodNames(obj).includes(command) // allow exec of private methods
      ) {
        throw new Error(`The command "${command}" doesn't exist`, {
          cause: { clinfer: true },
        });
      }
      const commandArgs = config?.dontConvertCmdArgs
        ? parseResult.commandArgs
        : parseResult.commandArgs.map(convertCommandArg);
      return { obj, command, commandArgs, config, help };
    }
  } catch (e: unknown | ClinferError) {
    if ((e as ClinferError).cause?.clinfer || config?.printHelpOnError) {
      console.error(bgRed(bold("An error occurred ! The help :")));
      console.error(`${help}\n${bgRed(bold("The error :"))}`);
    }
    throw e;
  }
}

function isImportMeta(obj: Obj) {
  return (
    typeof obj === "object" &&
    obj !== null &&
    Object.getPrototypeOf(obj) === null &&
    "url" in obj
  );
}

async function handleMissingEsmSetter(
  meta: ImportMeta,
  missingSetters: string[],
) {
  const typescript = meta.filename!.toLowerCase().endsWith(".ts");
  const setters = missingSetters.map((field) =>
    typescript
      ? `export const _set_${field} = (v: typeof ${field}) => (${field} = v);`
      : `export const _set_${field} = (v) => (${field} = v);`
  );

  const msg = [
    `This module contains exported variables without 'clinfer' setters : ${
      missingSetters.join(
        ", ",
      )
    }.`,
    `It's necessary for Clinfer to process options (= exported var/let) due to ESM security limitations.`,
    `You must append these lines to "${path.basename(meta.filename!)}" :`,
    `${setters.map((s) => `    ${s}`).join("\n")}`,
    bold(
      `Do you want me to append this lines at the end of "${meta.filename}" now ?`,
    ),
  ];

  const userResp = await confirmDefaultTrue(bgYellow(msg.join("\n")));
  if (userResp) {
    const newCode = ["", "// Clinfer setters for options", ...setters].join(
      "\n",
    );
    appendFileSync(meta.filename!, newCode);
    console.log(bgGreen(`File updated !`));
    console.log(bgYellow(`You must relaunch your command !`));
    throw new Error("file updated, relaunch !", {
      cause: { clinfer: true, relaunchAfterUpdate: true },
    });
  } else {
    console.log(bgYellow(`Ignore these missing setters...`));
  }
}

// deno-lint-ignore no-explicit-any
function isConstructor(fn: any) {
  if (typeof fn !== "function") {
    return false;
  }
  try {
    Reflect.construct(String, [], fn);
    if (fn.toString().startsWith("class ")) {
      return true;
    }
  } catch (_) {
    return false;
  }
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
    const missingSetters = fields.filter(
      (field) => !allMethods.includes(`_set_${field}`),
    );

    if (missingSetters.length) {
      await handleMissingEsmSetter(meta, missingSetters);
    }
    return obj;
  } else if (Object.prototype.toString.call(objOrClass) === "[object Module]") {
    return Object.create(
      Object.prototype,
      Object.getOwnPropertyDescriptors(objOrClass),
    );
  } else if (typeof objOrClass === "function") {
    if (isConstructor(objOrClass)) {
      return new objOrClass();
    } else {
      return { tool: objOrClass };
    }
  } else {
    return objOrClass;
  }
}

async function confirmDefaultTrue(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });
  const answer = await rl.question(`${message} [Y/n] `);
  rl.close();
  if (answer === null) {
    return true;
  } else {
    const input = answer.trim().toLowerCase();
    return !input.startsWith("n");
  }
}
