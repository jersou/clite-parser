import { assertEquals } from "jsr:@std/assert@1.0.5";
import {cliteRun, DontRunResult} from "./clite_parser.ts";
import { genHelp } from "./src/help.ts";
import { Tool } from "./src/test_data.test.ts";

Deno.test("cliteRun", () => {
  const result = cliteRun(new Tool(), {
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
  const expected = `down force=true timeout=12s
    opt1=123
    opt2=false
    opt3=qsdf
    opt_snake_case=123
    optCamelCase=456`;
  assertEquals(result, expected);
});

Deno.test("cliteRun help", () => {
  const result = cliteRun(new Tool(), {
    args: ["--help"],
  });
  const expected = genHelp(new Tool());
  assertEquals(result, expected);
});


Deno.test("cliteRun dontRun", () => {
  const result = cliteRun(Tool, { args:["--opt1=78","down","true"],dontRun:true }) as DontRunResult;
  assertEquals(result.command, "down");
  assertEquals(result.commandArgs,[ true ]);
});
