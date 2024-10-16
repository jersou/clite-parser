import type { Obj } from "./parse_args.ts";

// call from decorator with "experimentalDecorators = false" or "experimentalDecorators = true"
// deno-lint-ignore no-explicit-any
function addSymbolMetadata(target: any, prop: any, key: string, val: any) {
  let roorMetadata;
  let propName;
  if (prop.addInitializer) {
    // experimentalDecorators = false
    roorMetadata = prop.metadata;
    propName = prop.name;
  } else {
    // experimentalDecorators = true
    if (!target.constructor[Symbol.metadata]) {
      target.constructor[Symbol.metadata] = {};
    }
    roorMetadata = target.constructor[Symbol.metadata];
    propName = prop;
  }
  if (!roorMetadata.clite) {
    roorMetadata.clite = {};
  }
  const metadata = roorMetadata.clite;
  if (!metadata[key]) {
    metadata[key] = {};
  }
  if (Object.hasOwn(metadata[key], propName)) {
    if (!Array.isArray(metadata[key][propName])) {
      metadata[key][propName] = [metadata[key][propName]];
    }
    metadata[key][propName].push(val);
  } else {
    metadata[key][propName] = val;
  }
}

/**
 * get the metadata from the js object
 * @param obj - to use
 */
export function getCliteSymbolMetadata(obj: Obj): Obj {
  return Object.getPrototypeOf(obj).constructor[Symbol.metadata]?.clite || {};
}

// deno-lint-ignore no-explicit-any
type DecoratorRetFunc = (target: unknown, prop?: unknown) => any;

/**
 * decorator on classes/methods/properties : `@help("description...")`
 * @param description - to display in the help
 */
export function help(description: string): DecoratorRetFunc {
  return (target: unknown, prop?: unknown) =>
    addSymbolMetadata(target, prop, "help", description);
}

/**
 * decorator on properties : `@alias("p")`
 * @param alias - to use as short alias
 */
export function alias(alias: string): DecoratorRetFunc {
  return (target: unknown, prop?: unknown) =>
    addSymbolMetadata(target, prop, "alias", alias);
}

/**
 * decorator on properties : `@type("string")`
 * @param typeHelp - to add to the help
 */
export function type(typeHelp: string): DecoratorRetFunc {
  return (target: unknown, prop?: unknown) =>
    addSymbolMetadata(target, prop, "types", typeHelp);
}

/**
 * decorator on properties : `@negatable` on boolean, negated by prefixing it with --no-
 * @param help - to add to the help (optional)
 */
export function negatable(help: string | boolean = true): DecoratorRetFunc {
  return (target: unknown, prop?: unknown) =>
    addSymbolMetadata(target, prop, "negatables", help);
}

/**
 * decorator on properties : `@default("default in help")`
 * @param defaultHelp - to add to the help
 */
export function defaultHelp(defaultHelp: string): DecoratorRetFunc {
  return (target: unknown, prop?: unknown) =>
    addSymbolMetadata(target, prop, "defaults", defaultHelp);
}

/**
 * decorator on class : `@usage("usage of the tool in the help")`
 * @param usage - to overwrite in the help
 */
export function usage(usage: string): DecoratorRetFunc {
  return (target: unknown, prop?: unknown) =>
    addSymbolMetadata(target, prop, "usage", usage);
}

/**
 * decorator on methods/properties : `@hidden()`
 */
export function hidden(): DecoratorRetFunc {
  return (target: unknown, prop?: unknown) =>
    addSymbolMetadata(target, prop, "hidden", true);
}

/**
 * decorator on properties : `@subcommand()`
 */
export function subcommand(): DecoratorRetFunc {
  return (target: unknown, prop?: unknown) =>
    addSymbolMetadata(target, prop, "subcommand", true);
}

/**
 * decorator on class : `@noCommand()`
 */
export function noCommand(): DecoratorRetFunc {
  return (target: unknown, prop?: unknown) =>
    addSymbolMetadata(target, prop, "noCommand", true);
}
