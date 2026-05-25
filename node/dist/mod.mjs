// deno:https://jsr.io/@std/collections/1.1.3/_utils.ts
function filterInPlace(array, predicate) {
  let outputIndex = 0;
  for (const cur of array) {
    if (!predicate(cur)) {
      continue;
    }
    array[outputIndex] = cur;
    outputIndex += 1;
  }
  array.splice(outputIndex);
  return array;
}

// deno:https://jsr.io/@std/collections/1.1.3/deep_merge.ts
function deepMerge(record, other, options) {
  return deepMergeInternal(record, other, /* @__PURE__ */ new Set(), options);
}
function deepMergeInternal(record, other, seen, options) {
  const result = {};
  const keys = /* @__PURE__ */ new Set([
    ...getKeys(record),
    ...getKeys(other),
  ]);
  for (const key of keys) {
    if (key === "__proto__") {
      continue;
    }
    const a = record[key];
    if (!Object.hasOwn(other, key)) {
      result[key] = a;
      continue;
    }
    const b = other[key];
    if (
      isNonNullObject(a) && isNonNullObject(b) && !seen.has(a) && !seen.has(b)
    ) {
      seen.add(a);
      seen.add(b);
      result[key] = mergeObjects(a, b, seen, options);
      continue;
    }
    result[key] = b;
  }
  return result;
}
function mergeObjects(left, right, seen, options = {
  arrays: "merge",
  sets: "merge",
  maps: "merge",
}) {
  if (isMergeable(left) && isMergeable(right)) {
    return deepMergeInternal(left, right, seen, options);
  }
  if (isIterable(left) && isIterable(right)) {
    if (Array.isArray(left) && Array.isArray(right)) {
      if (options.arrays === "merge") {
        return left.concat(right);
      }
      return right;
    }
    if (left instanceof Map && right instanceof Map) {
      if (options.maps === "merge") {
        return new Map([
          ...left,
          ...right,
        ]);
      }
      return right;
    }
    if (left instanceof Set && right instanceof Set) {
      if (options.sets === "merge") {
        return /* @__PURE__ */ new Set([
          ...left,
          ...right,
        ]);
      }
      return right;
    }
  }
  return right;
}
function isMergeable(value) {
  return Object.getPrototypeOf(value) === Object.prototype;
}
function isIterable(value) {
  return typeof value[Symbol.iterator] === "function";
}
function isNonNullObject(value) {
  return value !== null && typeof value === "object";
}
function getKeys(record) {
  const result = Object.getOwnPropertySymbols(record);
  filterInPlace(
    result,
    (key) => Object.prototype.propertyIsEnumerable.call(record, key),
  );
  result.push(...Object.keys(record));
  return result;
}

// src/decorators.ts
function addSymbolMetadata(target, prop, key, val) {
  let roorMetadata;
  let propName;
  if (prop.addInitializer) {
    roorMetadata = prop.metadata;
    propName = prop.name;
  } else {
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
      metadata[key][propName] = [
        metadata[key][propName],
      ];
    }
    metadata[key][propName].push(val);
  } else {
    metadata[key][propName] = val;
  }
}
function getCliteSymbolMetadata(obj) {
  const prototypes = [];
  let o = obj;
  while (o = Reflect.getPrototypeOf(o)) {
    prototypes.unshift(o);
  }
  let metadata = {};
  for (const prototype of prototypes) {
    const protMeta = prototype.constructor[Symbol.metadata]?.clite || {};
    metadata = deepMerge(metadata, protMeta);
  }
  return metadata;
}
function help(description) {
  return (target, prop) => addSymbolMetadata(target, prop, "help", description);
}
function alias(alias2) {
  return (target, prop) => addSymbolMetadata(target, prop, "alias", alias2);
}
function type(typeHelp) {
  return (target, prop) => addSymbolMetadata(target, prop, "types", typeHelp);
}
function negatable(help2 = true) {
  return (target, prop) => addSymbolMetadata(target, prop, "negatables", help2);
}
function defaultHelp(defaultHelp2) {
  return (target, prop) =>
    addSymbolMetadata(target, prop, "defaults", defaultHelp2);
}
function usage(usage2) {
  return (target, prop) => addSymbolMetadata(target, prop, "usage", usage2);
}
function hidden() {
  return (target, prop) => addSymbolMetadata(target, prop, "hidden", true);
}
function subcommand() {
  return (target, prop) => addSymbolMetadata(target, prop, "subcommand", true);
}
function noCommand() {
  return (target, prop) => addSymbolMetadata(target, prop, "noCommand", true);
}
function jsonConfig(help2 = true) {
  return (target, prop) => addSymbolMetadata(target, prop, "jsonConfig", help2);
}

