import { bgRed, bold } from "@std/fmt/colors";
import { genHelp } from "./src/help.ts";
import {
  convertCommandArg,
  fillFields,
  type Obj,
  parseArgs,
} from "./src/parse_args.ts";
import { runCommand } from "./src/command.ts";
import { getCliteMetadata } from "./src/metadata.ts";

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
 * Result of cliteParse()
 */
export type CliteResult<O extends Obj> = {
  /*
   * The input object overwritten with the data from the parsing result
   */
  obj: O & { config?: string };
  /*
   * The command to run from the parsing result
   */
  command: string;
  /*
   * The command arguments from the parsing result
   */
  commandArgs: (string | number | boolean)[];
  /*
   * The input CliteRunConfig
   */
  config?: CliteRunConfig;
  /*
   * The generated help
   */
  help: string;
  /*
   * The subcommand CliteResult
   */
  subcommand?: CliteResult<Obj>;
};

/**
 * Return the parsing result of obj and the Deno/Node script arguments
 * @param objOrClass class or object to parse by clite-parser (the class will be instanced)
 * @param config - of clite-parser
 */
export function cliteParse<O extends Obj & { config?: string }>(
  objOrClass: O | { new (): O },
  config?: CliteRunConfig,
): CliteResult<O> {
  const obj = (
    typeof objOrClass === "function" ? new objOrClass() : objOrClass
  ) as O;

  const metadata = getCliteMetadata(obj);
  const help = genHelp(obj, metadata, config);
  try {
    const defaultMethod = metadata.defaultCommand;
    const parseResult = parseArgs(obj, metadata, config, defaultMethod);

    if (Object.keys(parseResult.options).includes("help")) {
      return ({ obj, command: "--help", commandArgs: [], config, help });
    } else {
      if (config?.configCli) {
        if (Object.keys(parseResult.options).includes("config")) {
          // deno-lint-ignore no-explicit-any
          if ((globalThis as any)["Deno"]?.args) { // Deno implementation
            const path = parseResult.options.config as string;
            try {
              const json = Deno.readTextFileSync(path);
              const config = JSON.parse(json);
              Object.assign(obj, config);
              obj.config = path;
            } catch (error) {
              throw new Error(
                `Error while loading the config file "${path}"`,
                {
                  cause: { clite: true, error },
                },
              );
            }
          } else {
            // TODO NodeJS implementation
            throw new Error("Load config is not implemented on NodeJs");
          }
        } else {
          obj.config = undefined;
        }
      }

      const command = parseResult.command ?? defaultMethod;
      if (!command) {
        throw new Error(`no method defined or no "main" method`, {
          cause: { clite: true },
        });
      }

      fillFields(parseResult, obj, metadata);
      if (metadata.subcommands.includes(command)) {
        const subcommandObj = typeof obj[command] === "function"
          ? new obj[command]()
          : obj[command];
        subcommandObj._clite_parent = obj;
        return {
          obj,
          command,
          commandArgs: [],
          config,
          help,
          subcommand: cliteParse(subcommandObj, {
            ...config,
            args: parseResult.commandArgs.map((e) => e.toString()),
          }),
        };
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
