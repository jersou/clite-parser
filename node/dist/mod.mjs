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
  return Object.getPrototypeOf(obj).constructor[Symbol.metadata]?.clite || {};
}
function help(description) {
  return (target, prop) => addSymbolMetadata(target, prop, "help", description);
}
function alias(alias) {
  return (target, prop) => addSymbolMetadata(target, prop, "alias", alias);
}
function type(typeHelp) {
  return (target, prop) => addSymbolMetadata(target, prop, "types", typeHelp);
}
function negatable(help = true) {
  return (target, prop) => addSymbolMetadata(target, prop, "negatables", help);
}
function defaultHelp(defaultHelp) {
  return (target, prop) =>
    addSymbolMetadata(target, prop, "defaults", defaultHelp);
}
function usage(usage) {
  return (target, prop) => addSymbolMetadata(target, prop, "usage", usage);
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
function jsonConfig(help = true) {
  return (target, prop) => addSymbolMetadata(target, prop, "jsonConfig", help);
}
export { getCliteSymbolMetadata as getCliteSymbolMetadata };
export { help as help };
export { alias as alias };
export { type as type };
export { negatable as negatable };
export { defaultHelp as defaultHelp };
export { usage as usage };
export { hidden as hidden };
export { subcommand as subcommand };
export { noCommand as noCommand };
export { jsonConfig as jsonConfig };
const { Deno: Deno1 } = globalThis;
const noColor = typeof Deno1?.noColor === "boolean" ? Deno1.noColor : false;
let enabled = !noColor;
function code(open, close) {
  return {
    open: `\x1b[${open.join(";")}m`,
    close: `\x1b[${close}m`,
    regexp: new RegExp(`\\x1b\\[${close}m`, "g"),
  };
}
function run(str, code) {
  return enabled
    ? `${code.open}${str.replace(code.regexp, code.open)}${code.close}`
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
new RegExp(
  [
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TXZcf-nq-uy=><~]))",
  ].join("|"),
  "g",
);
const { ceil } = Math;
new Uint32Array(0x110000);
const CAPITALIZED_WORD_REGEXP = /\p{Lu}\p{Ll}+/u;
const ACRONYM_REGEXP = /\p{Lu}+(?=(\p{Lu}\p{Ll})|\P{L}|\b)/u;
const LOWERCASED_WORD_REGEXP = /(\p{Ll}+)/u;
const ANY_LETTERS = /\p{L}+/u;
const DIGITS_REGEXP = /\p{N}+/u;
const WORD_OR_NUMBER_REGEXP = new RegExp(
  `${CAPITALIZED_WORD_REGEXP.source}|${ACRONYM_REGEXP.source}|${LOWERCASED_WORD_REGEXP.source}|${ANY_LETTERS.source}|${DIGITS_REGEXP.source}`,
  "gu",
);
function splitToWords(input) {
  return input.match(WORD_OR_NUMBER_REGEXP) ?? [];
}
function capitalizeWord(word) {
  return word
    ? word?.[0]?.toLocaleUpperCase() + word.slice(1).toLocaleLowerCase()
    : word;
}
function toCamelCase(input) {
  input = input.trim();
  const [first = "", ...rest] = splitToWords(input);
  return [
    first.toLocaleLowerCase(),
    ...rest.map(capitalizeWord),
  ].join("");
}
function toKebabCase(input) {
  input = input.trim();
  return splitToWords(input).join("-").toLocaleLowerCase();
}
function toSnakeCase(input) {
  input = input.trim();
  return splitToWords(input).join("_").toLocaleLowerCase();
}
const COMMENTS_REGEX = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;
const ARGUMENT_NAMES_REGEX = /\((?<args>.*?)\)/m;
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
const boldUnder = (str) => bold(underline(str));
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
    helpLines.push(boldUnder(`\nCommand${methods.length > 1 ? "s" : ""}:`));
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
  helpLines.push(boldUnder(`\nOption${fields.length ? "s" : ""}:`));
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
    const alias = [
      ...metadata.fields[field]?.alias ?? [],
    ];
    const aliasHelp = alias.map((a) =>
      a.length === 1 ? `-${a},` : `--${toKebabCase(a)},`
    ).join(" ");
    const col0 = bold(` ${aliasHelp}`);
    const col1 = bold(` --${toKebabCase(field)}`);
    let col2 = "";
    let col3 = "";
    const help = metadata.fields[field]?.help ?? "";
    if (help) {
      col2 += help;
    }
    const defaultValue = metadata.fields[field]?.defaultHelp ?? obj[field];
    if (defaultValue != undefined) {
      const defaultHelp = typeof defaultValue === "string"
        ? `"${defaultValue}"`
        : defaultValue;
      col3 = gray(`[default: ${defaultHelp}]`);
    } else {
      const type = metadata.fields[field]?.type;
      if (type) {
        col3 = gray(`[${type}]`);
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
  let usage = `${boldUnder("Usage:")} `;
  if (metadata.usage) {
    usage = `${usage}${metadata.usage}`;
  } else if (config?.noCommand || metadata.noCommand) {
    usage = `${usage}${mainFile} [Options] [--] [args]`;
  } else {
    usage = `${usage}${mainFile} [Options] [--] [command [command args]]`;
  }
  helpLines.push(usage);
  if (!config?.noCommand && !metadata.noCommand) {
    genCommandHelp(obj, metadata, helpLines);
  }
  genOptionsHelp(obj, metadata, helpLines, config);
  return helpLines.join("\n");
}
const FLAG_REGEXP =
  /^(?:-(?:(?<doubleDash>-)(?<negated>no-)?)?)(?<key>.+?)(?:=(?<value>.+?))?$/s;
const LETTER_REGEXP = /[A-Za-z]/;
const NUMBER_REGEXP = /-?\d+(\.\d*)?(e-?\d+)?$/;
const HYPHEN_REGEXP = /^(-|--)[^-]/;
const VALUE_REGEXP = /=(?<value>.+)/;
const FLAG_NAME_REGEXP = /^--[^=]+$/;
const SPECIAL_CHAR_REGEXP = /\W/;
const NON_WHITESPACE_REGEXP = /\S/;
function isNumber(string) {
  return NON_WHITESPACE_REGEXP.test(string) && Number.isFinite(Number(string));
}
function setNested(object, keys, value, collect = false) {
  keys = [
    ...keys,
  ];
  const key = keys.pop();
  keys.forEach((key) => object = object[key] ??= {});
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
  if (set === undefined) return false;
  for (const alias of set) if (booleanSet.has(alias)) return true;
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
    alias = {},
    boolean: __boolean = false,
    default: defaults = {},
    stopEarly = false,
    string = [],
    collect = [],
    negatable = [],
    unknown: unknownFn = (i) => i,
  } = options ?? {};
  const aliasMap = new Map();
  const booleanSet = new Set();
  const stringSet = new Set();
  const collectSet = new Set();
  const negatableSet = new Set();
  let allBools = false;
  if (alias) {
    for (const [key, value] of Object.entries(alias)) {
      if (value === undefined) {
        throw new TypeError("Alias value must be defined");
      }
      const aliases = Array.isArray(value) ? value : [
        value,
      ];
      aliasMap.set(key, new Set(aliases));
      aliases.forEach((alias) =>
        aliasMap.set(
          alias,
          new Set([
            key,
            ...aliases.filter((it) => it !== alias),
          ]),
        )
      );
    }
  }
  if (__boolean) {
    if (typeof __boolean === "boolean") {
      allBools = __boolean;
    } else {
      const booleanArgs = Array.isArray(__boolean) ? __boolean : [
        __boolean,
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
  if (negatable) {
    const negatableArgs = Array.isArray(negatable) ? negatable : [
      negatable,
    ];
    for (const key of negatableArgs.filter(Boolean)) {
      negatableSet.add(key);
      aliasMap.get(key)?.forEach((alias) => negatableSet.add(alias));
    }
  }
  const argv = {
    _: [],
  };
  function setArgument(key, value, arg, collect) {
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
    const collectable = collect && collectSet.has(key);
    setNested(argv, key.split("."), value, collectable);
    aliasMap.get(key)?.forEach((key) => {
      setNested(argv, key.split("."), value, collectable);
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
      const { doubleDash, negated } = groups;
      let key = groups.key;
      let value = groups.value;
      if (doubleDash) {
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
          const groups = VALUE_REGEXP.exec(next)?.groups;
          if (groups) {
            setArgument(letter, groups.value, arg, true);
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
          const value = parseBooleanString(nextArg);
          setArgument(key, value, arg, true);
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
      aliasMap.get(key)?.forEach((key) =>
        setNested(argv, key.split("."), value)
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
function parseArgs1(obj, metadata, config) {
  const argsResult = {
    options: {},
    commandArgs: [],
  };
  const args = getArgs(config);
  const stringProp = [];
  const arrayProp = [];
  const booleanProp = [];
  const defaultValues = {};
  const alias = {
    help: [
      "h",
    ],
  };
  const negatable = Object.entries(metadata.fields).filter(([, v]) =>
    v?.negatable
  ).map(([k]) => k);
  for (const name of Object.keys(metadata.fields)) {
    alias[name] = metadata.fields[name]?.alias ?? [];
    const kebabCase = toKebabCase(name);
    if (name !== kebabCase) {
      alias[name].push(kebabCase);
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
    negatable: negatable.map(toKebabCase),
    string: stringProp.map(toKebabCase),
    boolean: booleanProp.map(toKebabCase),
    collect: arrayProp.map(toKebabCase),
    default: defaultValues,
    alias,
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
  const fieldsKebabCase = fields.map(toKebabCase);
  const aliasKey = Object.values(alias).flat();
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
        key !== "help" && !fieldsKebabCase.includes(key) &&
        !fields.includes(key) && !aliasKey.includes(key) &&
        !((config?.configCli || metadata.jsonConfig) && key === "config")
      ) {
        throw new Error(`The option "${key}" doesn't exist`, {
          cause: {
            clite: true,
          },
        });
      }
      argsResult.options[toCamelCase(key)] = value;
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
      obj[option] = parseResult.options[option];
    } else if (fields.includes(toSnakeCase(option))) {
      obj[toSnakeCase(option)] = parseResult.options[option];
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
    case typeof v === "string" && !isNaN(v) && !isNaN(parseFloat(v)):
      return parseFloat(v);
    default:
      return v;
  }
}
function processCommandResult(result, config) {
  if (result != undefined && !config?.dontPrintResult) {
    Promise.resolve(result).then((res) => res != undefined && console.log(res));
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
function getCliteMetadata(obj) {
  const symb = getCliteSymbolMetadata(obj);
  const subcommands = [
    ...Object.keys(symb.subcommand ?? {}),
    ...Object.getOwnPropertyNames(obj).filter((prop) =>
      obj[`_${prop}_subcommand`] === true
    ),
  ];
  const methods = getMethodNames(obj).filter((method) =>
    !method.startsWith("_") && !method.startsWith("#")
  );
  const constructorName = Object.getPrototypeOf(obj).constructor.name;
  const metadata = {
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
    .forEach((f) =>
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
      }
    );
  methods.forEach((method) =>
    metadata.methods[method] = {
      help: symb.help?.[method] || obj[`_${method}_help`],
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
    : undefined;
}
import fs from "node:fs";
function loadConfig(parseResult, obj) {
  const pathOrJson = parseResult.options.config;
  try {
    if (pathOrJson.match(/^\s*{/)) {
      Object.assign(obj, JSON.parse(pathOrJson));
    } else {
      if (globalThis["Deno"]?.args) {
        Object.assign(obj, JSON.parse(Deno.readTextFileSync(pathOrJson)));
      } else if (fs) {
        Object.assign(obj, JSON.parse(fs.readFileSync(pathOrJson, "utf8")));
      } else {
        throw new Error("Load config is not implemented in this runtime");
      }
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
function cliteRun(objOrClass, config) {
  const res = cliteParse(objOrClass, config);
  if (!config?.meta || config?.meta.main) {
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
function cliteParse(objOrClass, config) {
  const obj = typeof objOrClass === "function" ? new objOrClass() : objOrClass;
  const metadata = getCliteMetadata(obj);
  const help = genHelp(obj, metadata, config);
  try {
    const parseResult = parseArgs1(obj, metadata, config);
    if (Object.keys(parseResult.options).includes("help")) {
      return {
        obj,
        command: "--help",
        commandArgs: [],
        config,
        help,
      };
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
        const subcommand = cliteParse(subcommandObj, {
          ...config,
          args,
        });
        return {
          obj,
          command,
          commandArgs: [],
          config,
          help,
          subcommand,
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
        help,
      };
    }
  } catch (e) {
    if (e.cause?.clite || config?.printHelpOnError) {
      console.error(bgRed(bold("An error occurred ! The help :")));
      console.error(`${help}\n${bgRed(bold("The error :"))}`);
    }
    throw e;
  }
}
export { cliteRun as cliteRun };
export { cliteParse as cliteParse };
