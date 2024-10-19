import type { Obj } from "./types.d.ts";
/**
 * get the metadata from the js object
 * @param obj - to use
 */
export declare function getCliteSymbolMetadata(obj: Obj): Obj;
type DecoratorRetFunc = (target: unknown, prop?: unknown) => any;
/**
 * decorator on classes/methods/properties : `@help("description...")`
 * @param description - to display in the help
 */
export declare function help(description: string): DecoratorRetFunc;
/**
 * decorator on properties : `@alias("p")`
 * @param alias - to use as short alias
 */
export declare function alias(alias: string): DecoratorRetFunc;
/**
 * decorator on properties : `@type("string")`
 * @param typeHelp - to add to the help
 */
export declare function type(typeHelp: string): DecoratorRetFunc;
/**
 * decorator on properties : `@negatable` on boolean, negated by prefixing it with --no-
 * @param help - to add to the help (optional)
 */
export declare function negatable(help?: string | boolean): DecoratorRetFunc;
/**
 * decorator on properties : `@default("default in help")`
 * @param defaultHelp - to add to the help
 */
export declare function defaultHelp(defaultHelp: string): DecoratorRetFunc;
/**
 * decorator on class : `@usage("usage of the tool in the help")`
 * @param usage - to overwrite in the help
 */
export declare function usage(usage: string): DecoratorRetFunc;
/**
 * decorator on methods/properties : `@hidden()`
 */
export declare function hidden(): DecoratorRetFunc;
/**
 * decorator on properties : `@subcommand()`
 */
export declare function subcommand(): DecoratorRetFunc;
/**
 * decorator on class : `@noCommand()`
 */
export declare function noCommand(): DecoratorRetFunc;
/**
 * decorator on class : `@jsonConfig()`
 * @param help - to add to the help (optional)
 */
export declare function jsonConfig(help?: string | boolean): DecoratorRetFunc;
export {};
