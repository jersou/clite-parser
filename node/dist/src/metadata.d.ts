import type { Obj } from "./types.d.ts";
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
  defaultCommand?: string;
  methods: {
    [key in keyof O]?: {
      help?: string;
      hidden?: boolean;
    };
  };
  subcommands: string[];
  help?: string;
  usage?: string;
  noCommand?: boolean;
  jsonConfig?: boolean;
};
export declare function getCliteMetadata<O extends Obj>(obj: O): Metadata<O>;
export declare function getDefaultCommand(methods: string[]): string;
