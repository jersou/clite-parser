// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

const { Deno } = globalThis;
const noColor = typeof Deno?.noColor === "boolean" ? Deno.noColor : false;
let enabled = !noColor;
function code(open, close) {
    return {
        open: `\x1b[${open.join(";")}m`,
        close: `\x1b[${close}m`,
        regexp: new RegExp(`\\x1b\\[${close}m`, "g")
    };
}
function run(str, code) {
    return enabled ? `${code.open}${str.replace(code.regexp, code.open)}${code.close}` : str;
}
function bold(str) {
    return run(str, code([
        1
    ], 22));
}
function underline(str) {
    return run(str, code([
        4
    ], 24));
}
function gray(str) {
    return brightBlack(str);
}
function brightBlack(str) {
    return run(str, code([
        90
    ], 39));
}
new RegExp([
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TXZcf-nq-uy=><~]))"
].join("|"), "g");
function splitToWords(input) {
    input = input.replaceAll(/[^a-zA-Z0-9\s-_]/g, "");
    if (/[\s-_]+/.test(input)) return input.split(/[\s-_]+/);
    return input.split(/(?=[A-Z])+/);
}
function capitalizeWord(word) {
    return word ? word?.[0]?.toLocaleUpperCase() + word.slice(1).toLocaleLowerCase() : word;
}
function toCamelCase(input) {
    input = input.trim();
    const [first = "", ...rest] = splitToWords(input);
    return [
        first.toLocaleLowerCase(),
        ...rest.map(capitalizeWord)
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
const COMMENTS_REGEX = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENT_NAMES_REGEX = /\((?<args>.*?)\)/m;
function getFunctionArgNames(func) {
    const fnStr = func.toString().replace(COMMENTS_REGEX, "");
    const argNames = ARGUMENT_NAMES_REGEX.exec(fnStr);
    return argNames?.[1].length && argNames?.[1]?.replace(/\s*=\s*[^,]+\s*/g, "").split(",").map((arg)=>arg.replace(/[\s()]+/g, "")) || [];
}
function getMethodNames(obj) {
    return Object.getOwnPropertyNames(Object.getPrototypeOf(obj)).filter((n)=>n !== "constructor");
}
function getFieldNames(obj) {
    return Object.getOwnPropertyNames(obj);
}
function getMethodArgNames(obj, methodName) {
    return getFunctionArgNames(Object.getPrototypeOf(obj)[methodName]);
}
function getDefaultMethod(methods) {
    if (methods.length == 1) {
        return methods[0];
    } else {
        return methods.includes("main") ? "main" : undefined;
    }
}
function boldUnder(str) {
    return bold(underline(str));
}
function align(input) {
    const max = input.reduce((prev, curr)=>Math.max(prev, curr[0].trimEnd().length), 0);
    return input.map(([col1, col2])=>`${col1.padEnd(max)}  ${col2 ?? ""}`.trimEnd());
}
function genCommandHelp(obj, helpLines) {
    const allMethods = getMethodNames(obj);
    const methods = allMethods.filter((method)=>!method.startsWith("_"));
    const defaultCommand = getDefaultMethod(methods);
    if (methods.length > 0) {
        helpLines.push(boldUnder(`\nCommand${methods.length > 1 ? "s" : ""}:`));
        const linesCols = [];
        for (const method of methods){
            let col1 = bold(`  ${method}`);
            let col2 = "";
            const args = getMethodArgNames(obj, method);
            if (args.length > 0) {
                col1 += " " + args.map((arg)=>`<${arg}>`).join(" ");
            }
            const desc = obj[`_${method}_desc`] ?? "";
            if (desc) {
                col2 += gray(desc) + " ";
            }
            if (method === defaultCommand) {
                col2 += gray("(default)");
            }
            linesCols.push([
                col1,
                col2
            ]);
        }
        helpLines.push(...align(linesCols));
    }
}
function genOptionsHelp(obj, helpLines) {
    const allFields = getFieldNames(obj);
    const fields = allFields.filter((method)=>!method.startsWith("_"));
    helpLines.push(boldUnder(`\nOption${fields.length ? "s" : ""}:`));
    const linesCols = [];
    for (const field of fields){
        const col1 = bold(`  --${toKebabCase(field)}`) + gray(`=<${toSnakeCase(field).toUpperCase()}>`);
        let col2 = "";
        const desc = obj[`_${field}_desc`] ?? "";
        if (desc) {
            col2 += gray(desc) + " ";
        }
        const defaultValue = obj[field];
        if (defaultValue != undefined) {
            col2 += gray(`(default "${defaultValue}")`);
        }
        linesCols.push([
            col1,
            col2
        ]);
    }
    linesCols.push([
        bold(`  --help`) + gray(""),
        gray("Show this help")
    ]);
    helpLines.push(...align(linesCols));
}
function genHelp(obj) {
    const helpLines = [];
    if (obj._desc) {
        helpLines.push(obj._desc + "\n");
    }
    const usage = boldUnder("Usage:");
    const name = Object.getPrototypeOf(obj).constructor.name;
    helpLines.push(`${usage} <${name} file> [Options] [command [command args]]`);
    genCommandHelp(obj, helpLines);
    genOptionsHelp(obj, helpLines);
    return helpLines.join("\n");
}
function parseArgs(args) {
    const argsResult = {
        options: {},
        commandArgs: []
    };
    for (const arg of args){
        if (argsResult.command) {
            argsResult.commandArgs.push(arg);
        } else if (arg.startsWith("--")) {
            if (arg.includes("=")) {
                const [key, value] = arg.substring(2).split("=");
                argsResult.options[toCamelCase(key)] = value;
            } else {
                argsResult.options[toCamelCase(arg.substring(2))] = true;
            }
        } else {
            argsResult.command = arg;
        }
    }
    return argsResult;
}
function fillFields(parseResult, obj) {
    const fields = getFieldNames(obj);
    for (const option of getFieldNames(parseResult.options)){
        if (fields.includes(option)) {
            obj[option] = parseResult.options[option];
        } else if (fields.includes(toSnakeCase(option))) {
            obj[toSnakeCase(option)] = parseResult.options[option];
        } else {
            throw new Error(`The option "${option}" doesn't exist`);
        }
    }
}
function processResult(result, config) {
    if (result != undefined && !config?.dontPrintResult) {
        Promise.resolve(result).then((res)=>{
            if (res != undefined) {
                console.log(res);
            }
        });
    }
}
function runCommand(obj, command, cmdArgs, config) {
    const result = obj[command](...cmdArgs);
    processResult(result, config);
    return result;
}
function getArgs(config) {
    if (config?.args) {
        return config?.args;
    } else if (globalThis["Deno"]?.args) {
        return globalThis["Deno"]?.args;
    } else if (globalThis["process"]) {
        return globalThis["process"].argv.slice(2);
    } else {
        return [];
    }
}
function cliteRun(obj, config) {
    const parseResult = parseArgs(getArgs(config));
    if (getFieldNames(parseResult.options).includes("help")) {
        const help = genHelp(obj);
        console.log(help);
        return help;
    } else {
        const methods = getMethodNames(obj);
        const command = parseResult.command ?? getDefaultMethod(methods);
        if (!command) {
            throw new Error(`no method defined or no "main" method`);
        }
        if (!methods.includes(command)) {
            throw new Error(`The command "${command}" doesn't exist`);
        }
        fillFields(parseResult, obj);
        return runCommand(obj, command, parseResult.commandArgs, config);
    }
}
export { getFunctionArgNames as getFunctionArgNames };
export { getMethodNames as getMethodNames };
export { getFieldNames as getFieldNames };
export { getMethodArgNames as getMethodArgNames };
export { align as align };
export { genHelp as genHelp };
export { parseArgs as parseArgs };
export { cliteRun as cliteRun };
