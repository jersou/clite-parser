import type { Obj } from "./parse_args.ts";
import { getFieldNames, getMethodNames } from "./reflect.ts";
import { getCliteSymbolMetadata } from "./decorators.ts";

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
  methods: { // TODO test
    [key in keyof O]?: {
      help?: string; // TODO test
      hidden?: boolean; // TODO test
    };
  };
  subcommands: string[];
  help?: string;
  usage?: string;
  noCommand?: boolean;
};

export function getCliteMetadata<O extends Obj>(obj: O): Metadata<O> {
  const symb = getCliteSymbolMetadata(obj);
  const subcommands = [
    ...Object.keys(symb.subcommand ?? {}),
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
    help: symb.help?.[constructorName] ?? obj._help,
    usage: symb.usage?.[constructorName] ?? obj._usage,
    noCommand: symb.noCommand?.[constructorName] || obj._no_command,
  };

  (getFieldNames(obj) as string[])
    .filter((f) => !f.startsWith("_") && !f.startsWith("#"))
    .forEach((f) => (metadata.fields[f as keyof O] = {
      alias: [...(symb.alias?.[f] || []), ...(obj[`_${f}_alias`] ?? [])],
      help: symb.help?.[f] || obj[`_${f}_help`],
      type: symb.types?.[f] ?? obj[`_${f}_type`],
      defaultHelp: symb.defaults?.[f] ?? obj[`_${f}_default`],
      negatable: symb.negatables?.[f] ?? obj[`_${f}_negatable`],
      hidden: symb.hidden?.[f] ?? obj[`_${f}_hidden`],
    }));

  methods.forEach(
    (method) => (metadata.methods[method as keyof O] = {
      help: symb.help?.[method] || obj[`_${method}_help`],
      hidden: symb.hidden?.[method] ?? obj[`_${method}_hidden`],
    }),
  );

  return metadata;
}

export function getDefaultCommand(methods: string[]) {
  return methods.length == 1
    ? methods[0]
    : (methods.includes("main") ? "main" : undefined);
}
