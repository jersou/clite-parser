import type { Obj } from "./parse_args.ts";
import { getFieldNames, getMethodNames } from "./reflect.ts";
import { getMetadata } from "./decorators.ts";

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
  methods: string[]; // TODO test
  subcommands: string[];
  help?: string;
  usage?: string;
  noCommand?: boolean;
};

// TODO refactor reflect metadata
// TODO refactor @alias : string | string[]
export function getCliteMetadata<O extends Obj>(obj: O): Metadata<O> {
  const aliasMetadata = getMetadata(obj, "clite_alias");
  const helpMetadata = getMetadata(obj, "clite_help");
  const typesMetadata = getMetadata(obj, "clite_types");
  const defaultMetadata = getMetadata(obj, "clite_defaults");
  const negatableMetadata = getMetadata(obj, "clite_negatables");
  const hiddenMetadata = getMetadata(obj, "clite_hidden");
  const usageMetadata = getMetadata(obj, "clite_usage");
  const noCommandMetadata = getMetadata(obj, "clite_noCommand");

  const subcommandMetadata = (getMetadata(obj, "clite_subcommand")) ?? {};
  const subcommands = [
    ...Object.keys(subcommandMetadata),
    ...Object.getOwnPropertyNames(obj).filter(
      (prop) => obj[`_${prop}_subcommand`] === true,
    ),
  ];
  const methods = getMethodNames(obj)
    .filter((method) => !method.startsWith("_"));
  const constructorName = Object.getPrototypeOf(obj).constructor.name;
  const metadata: Metadata<O> = {
    fields: {},
    methods,
    defaultCommand: getDefaultCommand(methods),
    subcommands,
    help: helpMetadata?.[constructorName] ?? obj._help,
    usage: usageMetadata?.[constructorName] ?? obj._usage,
    noCommand: noCommandMetadata?.[constructorName] || obj._no_command,
  };

  const fields = getFieldNames(obj)
    .filter((f) => !(f as string).startsWith("_"));

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

  return metadata;
}

export function getDefaultCommand(methods: string[]) {
  if (methods.length == 1) {
    return methods[0];
  } else {
    return methods.includes("main") ? "main" : undefined;
  }
}