// deno:https://jsr.io/@std/fmt/1.0.8/colors.ts
var { Deno } = globalThis;
var noColor = typeof Deno?.noColor === "boolean" ? Deno.noColor : false;
var enabled = !noColor;
function code(open, close) {
  return {
    open: `\x1B[${open.join(";")}m`,
    close: `\x1B[${close}m`,
    regexp: new RegExp(`\\x1b\\[${close}m`, "g"),
  };
}
function run(str, code2) {
  return enabled
    ? `${code2.open}${str.replace(code2.regexp, code2.open)}${code2.close}`
    : str;
}
function bold(str) {
  return run(
    str,
    code([
      1,
    ], 22),
  );
}
function underline(str) {
  return run(
    str,
    code([
      4,
    ], 24),
  );
}
function gray(str) {
  return brightBlack(str);
}
function brightBlack(str) {
  return run(
    str,
    code([
      90,
    ], 39),
  );
}
function bgRed(str) {
  return run(
    str,
    code([
      41,
    ], 49),
  );
}
function bgGreen(str) {
  return run(
    str,
    code([
      42,
    ], 49),
  );
}
function bgYellow(str) {
  return run(
    str,
    code([
      43,
    ], 49),
  );
}
var ANSI_PATTERN = new RegExp(
  [
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TXZcf-nq-uy=><~]))",
  ].join("|"),
  "g",
);

// deno:https://jsr.io/@std/text/1.0.16/levenshtein_distance.ts
var { ceil } = Math;
var peq = new Uint32Array(1114112);

// deno:https://jsr.io/@std/text/1.0.16/_util.ts
var CAPITALIZED_WORD_REGEXP = /\p{Lu}\p{Ll}+/u;
var ACRONYM_REGEXP = /\p{Lu}+(?=(\p{Lu}\p{Ll})|\P{L}|\b)/u;
var LOWERCASED_WORD_REGEXP = /(\p{Ll}+)/u;
var ANY_LETTERS = /\p{L}+/u;
var DIGITS_REGEXP = /\p{N}+/u;
var WORD_OR_NUMBER_REGEXP = new RegExp(
  `${CAPITALIZED_WORD_REGEXP.source}|${ACRONYM_REGEXP.source}|${LOWERCASED_WORD_REGEXP.source}|${ANY_LETTERS.source}|${DIGITS_REGEXP.source}`,
  "gu",
);
function splitToWords(input) {
  return input.match(WORD_OR_NUMBER_REGEXP) ?? [];
}
function capitalizeWord(word) {
  return word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : word;
}

// deno:https://jsr.io/@std/text/1.0.16/to_camel_case.ts
function toCamelCase(input) {
  input = input.trim();
  const [first = "", ...rest] = splitToWords(input);
  return [
    first.toLowerCase(),
    ...rest.map(capitalizeWord),
  ].join("");
}

// deno:https://jsr.io/@std/text/1.0.16/to_kebab_case.ts
function toKebabCase(input) {
  input = input.trim();
  return splitToWords(input).join("-").toLowerCase();
}

// deno:https://jsr.io/@std/text/1.0.16/to_snake_case.ts
function toSnakeCase(input) {
  input = input.trim();
  return splitToWords(input).join("_").toLowerCase();
}

// src/reflect.ts
var COMMENTS_REGEX = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;
var ARGUMENT_NAMES_REGEX = /\((?<args>.*?)\)/m;
function getFunctionArgNames(func) {
  const fnStr = func.toString().replace(COMMENTS_REGEX, "");
  const argNames = ARGUMENT_NAMES_REGEX.exec(fnStr);
  return argNames?.[1].length &&
      argNames?.[1]?.replace(/\s*=\s*[^,]+\s*/g, "").split(",").map((arg) =>
        arg.replace(/[\s()]+/g, "")
      ) || [];
}
function getMethodNames(obj) {
  const prototype = Object.getPrototypeOf(obj);
  return prototype.constructor.name === "Object"
    ? Object.getOwnPropertyNames(obj).filter((n) =>
      typeof obj[n] === "function"
    )
    : getMethodNamesDeep(obj);
}
function getMethodNamesDeep(obj) {
  const methods = [];
  let o = obj;
  while (o = Reflect.getPrototypeOf(o)) {
    if (o.constructor.name !== "Object") {
      methods.unshift(
        ...Reflect.ownKeys(o).filter((k) =>
          typeof k === "string" && k !== "constructor" && !methods.includes(k)
        ),
      );
    }
  }
  return methods;
}
function getFieldNames(obj) {
  return Object.getOwnPropertyNames(obj).filter((n) =>
    typeof obj[n] !== "function"
  );
}
function getMethodArgNames(obj, methodName) {
  const prototype = Object.getPrototypeOf(obj);
  if (prototype.constructor.name === "Object") {
    return getFunctionArgNames(obj[methodName]);
  } else {
    return getFunctionArgNames(prototype[methodName]);
  }
}

