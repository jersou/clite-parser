/**
 * ClinferRunConfig
 */
export type ClinferRunConfig = {
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
   * allows to change the name of the file in the help, instead of the default <script path>
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
 * Obj type
 */
export type Obj = Record<string, any>;
/**
 * Result of clinferParse()
 */
export type ClinferResult<O extends Obj> = {
  obj: O & {
    config?: string;
  };
  command: string;
  commandArgs: (string | number | boolean)[];
  config?: ClinferRunConfig;
  help: string;
  subcommand?: ClinferResult<Obj>;
};
export type ClinferError = Error & {
  cause?: {
    clinfer?: boolean;
    relaunchAfterUpdate?: boolean;
    error?: Error;
  };
};
