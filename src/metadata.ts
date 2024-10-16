import type { Obj } from "./parse_args.ts";
import { getFieldNames, getMethodNames } from "./reflect.ts";
import { getSymbolMetadata } from "./decorators.ts";

export type Metadata<O extends Obj> = {
  fields: {
    [key in keyof O]?: {
      alias?: string[];
      help?: string;
      type?: string;
      defaultHelp?: string;
      negatable?: string | boolean;
      hidden?: boolean;
    };
  };
  defaultCommand?: string; // TODO test
  methods: {
    [key in keyof O]?: {
      help?: string; // TODO test
      hidden?: boolean; // TODO test
    };
  }; // TODO test // TODO params
  subcommands: string[];
  help?: string;
  usage?: string;
  noCommand?: boolean;
};

// TODO refactor reflect metadata
// TODO refactor @alias : string | string[]
export function getCliteMetadata<O extends Obj>(obj: O): Metadata<O> {
  const aliasMetadata = getSymbolMetadata(obj, "clite_alias");
  const helpMetadata = getSymbolMetadata(obj, "clite_help");
  const typesMetadata = getSymbolMetadata(obj, "clite_types");
  const defaultMetadata = getSymbolMetadata(obj, "clite_defaults");
  const negatableMetadata = getSymbolMetadata(obj, "clite_negatables");
  const hiddenMetadata = getSymbolMetadata(obj, "clite_hidden");
  const usageMetadata = getSymbolMetadata(obj, "clite_usage");
  const noCommandMetadata = getSymbolMetadata(obj, "clite_noCommand");

  const subcommandMetadata = (getSymbolMetadata(obj, "clite_subcommand")) ?? {};
  const subcommands = [
    ...Object.keys(subcommandMetadata),
    ...Object.getOwnPropertyNames(obj).filter(
      (prop) => obj[`_${prop}_subcommand`] === true,
    ),
  ];
  const methods = getMethodNames(obj)
    .filter((method) => !method.startsWith("_") && !method.startsWith("#"));
  const constructorName = Object.getPrototypeOf(obj).constructor.name;
  const metadata: Metadata<O> = {
    fields: {},
    methods: {},
    defaultCommand: getDefaultCommand(methods),
    subcommands,
    help: helpMetadata?.[constructorName] ?? obj._help,
    usage: usageMetadata?.[constructorName] ?? obj._usage,

    noCommand: noCommandMetadata?.[constructorName] || obj._no_command,
  };

  const fields = (getFieldNames(obj) as string[])
    .filter((f) => !f.startsWith("_") && !f.startsWith("#"));

  for (const field of fields as string[]) {
    metadata.fields[field as keyof O] = {
      alias: [
        ...(obj[`_${field}_alias`] ?? []),
        ...(aliasMetadata?.[field] || []),
      ],
      help: helpMetadata?.[field] || obj[`_${field}_help`],
      type: typesMetadata?.[field] ?? obj[`_${field}_type`],
      defaultHelp: defaultMetadata?.[field] ?? obj[`_${field}_default`],
      negatable: negatableMetadata?.[field] ?? obj[`_${field}_negatable`],
      hidden: hiddenMetadata?.[field] ?? obj[`_${field}_hidden`],
    };
  }

  for (const method of methods as string[]) {
    metadata.methods[method as keyof O] = {
      help: helpMetadata?.[method] || obj[`_${method}_help`],
      hidden: hiddenMetadata?.[method] ?? obj[`_${method}_hidden`],
    };
  }

  return metadata;
}

export function getDefaultCommand(methods: string[]) {
  if (methods.length == 1) {
    return methods[0];
  } else {
    return methods.includes("main") ? "main" : undefined;
  }
}