// src/help.ts
var boldUnder = (str) => bold(underline(str));
function align(input) {
  const maxCol0 = input.reduce((prev, cur) => Math.max(prev, cur[0].length), 0);
  const maxCol1 = input.reduce((prev, cur) => Math.max(prev, cur[1].length), 0);
  const maxCol23 = input.reduce(
    (prev, cur) => Math.max(prev, cur[2].length + cur[3].length),
    0,
  ) + 1;
  return input.map(([col0, col1, col2, col3]) =>
    [
      col0.padStart(maxCol0),
      col1.padEnd(maxCol1) + " ",
      col2.padEnd(maxCol23 - col3.length),
      col3,
    ].join("").trimEnd()
  );
}
function genCommandHelp(obj, metadata, helpLines) {
  const methods = [
    ...Object.keys(metadata.methods).filter((m) =>
      !metadata.methods[m]?.hidden
    ),
    ...metadata.subcommands.filter((f) =>
      !metadata.fields[f]?.hidden && !metadata.methods[f]?.hidden
    ),
  ];
  if (methods.length > 0) {
    helpLines.push(boldUnder(`
Command${methods.length > 1 ? "s" : ""}:`));
    const linesCols = [];
    for (const method of methods) {
      let col1 = bold(`  ${method}`);
      if (!metadata.subcommands.includes(method)) {
        const args = getMethodArgNames(obj, method);
        if (args.length > 0) {
          col1 += " " + args.map((arg) => `<${arg}>`).join(" ");
        }
      } else {
        col1 += " --help | [sub Options / cmd / args]";
      }
      let col2 = metadata.methods?.[method]?.help ?? "";
      if (method === metadata.defaultCommand) {
        col2 += col2.length ? " " : "";
        col2 += bold("[default]");
      }
      linesCols.push([
        "",
        col1,
        col2,
        "",
      ]);
    }
    helpLines.push(...align(linesCols));
  }
}
function genOptionsHelp(obj, metadata, helpLines, config) {
  const allFields = Object.keys(metadata.fields);
  const fields = allFields.filter((f) => !metadata.fields[f]?.hidden);
  helpLines.push(boldUnder(`
Option${fields.length ? "s" : ""}:`));
  const linesCols = [];
  linesCols.push([
    bold(` -h,`),
    bold(` --help`),
    "Show this help",
    gray("[default: false]"),
  ]);
  if (config?.configCli || metadata.jsonConfig) {
    const configHelp = config?.configCli || metadata.jsonConfig;
    linesCols.push([
      bold(""),
      bold(` --config`),
      typeof configHelp === "string"
        ? configHelp
        : "Use this json file or string to read the options",
      gray("[string]"),
    ]);
  }
  for (const field of fields) {
    const alias2 = [
      ...metadata.fields[field]?.alias ?? [],
    ];
    const aliasHelp = alias2.map((a) =>
      a.length === 1 ? `-${a},` : `--${toKebabCase(a)},`
    ).join(" ");
    const col0 = bold(` ${aliasHelp}`);
    const col1 = bold(` --${toKebabCase(field)}`);
    let col2 = "";
    let col3 = "";
    const help2 = metadata.fields[field]?.help ?? "";
    if (help2) {
      col2 += help2;
    }
    const defaultValue = metadata.fields[field]?.defaultHelp ?? obj[field];
    if (defaultValue != void 0) {
      const defaultHelp2 = typeof defaultValue === "string"
        ? `"${defaultValue}"`
        : defaultValue;
      col3 = gray(`[default: ${defaultHelp2}]`);
    } else {
      const type2 = metadata.fields[field]?.type;
      if (type2) {
        col3 = gray(`[${type2}]`);
      }
    }
    linesCols.push([
      col0,
      col1,
      col2,
      col3,
    ]);
    if (metadata.fields[field]?.negatable) {
      linesCols.push([
        bold(" "),
        bold(` --${toKebabCase("no_" + field)}`),
        typeof metadata.fields[field]?.negatable === "string"
          ? metadata.fields[field]?.negatable
          : "",
        "",
      ]);
    }
  }
  helpLines.push(...align(linesCols));
}
function genHelp(obj, metadata, config) {
  const helpLines = [];
  if (metadata.help) {
    helpLines.push(metadata.help + "\n");
  }
  const name = Object.getPrototypeOf(obj).constructor.name;
  const mainFile = config?.mainFile ??
    config?.meta?.url?.replace(/.*\//, "./") ?? `<${name} file>`;
  let usage2 = `${boldUnder("Usage:")} `;
  if (metadata.usage) {
    usage2 = `${usage2}${metadata.usage}`;
  } else if (config?.noCommand || metadata.noCommand) {
    usage2 = `${usage2}${mainFile} [Options] [--] [args]`;
  } else {
    usage2 = `${usage2}${mainFile} [Options] [--] [command [command args]]`;
  }
  helpLines.push(usage2);
  if (!config?.noCommand && !metadata.noCommand) {
    genCommandHelp(obj, metadata, helpLines);
  }
  genOptionsHelp(obj, metadata, helpLines, config);
  return helpLines.join("\n");
}

// deno:https://jsr.io/@std/cli/1.0.21/parse_args.ts
var FLAG_REGEXP =
  /^(?:-(?:(?<doubleDash>-)(?<negated>no-)?)?)(?<key>.+?)(?:=(?<value>.+?))?$/s;
var LETTER_REGEXP = /[A-Za-z]/;
var NUMBER_REGEXP = /-?\d+(\.\d*)?(e-?\d+)?$/;
var HYPHEN_REGEXP = /^(-|--)[^-]/;
var VALUE_REGEXP = /=(?<value>.+)/;
var FLAG_NAME_REGEXP = /^--[^=]+$/;
var SPECIAL_CHAR_REGEXP = /\W/;
var NON_WHITESPACE_REGEXP = /\S/;
function isNumber(string) {
  return NON_WHITESPACE_REGEXP.test(string) && Number.isFinite(Number(string));
}
function setNested(object, keys, value, collect = false) {
  keys = [
    ...keys,
  ];
  const key = keys.pop();
  keys.forEach((key2) => object = object[key2] ??= {});
  if (collect) {
    const v = object[key];
    if (Array.isArray(v)) {
      v.push(value);
      return;
    }
    value = v
      ? [
        v,
        value,
      ]
      : [
        value,
      ];
  }
  object[key] = value;
}
function hasNested(object, keys) {
  for (const key of keys) {
    const value = object[key];
    if (!Object.hasOwn(object, key)) return false;
    object = value;
  }
  return true;
}
function aliasIsBoolean(aliasMap, booleanSet, key) {
  const set = aliasMap.get(key);
  if (set === void 0) return false;
  for (const alias2 of set) if (booleanSet.has(alias2)) return true;
  return false;
}
function isBooleanString(value) {
  return value === "true" || value === "false";
}
function parseBooleanString(value) {
  return value !== "false";
}
function parseArgs(args, options) {
  const {
    "--": doubleDash = false,
    alias: alias2 = {},
    boolean = false,
    default: defaults = {},
    stopEarly = false,
    string = [],
    collect = [],
    negatable: negatable2 = [],
    unknown: unknownFn = (i) => i,
  } = options ?? {};
  const aliasMap = /* @__PURE__ */ new Map();
  const booleanSet = /* @__PURE__ */ new Set();
  const stringSet = /* @__PURE__ */ new Set();
  const collectSet = /* @__PURE__ */ new Set();
  const negatableSet = /* @__PURE__ */ new Set();
  let allBools = false;
  if (alias2) {
    for (const [key, value] of Object.entries(alias2)) {
      if (value === void 0) {
        throw new TypeError("Alias value must be defined");
      }
      const aliases = Array.isArray(value) ? value : [
        value,
      ];
      aliasMap.set(key, new Set(aliases));
      aliases.forEach((alias3) =>
        aliasMap.set(
          alias3,
          /* @__PURE__ */ new Set([
            key,
            ...aliases.filter((it) => it !== alias3),
          ]),
        )
      );
    }
  }
  if (boolean) {
    if (typeof boolean === "boolean") {
      allBools = boolean;
    } else {
      const booleanArgs = Array.isArray(boolean) ? boolean : [
        boolean,
      ];
      for (const key of booleanArgs.filter(Boolean)) {
        booleanSet.add(key);
        aliasMap.get(key)?.forEach((al) => {
          booleanSet.add(al);
        });
      }
    }
  }
  if (string) {
    const stringArgs = Array.isArray(string) ? string : [
      string,
    ];
    for (const key of stringArgs.filter(Boolean)) {
      stringSet.add(key);
      aliasMap.get(key)?.forEach((al) => stringSet.add(al));
    }
  }
  if (collect) {
    const collectArgs = Array.isArray(collect) ? collect : [
      collect,
    ];
    for (const key of collectArgs.filter(Boolean)) {
      collectSet.add(key);
      aliasMap.get(key)?.forEach((al) => collectSet.add(al));
    }
  }
  if (negatable2) {
    const negatableArgs = Array.isArray(negatable2) ? negatable2 : [
      negatable2,
    ];
    for (const key of negatableArgs.filter(Boolean)) {
      negatableSet.add(key);
      aliasMap.get(key)?.forEach((alias3) => negatableSet.add(alias3));
    }
  }
  const argv = {
    _: [],
  };
  function setArgument(key, value, arg, collect2) {
    if (
      !booleanSet.has(key) && !stringSet.has(key) && !aliasMap.has(key) &&
      !(allBools && FLAG_NAME_REGEXP.test(arg)) &&
      unknownFn?.(arg, key, value) === false
    ) {
      return;
    }
    if (typeof value === "string" && !stringSet.has(key)) {
      value = isNumber(value) ? Number(value) : value;
    }
    const collectable = collect2 && collectSet.has(key);
    setNested(argv, key.split("."), value, collectable);
    aliasMap.get(key)?.forEach((key2) => {
      setNested(argv, key2.split("."), value, collectable);
    });
  }
  let notFlags = [];
  const index = args.indexOf("--");
  if (index !== -1) {
    notFlags = args.slice(index + 1);
    args = args.slice(0, index);
  }
  argsLoop: for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const groups = arg.match(FLAG_REGEXP)?.groups;
    if (groups) {
      const { doubleDash: doubleDash2, negated } = groups;
      let key = groups.key;
      let value = groups.value;
      if (doubleDash2) {
        if (value) {
          if (booleanSet.has(key)) value = parseBooleanString(value);
          setArgument(key, value, arg, true);
          continue;
        }
        if (negated) {
          if (negatableSet.has(key)) {
            setArgument(key, false, arg, false);
            continue;
          }
          key = `no-${key}`;
        }
        const next = args[i + 1];
        if (next) {
          if (
            !booleanSet.has(key) && !allBools && !next.startsWith("-") &&
            (!aliasMap.has(key) || !aliasIsBoolean(aliasMap, booleanSet, key))
          ) {
            value = next;
            i++;
            setArgument(key, value, arg, true);
            continue;
          }
          if (isBooleanString(next)) {
            value = parseBooleanString(next);
            i++;
            setArgument(key, value, arg, true);
            continue;
          }
        }
        value = stringSet.has(key) ? "" : true;
        setArgument(key, value, arg, true);
        continue;
      }
      const letters = arg.slice(1, -1).split("");
      for (const [j, letter] of letters.entries()) {
        const next = arg.slice(j + 2);
        if (next === "-") {
          setArgument(letter, next, arg, true);
          continue;
        }
        if (LETTER_REGEXP.test(letter)) {
          const groups2 = VALUE_REGEXP.exec(next)?.groups;
          if (groups2) {
            setArgument(letter, groups2.value, arg, true);
            continue argsLoop;
          }
          if (NUMBER_REGEXP.test(next)) {
            setArgument(letter, next, arg, true);
            continue argsLoop;
          }
        }
        if (letters[j + 1]?.match(SPECIAL_CHAR_REGEXP)) {
          setArgument(letter, arg.slice(j + 2), arg, true);
          continue argsLoop;
        }
        setArgument(letter, stringSet.has(letter) ? "" : true, arg, true);
      }
      key = arg.slice(-1);
      if (key === "-") continue;
      const nextArg = args[i + 1];
      if (nextArg) {
        if (
          !HYPHEN_REGEXP.test(nextArg) && !booleanSet.has(key) &&
          (!aliasMap.has(key) || !aliasIsBoolean(aliasMap, booleanSet, key))
        ) {
          setArgument(key, nextArg, arg, true);
          i++;
          continue;
        }
        if (isBooleanString(nextArg)) {
          const value2 = parseBooleanString(nextArg);
          setArgument(key, value2, arg, true);
          i++;
          continue;
        }
      }
      setArgument(key, stringSet.has(key) ? "" : true, arg, true);
      continue;
    }
    if (unknownFn?.(arg) !== false) {
      argv._.push(stringSet.has("_") || !isNumber(arg) ? arg : Number(arg));
    }
    if (stopEarly) {
      argv._.push(...args.slice(i + 1));
      break;
    }
  }
  for (const [key, value] of Object.entries(defaults)) {
    const keys = key.split(".");
    if (!hasNested(argv, keys)) {
      setNested(argv, keys, value);
      aliasMap.get(key)?.forEach((key2) =>
        setNested(argv, key2.split("."), value)
      );
    }
  }
  for (const key of booleanSet.keys()) {
    const keys = key.split(".");
    if (!hasNested(argv, keys)) {
      const value = collectSet.has(key) ? [] : false;
      setNested(argv, keys, value);
    }
  }
  for (const key of stringSet.keys()) {
    const keys = key.split(".");
    if (!hasNested(argv, keys) && collectSet.has(key)) {
      setNested(argv, keys, []);
    }
  }
  if (doubleDash) {
    argv["--"] = notFlags;
  } else {
    argv._.push(...notFlags);
  }
  return argv;
}

