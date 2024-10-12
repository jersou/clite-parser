// call from decorator with experimentalDecorators = false or true
// deno-lint-ignore no-explicit-any
function addMetadata(target: any, prop: any, key: string, val: any) {
  let metadata;
  let propName;
  if (prop.addInitializer) {
    // experimentalDecorators = false
    metadata = prop.metadata;
    propName = prop.name;
  } else {
    // experimentalDecorators = true
    if (!target.constructor[Symbol.metadata]) {
      target.constructor[Symbol.metadata] = {};
    }
    metadata = target.constructor[Symbol.metadata];
    propName = prop;
  }
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

// deno-lint-ignore no-explicit-any
export function getMetadata(obj: any, key: string): any {
  return Object.getPrototypeOf(obj).constructor[Symbol.metadata]?.[key];
}

/**
 * decorator on classes/methods/properties : `@help("description...")`
 * @param description - to display in the help
 */
// deno-lint-ignore no-explicit-any
export function help(description: string): any {
  // deno-lint-ignore no-explicit-any
  return function (target: any, prop?: any) {
    addMetadata(target, prop, "clite_help", description);
  };
}

/**
 * decorator on properties : `@alias("p")`
 * @param alias - to use as short alias
 */
// deno-lint-ignore no-explicit-any
export function alias(alias: string): any {
  // deno-lint-ignore no-explicit-any
  return function (target: any, prop?: any) {
    addMetadata(target, prop, "clite_alias", alias);
  };
}

/**
 * decorator on properties : `@type("string")`
 * @param typeHelp - to add to the help
 */
// deno-lint-ignore no-explicit-any
export function type(typeHelp: string): any {
  // deno-lint-ignore no-explicit-any
  return function (target: any, prop?: any) {
    addMetadata(target, prop, "clite_types", typeHelp);
  };
}

/**
 * decorator on properties : `@negatable` on boolean, negated by prefixing it with --no-
 * @param help - to add to the help (optional)
 */
// deno-lint-ignore no-explicit-any
export function negatable(help?: string): any {
  // deno-lint-ignore no-explicit-any
  return function (target: any, prop?: any) {
    addMetadata(target, prop, "clite_negatables", help);
  };
}

/**
 * decorator on properties : `@default("default in help")`
 * @param defaultHelp - to add to the help
 */
// deno-lint-ignore no-explicit-any
export function defaultHelp(defaultHelp: string): any {
  // deno-lint-ignore no-explicit-any
  return function (target: any, prop?: any) {
    addMetadata(target, prop, "clite_defaults", defaultHelp);
  };
}

/**
 * decorator on class : `@usage("usage of the tool in the help")`
 * @param usage - to overwrite in the help
 */
// deno-lint-ignore no-explicit-any
export function usage(usage: string): any {
  // deno-lint-ignore no-explicit-any
  return function (target: any, prop?: any) {
    addMetadata(target, prop, "clite_usage", usage);
  };
}
