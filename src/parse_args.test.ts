import { assertEquals, assertThrows } from "@std/assert";
import {
  convertCommandArg,
  getArgs,
  parseArgs,
  type ParseResult,
} from "./parse_args.ts";
import { alias, cliteParse } from "../clite_parser.ts";
import { getCliteMetadata } from "./metadata.ts";

Deno.test("args regex", () => {
  const result = "force, timeout = 10"
    .replace(/\s*=\s*[^,]+\s*/g, "")
    .split(",")
    .map((arg) => arg.trim());
  assertEquals(result, ["force", "timeout"]);
});

Deno.test("parseArgs", () => {
  const obj = {
    opt2: true,
    opt3: "ee",
    optSnakeCase: 1,
    optCamelCase: 4,
  };
  const parseResult = parseArgs(obj, getCliteMetadata(obj), {
    args: [
      "--opt2=false",
      "--opt3=qsdf",
      "--opt-snake-case=123",
      "--opt-camel-case=456",
      "down",
      "true",
      "12s",
    ],
  });
  const expected: ParseResult = {
    options: {
      opt2: false,
      opt3: "qsdf",
      optSnakeCase: 123,
      optCamelCase: 456,
    },
    command: "down",
    commandArgs: ["true", "12s"],
  };
  assertEquals(parseResult, expected);
});

Deno.test("parseArgs noCommand", () => {
  const obj = {
    opt2: true,
    opt3: "ee",
    optSnakeCase: 1,
    optCamelCase: 4,
  };
  const parseResult = parseArgs(obj, getCliteMetadata(obj), {
    args: [
      "--opt2=false",
      "--opt3=qsdf",
      "--opt-snake-case=123",
      "--opt-camel-case=456",
      "down",
      "true",
      "12s",
    ],
    noCommand: true,
  });
  const expected: ParseResult = {
    options: {
      opt2: false,
      opt3: "qsdf",
      optSnakeCase: 123,
      optCamelCase: 456,
    },
    command: "main",
    commandArgs: ["down", "true", "12s"],
  };
  assertEquals(parseResult, expected);
});

Deno.test("parseArgs full", () => {
  const obj = {
    opt1: 1,
    opt2: true,
    optSnakeCase: 1,
    a: false,
    b: false,
    c: false,
    o: 1,
    u: "a",
  };
  const parseResult = parseArgs(obj, getCliteMetadata(obj), {
    args: [
      "--opt1=123",
      "--opt2=false",
      "-u=qsdf",
      "-abc",
      "--opt-snake-case",
      "123",
      "-o",
      "456",
      "--",
      "down",
      "true",
      "-y",
      "12s",
    ],
  });

  const expected: ParseResult = {
    options: {
      opt1: 123,
      opt2: false,
      u: "qsdf",
      a: true,
      b: true,
      c: true,
      optSnakeCase: 123,
      o: 456,
    },
    command: "down",
    commandArgs: ["true", "-y", "12s"],
  };
  assertEquals(parseResult, expected);
});

class ToolBooleanBeforeCmd {
  retry = 1;
  dryRun = false;
  mainFunc(arg1: string, arg2: string) {
    console.log(this, { arg1, arg2 });
  }
}
Deno.test({
  name: "ToolBooleanBeforeCmd",
  fn() {
    const res = cliteParse(ToolBooleanBeforeCmd, {
      args: ["--retry", "2", "--dry-run", "mainFunc", "bar"],
    });
    assertEquals(res.commandArgs, ["bar"]);
    assertEquals(res.command, "mainFunc");
    assertEquals(res.obj.dryRun, true);
    assertEquals(res.obj.retry, 2);
  },
});

Deno.test({
  name: "ToolBooleanBeforeCmdNoCmd",
  fn() {
    const res = cliteParse(ToolBooleanBeforeCmd, {
      args: ["--retry", "2", "--dry-run", "foo", "bar"],
      noCommand: true,
    });
    assertEquals(res.commandArgs, ["foo", "bar"]);
    assertEquals(res.command, "mainFunc");
    assertEquals(res.obj.dryRun, true);
    assertEquals(res.obj.retry, 2);
  },
});

Deno.test({
  name: "Throw if the option is not found",
  fn() {
    class Tool {
      main() {}
    }
    assertThrows(() => {
      cliteParse(Tool, { args: ["--not-exist"] });
    });
  },
});

Deno.test({
  name: "array option",
  fn() {
    class Tool {
      @alias("a")
      arr: string[] = [];
      main() {}
    }
    const res = cliteParse(Tool, {
      args: ["--arr=aa", "--arr", "bb", "-a=cc", "-a", "dd", "--a", "ee"],
    });
    assertEquals(res.obj.arr, ["aa", "bb", "cc", "dd", "ee"]);
  },
});

Deno.test({
  name: "array option",
  fn() {
    class Tool {
      ac = {};
      main() {}
    }
    const res = cliteParse(Tool, {
      args: ["--ac.bb", "aaa", "--ac.dd.ee", "v", "--ac.dd.ff", "w"],
    });
    assertEquals(res.obj.ac, { bb: "aaa", dd: { ee: "v", ff: "w" } });
  },
});

Deno.test({
  name: "unknown option",
  fn() {
    class Tool {
      main() {}
    }
    assertThrows(() =>
      cliteParse(Tool, {
        args: ["--config", "aaa"],
      })
    );
  },
});

Deno.test({
  name: "_alias",
  fn() {
    class Tool_Alias {
      foo = 12;
      _foo_alias = "f";
      main() {}
    }
    const result = cliteParse(Tool_Alias, { args: ["-f5"] });
    assertEquals(result.obj.foo, 5);
  },
});

Deno.test({
  name: "convertCommandArg",
  fn() {
    assertEquals(convertCommandArg("str"), "str");
    assertEquals(convertCommandArg("5"), 5);
    assertEquals(convertCommandArg("true"), true);
    assertEquals(convertCommandArg("false"), false);
  },
});

Deno.test({
  name: "getArgs",
  fn() {
    assertEquals(getArgs({ args: ["1"] }), ["1"]);
    assertEquals(getArgs(), []);
  },
});

Deno.test({
  name: "_negatable",
  fn() {
    class Tool {
      _dryRun_negatable = true;
      dryRun = true;
      main() {}
    }
    const res = cliteParse(Tool, { args: ["--no-dry-run"] });
    assertEquals(res.obj.dryRun, false);
  },
});