// src/parse_args.ts
function parseArgs2(obj, metadata, config) {
  const argsResult = {
    options: {},
    commandArgs: [],
  };
  const args = getArgs(config);
  const stringProp = [];
  const arrayProp = [];
  const booleanProp = [];
  const defaultValues = {};
  const alias2 = {
    help: [
      "h",
    ],
  };
  const negatable2 = Object.entries(metadata.fields).filter(([, v]) =>
    v?.negatable
  ).map(([k]) => k);
  for (const name of Object.keys(metadata.fields)) {
    alias2[name] = metadata.fields[name]?.alias ?? [];
    const kebabCase = toKebabCase(name);
    if (name !== kebabCase) {
      alias2[name].push(kebabCase);
    }
    switch (typeof obj[name]) {
      case "boolean":
        booleanProp.push(name);
        defaultValues[name] = obj[name];
        break;
      case "string":
        stringProp.push(name);
        break;
      case "object":
        if (Array.isArray(obj[name])) {
          arrayProp.push(name);
        }
    }
  }
  const stdRes = parseArgs(args, {
    negatable: negatable2,
    string: stringProp,
    boolean: booleanProp,
    collect: arrayProp,
    default: defaultValues,
    alias: alias2,
    stopEarly: true,
  });
  for (const key of Object.keys(stdRes)) {
    if (defaultValues[key] === stdRes[key]) {
      delete stdRes[key];
    }
    const keyCamel = toCamelCase(key);
    if (keyCamel !== key && defaultValues[keyCamel] === stdRes[key]) {
      delete stdRes[key];
    }
  }
  const fields = Object.keys(metadata.fields);
  const aliasKey = Object.values(alias2).flat();
  for (const [key, value] of Object.entries(stdRes)) {
    if (key === "_") {
      if (config?.noCommand || !!metadata.noCommand) {
        argsResult.command = metadata.defaultCommand ?? "main";
        argsResult.commandArgs = stdRes._;
      } else if (stdRes._.length > 0) {
        argsResult.command = stdRes._[0].toString();
        argsResult.commandArgs = stdRes._.slice(1);
      }
    } else {
      if (
        key !== "help" && !fields.includes(key) && !aliasKey.includes(key) &&
        !((config?.configCli || metadata.jsonConfig) && key === "config")
      ) {
        throw new Error(`The option "${key}" doesn't exist`, {
          cause: {
            clite: true,
          },
        });
      }
      if ((config?.configCli || metadata.jsonConfig) && key === "config") {
        argsResult.options[key] = value;
      } else {
        for (const [name, aliases] of Object.entries(alias2)) {
          if (name === key || aliases.includes(key)) {
            argsResult.options[name] = value;
            break;
          }
        }
      }
    }
  }
  return argsResult;
}
function fillFields(parseResult, obj, metadata, config) {
  const aliasNames = Object.entries(metadata.fields).flatMap(([, v]) =>
    v?.alias
  );
  const fields = Object.keys(metadata.fields);
  for (const option of getFieldNames(parseResult.options)) {
    if (fields.includes(option)) {
      if (metadata.isModule) {
        obj[`_set_${option}`](parseResult.options[option]);
      } else {
        obj[option] = parseResult.options[option];
      }
    } else if (fields.includes(toSnakeCase(option))) {
      if (metadata.isModule) {
        obj[`_set_${toSnakeCase(option)}`](parseResult.options[option]);
      } else {
        obj[toSnakeCase(option)] = parseResult.options[option];
      }
    } else if (
      !aliasNames.includes(option) &&
      (option !== "config" || !(config?.configCli || metadata.jsonConfig))
    ) {
      throw new Error(`The option "${option}" doesn't exist`, {
        cause: {
          clite: true,
        },
      });
    }
  }
}
function getArgs(config) {
  const gt = globalThis;
  return config?.args || gt["Deno"]?.args || gt["process"]?.argv.slice(2) || [];
}
function convertCommandArg(v) {
  switch (true) {
    case v === "true":
      return true;
    case v === "false":
      return false;
    case (typeof v === "string" && !isNaN(v) && !isNaN(parseFloat(v))):
      return parseFloat(v);
    default:
      return v;
  }
}

