import type { Obj } from "./parse_args.ts";

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
   * enable "--config <path|json string>" to load json config before processing the args, Show in the help if it's a string
   */
  configCli?: boolean | string;

  /**
   * don't convert "true"/"false" to true/false in command arguments, and not to number after --
   */
  dontConvertCmdArgs?: boolean;
};

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
   * The subcommand CliteResult if the command is a subcommand
   */
  subcommand?: CliteResult<Obj>;
};

export type CliteError = Error & { cause?: { clite?: boolean; error?: Error } };
