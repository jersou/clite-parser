import { bgRed, bold } from "@std/fmt/colors";
import { genHelp, getDefaultMethod } from "./src/help.ts";
import { fillFields, type Obj, parseArgs } from "./src/parse_args.ts";
import { getFieldNames, getMethodNames } from "./src/reflect.ts";
import { runCommand } from "./src/command.ts";

export * from "./src/decorators.ts";

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
  /**
   * enable "--config <path>" to load json config before processing the args, Show in the help if it's a string
   */
  configCli?: boolean | string;

  /**
   * don't convert "true"/"false" to true/false in command arguments, and not to number after --
   */
  dontConvertCmdArgs?: boolean;
};

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
        if (
          config?.configCli &&
          getFieldNames(parseResult.options).includes("config")
        ) {
          // deno-lint-ignore no-explicit-any
          if ((globalThis as any)["Deno"]?.args) {
            const path = parseResult.options.config as string;
            try {
              const json = Deno.readTextFileSync(path);
              const config = JSON.parse(json);
              Object.assign(obj, config);
              obj.config = undefined;
            } catch (error) {
              throw new Error(`Error while loading the config file "${path}"`, {
                cause: { clite: true, error },
              });
            }
          } else {
            // TODO NodeJS implementation
            throw new Error("Load config is not implemented on NodeJs");
          }
        }
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
        const commandArgs = config?.dontConvertCmdArgs
          ? parseResult.commandArgs
          : parseResult.commandArgs.map(convertCommandArg);
        return runCommand(obj, command, commandArgs, config);
      }
      // deno-lint-ignore no-explicit-any
    } catch (e: any) {
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

function convertCommandArg(v: string | number) {
  if (typeof v === "string") {
    if (v === "true") {
      return true;
    } else if (v === "false") {
      return false;
    } else {
      if (!isNaN(v as unknown as number) && !isNaN(parseFloat(v))) {
        return parseFloat(v);
      }
    }
  }
  return v;
}
