import { bgRed, bold } from "@std/fmt/colors";
import { genHelp } from "./help.ts";
import { convertCommandArg, fillFields, parseArgs } from "./parse_args.ts";
import { runCommand } from "./command.ts";
import { getCliteMetadata } from "./metadata.ts";
import { loadConfig } from "./load_config.ts";
import type { CliteError, CliteResult, CliteRunConfig, Obj } from "./types.ts";

/**
 * Run the command of obj depending on the Deno/Node script arguments
 * @param objOrClass class or object to parse by clite-parser (the class will be instanced)
 * @param config - of clite-parser
 */
export function cliteRun<O extends Obj>(
  objOrClass: O | { new (): O },
  config?: CliteRunConfig,
): unknown {
  const res = cliteParse(objOrClass, config);

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

/**
 * Return the parsing result of obj and the Deno/Node script arguments
 * @param objOrClass class or object to parse by clite-parser (the class will be instanced)
 * @param config - of clite-parser
 */
export function cliteParse<O extends Obj & { config?: string }>(
  objOrClass: O | { new (): O },
  config?: CliteRunConfig,
): CliteResult<O> {
  const obj = typeof objOrClass === "function" ? new objOrClass() : objOrClass;
  const metadata = getCliteMetadata(obj);
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
        const subcommand = cliteParse(subcommandObj, { ...config, args });
        return { obj, command, commandArgs: [], config, help, subcommand };
      } else if (!Object.hasOwn(metadata.methods, command)) {
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