// src/command.ts
function processCommandResult(result, config) {
  if (result != void 0 && !config?.dontPrintResult) {
    Promise.resolve(result).then((res) => res != void 0 && console.log(res));
  }
}
function runCommand(res) {
  if (res.command === "--help") {
    console.error(res.help);
    return res.help;
  } else if (res.subcommand) {
    return runCommand(res.subcommand);
  } else {
    const result = res.obj[res.command](...res.commandArgs);
    processCommandResult(result, res.config);
    return result;
  }
}

// src/metadata.ts
function getCliteMetadata(obj, isModule = false) {
  const symb = getCliteSymbolMetadata(obj);
  const subcommands = [
    ...Object.keys(symb.subcommand ?? {}),
    ...Object.getOwnPropertyNames(obj).filter((prop) =>
      obj[`_${prop}_subcommand`] === true
    ),
  ];
  const allMethods = getMethodNames(obj);
  const methods = allMethods.filter((method) =>
    !method.startsWith("_") && !method.startsWith("#")
  );
  const constructorName = Object.getPrototypeOf(obj).constructor.name;
  const metadata = {
    isModule: !!isModule,
    fields: {},
    methods: {},
    defaultCommand: getDefaultCommand(methods),
    subcommands,
    help: symb.help?.[constructorName] ?? obj._help,
    usage: symb.usage?.[constructorName] ?? obj._usage,
    noCommand: symb.noCommand?.[constructorName] || obj._no_command,
    jsonConfig: symb.jsonConfig?.[constructorName] || obj._json_config,
  };
  getFieldNames(obj).filter((f) => !f.startsWith("_") && !f.startsWith("#"))
    .forEach((f) => {
      if (!isModule || allMethods.includes(`_set_${f}`)) {
        metadata.fields[f] = {
          alias: [
            ...symb.alias?.[f] || [],
            ...obj[`_${f}_alias`] ?? [],
          ],
          help: symb.help?.[f] || obj[`_${f}_help`],
          type: symb.types?.[f] ?? obj[`_${f}_type`],
          defaultHelp: symb.defaults?.[f] ?? obj[`_${f}_default`],
          negatable: symb.negatables?.[f] ?? obj[`_${f}_negatable`],
          hidden: symb.hidden?.[f] ?? obj[`_${f}_hidden`],
        };
      }
    });
  methods.forEach((method) =>
    metadata.methods[method] = {
      help: symb.help?.[method] || obj[method]._help || obj[`_${method}_help`],
      hidden: symb.hidden?.[method] ?? obj[`_${method}_hidden`],
    }
  );
  return metadata;
}
function getDefaultCommand(methods) {
  return methods.length == 1
    ? methods[0]
    : methods.includes("main")
    ? "main"
    : void 0;
}

