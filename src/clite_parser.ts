import { bgRed, bold } from "@std/fmt/colors";
import { genHelp } from "./help.ts";
import { convertCommandArg, fillFields, parseArgs } from "./parse_args.ts";
import { runCommand } from "./command.ts";
import { getCliteMetadata } from "./metadata.ts";
import { loadConfig } from "./load_config.ts";
import type { CliteError, CliteResult, CliteRunConfig, Obj } from "./types.ts";
import { getFieldNames, getMethodNames } from "./reflect.ts";
import fs from "node:fs";
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
  const res = await cliteParse(objOrClass, config);

  if (!config?.meta || config?.meta.main) {
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
    const module = await import((objOrClass as unknown as ImportMeta).url);
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
      const meta  =  (objOrClass as unknown as ImportMeta)
      const tempPath =
        meta.dirname + "/.temp-clite." + path.basename(meta.filename!);
      const rawCode = fs.readFileSync(
        new URL((objOrClass as unknown as ImportMeta).url),
        "utf-8",
      );
      const setters = missingSetters.map(
        (field) => `export function _set_${field}(v) { ${field} = v; }`,
      );
      const newCode = [rawCode, ...setters].join("\n");
      try {
        fs.writeFileSync(tempPath, newCode, "utf-8");
        const newModule = await import(tempPath.toString());
         throw new Error("fork")
      // return  Object.create(
      //     Object.prototype,
      //     Object.getOwnPropertyDescriptors(newModule),
      //   );
      } finally {
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      }
    } else {
      return obj;
    }
  } else {
    return typeof objOrClass === "function" ? new objOrClass() : objOrClass;
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
