import { assertEquals } from "@std/assert";
import {
  getFieldNames,
  getFunctionArgNames,
  getMethodArgNames,
  getMethodNames,
} from "./reflect.ts";
import { Tool } from "./test_data.test.ts";

Deno.test("getFunctionArgNames", () => {
  function funcTest(arg1: string, arg2: boolean, arg3: number) {
    console.log("funcTest", arg1, arg2, arg3);
  }

  const argNames = getFunctionArgNames(funcTest);
  assertEquals(argNames, ["arg1", "arg2", "arg3"]);
});

Deno.test("getMethodNames", () => {
  const tool = new Tool();
  assertEquals(getMethodNames(tool), ["up", "down", "clean", "_priv", "main"]);
});

Deno.test("getFieldNames", () => {
  const tool = new Tool();
  assertEquals(getFieldNames(tool), [
    "_help",
    "opt1",
    "opt2",
    "opt3",
    "opt_snake_case",
    "optCamelCase",
    "_hidden",
    "_opt3_help",
    "_clean_help",
    "_optCamelCase_help",
  ]);
});

Deno.test("getMethodArgNames", () => {
  const tool = new Tool();
  assertEquals(getMethodArgNames(tool, "down"), ["force", "timeout"]);
});

Deno.test("getMethodArgNames obj", () => {
  assertEquals(
    getMethodArgNames({
      down(_force: boolean, _timeout = 10) {
      },
    }, "down"),
    ["_force", "_timeout"],
  );
});