// src/load_config.ts
import fs from "node:fs";
function loadConfig(parseResult, obj) {
  const pathOrJson = parseResult.options.config;
  try {
    if (pathOrJson.match(/^\s*{/)) {
      Object.assign(obj, JSON.parse(pathOrJson));
    } else {
      Object.assign(obj, JSON.parse(fs.readFileSync(pathOrJson, "utf8")));
    }
    obj.config = pathOrJson;
  } catch (error) {
    throw new Error(`Error while loading the config "${pathOrJson}"`, {
      cause: {
        clite: true,
        error,
      },
    });
  }
}

// src/clite_parser.ts
import { appendFileSync } from "node:fs";
import readline from "node:readline/promises";
import path from "node:path";
async function cliteRun(objOrClass, config) {
  let res;
  try {
    res = await cliteParse(objOrClass, config);
  } catch (e) {
    if (e.cause?.clite && e.cause?.relaunchAfterUpdate) {
      return;
    } else {
      throw e;
    }
  }
  if (res && (!config?.meta || config?.meta.main)) {
    try {
      return runCommand(res);
    } catch (e) {
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
function isImportMeta(obj) {
  return typeof obj === "object" && obj !== null &&
    Object.getPrototypeOf(obj) === null && "url" in obj;
}
async function handleMissingEsmSetter(meta, missingSetters) {
  const typescript = meta.filename.toLowerCase().endsWith(".ts");
  const setters = missingSetters.map((field) =>
    typescript
      ? `export const _set_${field} = (v: typeof ${field}) => (${field} = v);`
      : `export const _set_${field} = (v) => (${field} = v);`
  );
  const msg = [
    `This module contains exported variables without 'clite' setters : ${
      missingSetters.join(", ")
    }.`,
    `It's necessary for Clite to process options (= exported var/let) due to ESM security limitations.`,
    `You must append these lines to "${path.basename(meta.filename)}" :`,
    `${setters.map((s) => `    ${s}`).join("\n")}`,
    bold(
      `Do you want me to append this lines at the end of "${meta.filename}" now ?`,
    ),
  ];
  const userResp = await confirmDefaultTrue(bgYellow(msg.join("\n")));
  if (userResp) {
    const newCode = [
      "",
      "// Clite setters for options",
      ...setters,
    ].join("\n");
    appendFileSync(meta.filename, newCode);
    console.log(bgGreen(`File updated !`));
    console.log(bgYellow(`You must relaunch your command !`));
    throw new Error("file updated, relaunch !", {
      cause: {
        clite: true,
        relaunchAfterUpdate: true,
      },
    });
  } else {
    console.log(bgYellow(`Ignore these missing setters...`));
  }
}
async function getObj(objOrClass) {
  if (isImportMeta(objOrClass)) {
    const meta = objOrClass;
    const module = await import(meta.url);
    const obj = Object.create(
      Object.prototype,
      Object.getOwnPropertyDescriptors(module),
    );
    const allMethods = getMethodNames(obj);
    const fields = getFieldNames(obj);
    const missingSetters = fields.filter((field) =>
      !allMethods.includes(`_set_${field}`)
    );
    if (missingSetters.length) {
      await handleMissingEsmSetter(meta, missingSetters);
    }
    return obj;
  } else {
    return typeof objOrClass === "function" ? new objOrClass() : objOrClass;
  }
}
async function confirmDefaultTrue(message) {
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
async function cliteParse(objOrClass, config) {
  const obj = await getObj(objOrClass);
  const metadata = getCliteMetadata(obj, isImportMeta(objOrClass));
  const help2 = genHelp(obj, metadata, config);
  try {
    const parseResult = parseArgs2(obj, metadata, config);
    if (Object.keys(parseResult.options).includes("help")) {
      return {
        obj,
        command: "--help",
        commandArgs: [],
        config,
        help: help2,
      };
    } else {
      if (config?.configCli || metadata.jsonConfig) {
        if (Object.keys(parseResult.options).includes("config")) {
          loadConfig(parseResult, obj);
        } else {
          obj.config = void 0;
        }
      }
      const command = parseResult.command ?? metadata.defaultCommand;
      if (!command) {
        throw new Error(`no method defined or no "main" method`, {
          cause: {
            clite: true,
          },
        });
      }
      fillFields(parseResult, obj, metadata, config);
      if (metadata.subcommands.includes(command)) {
        const subcommandObj = typeof obj[command] === "function"
          ? new obj[command]()
          : obj[command];
        subcommandObj._clite_parent = obj;
        const args = parseResult.commandArgs.map((e) => e.toString());
        const subcommand2 = await cliteParse(subcommandObj, {
          ...config,
          args,
        });
        return {
          obj,
          command,
          commandArgs: [],
          config,
          help: help2,
          subcommand: subcommand2,
        };
      } else if (
        !Object.hasOwn(metadata.methods, command) &&
        !getMethodNames(obj).includes(command)
      ) {
        throw new Error(`The command "${command}" doesn't exist`, {
          cause: {
            clite: true,
          },
        });
      }
      const commandArgs = config?.dontConvertCmdArgs
        ? parseResult.commandArgs
        : parseResult.commandArgs.map(convertCommandArg);
      return {
        obj,
        command,
        commandArgs,
        config,
        help: help2,
      };
    }
  } catch (e) {
    if (e.cause?.clite || config?.printHelpOnError) {
      console.error(bgRed(bold("An error occurred ! The help :")));
      console.error(`${help2}
${bgRed(bold("The error :"))}`);
    }
    throw e;
  }
}
export {
  alias,
  cliteParse,
  cliteRun,
  defaultHelp,
  getCliteSymbolMetadata,
  help,
  hidden,
  jsonConfig,
  negatable,
  noCommand,
  subcommand,
  type,
  usage,
};
