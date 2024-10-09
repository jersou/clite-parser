# CLI lite parser for Node and Deno

[![JSR](https://jsr.io/badges/@jersou/clite)](https://jsr.io/@jersou/clite)
[![JSR Score](https://jsr.io/badges/@jersou/clite/score)](https://jsr.io/@jersou/clite)
[![Built with the Deno Standard Library](https://img.shields.io/badge/Built_with_std-blue?logo=deno)](https://jsr.io/@std)

**CliteParser generate CLI from a class** (or plain object), each method
generate a "command", each field generate an "option". **example-lite.ts
example** :

```typescript
#!/usr/bin/env -S deno run
import { cliteRun } from "jsr:@jersou/clite@0.5.0";
// or after "deno add @jersou/clite" : import { cliteRun } from "@jersou/clite";
// or for Node usage, after "npx jsr add @jersou/clite" (same import from "@jersou/clite")

class Tool {
  retry = 2;
  webUrl = "none"; // fields are converted to kebab case as global options
  no_color; // → --no-color

  main() {
    console.log("main command", this);
  }
  up() {
    console.log("up command", this);
  }
  down(force, timeout) {
    console.log("down command", { force, timeout }, this);
  }
}

cliteRun(new Tool());
```

## The help is generated automatically:

![help image](./help-lite-lite.png)

<!-- Plain text (without color and styles in markdown):

$ # with Deno : "deno run example-lite-lite.ts --help"
$ #          or if the is shebang is present:
$ ./example-lite-lite.ts --help
Usage: <Tool file> [Options] [command [command args]]

Commands:
  main                    (default)
  up
  down <force> <timeout>

Options:
  --retry=<RETRY>        (default "2")
  --web-url=<WEB_URL>    (default "none")
  --no-color=<NO_COLOR>
  --help                 Show this help

-->

## Run the commands with options and arguments

```shell
#                        ↓↓↓↓↓↓↓↓↓↓↓↓↓ options ↓↓↓↓↓↓↓↓↓↓↓↓↓  ↓ command ↓  ↓ cmd args ↓
$ ./example-lite-lite.ts --retry=4 --web-url=tttt --no-color     down        true  14
down command { force: "true", timeout: "14" } Tool { retry: "4", webUrl: "tttt", no_color: true }

$ ./example-lite-lite.ts down true 14
down command { force: "true", timeout: "14" } Tool { retry: 2, webUrl: "none", no_color: undefined }

$ ./example-lite-lite.ts  --retry=4 --web-url=tttt --no-color
main command Tool { retry: "4", webUrl: "tttt", no_color: true }

$ deno https://raw.githubusercontent.com/jersou/clite-parser/refs/heads/main/examples/example-lite-lite.ts  --retry=4 --web-url=tttt --no-color   down     true  14
down command { force: "true", timeout: "14" } Tool { retry: "4", webUrl: "tttt", no_color: true }
```

## Help description

**The decorator @help can also be used, see the next section.**

Optional fields `_<filed or method name>_help` or `_<filed or method name>_desc`
are displayed as description in the help (_desc is deprecated) :

```typescript
#!/usr/bin/env -S deno run -A
import { cliteRun } from "jsr:@jersou/clite@0.5.0";

class Tool {
  _help = "This tool is a little example of CliteParser"; // optional description
  retry = 2;
  webUrl = "none"; // fields are converted to kebab case as global options
  no_color?: string | boolean; // → --no-color
  _no_color_help = "skip colorize"; // optional description for "no_color" field
  _up_help = "create and start"; // optional description for "up" command

  main() {
    console.log("main command", this);
  }

  up() {
    console.log("up command", this);
  }

  down(force: boolean, timeout: number) {
    console.log("down command", { force, timeout }, this);
  }
}

if (import.meta.main) { // if the file is imported, do not execute this block
  cliteRun(new Tool());
}
```

![help image](./help-lite.png)

<!-- Plain text (without color and styles in markdown):

This tool is a little example of CliteParser

Usage: <Tool file> [Options] [command [command args]]

Commands:
  main                    (default)
  up                      create and start
  down <force> <timeout>

Options:
  --retry=<RETRY>        (default "2")
  --web-url=<WEB_URL>    (default "none")
  --no-color=<NO_COLOR>  skip colorize
  --help                 Show this help

-->

## Help description with the `@help` decorator

```typescript
import { cliteRun, help } from "jsr:@jersou/clite@0.5.0";

@help("This tool is a little example of CliteParser")
class Tool {
  retry = 2;
  webUrl = "none"; // fields are converted to kebab case as global options

  @help("skip colorize") // optional description for "no_color" field
  no_color?: string | boolean; // → --no-color

  main() {
    console.log("main command", this);
  }

  @help("create and start") // optional description for "up" command
  up() {
    console.log("up command", this);
  }

  down(force: boolean, timeout: number) {
    console.log("down command", { force, timeout }, this);
  }
}

cliteRun(new Tool());
```

## Argument parsing

Clite use [@std/cli](https://jsr.io/@std/cli/doc/parse-args), based on
[minimist](https://github.com/minimistjs/minimist).

## Default command

- If there is only one method/command => this method is the default
- If the main method exist => main is the default
- else => no default method

```shell
$ ./example-lite.ts
main command Tool { retry: 2, webUrl: "none", no_color: undefined }
```

## Ignore _* methods and fields (in the help)

Fields and methods that start with "_" are ignored.

```typescript
_privateData = 12;
_privmethod() {
  console.log("this method is not visible in the help (starts with '_')");
}
```

Note: this "private" method can be run by the CLI, it's useful during the
development.

Note2: js private fields `#*` are also ignored :

```typescript
#privateData = 12;
#privmethod() {
  console.log("this method is not visible in the help (starts with '#')");
}
```

## Plain Object

A plain JS Object can be used :

```typescript
import { cliteRun } from "jsr:@jersou/clite@0.5.0";

cliteRun({
  retry: 2,
  main() {
    console.log("main command", this);
  },
  _up_help: "create and start the services",
  up(svc: string, timeout = 10) {
    console.log("up command", { svc, timeout, retry: this.retry });
  },
  down(svc: string) {
    console.log("down command", { svc, retry: this.retry });
  },
});
```

```shell
$ ./plain_object_lite.ts --retry=77 up foo 123
up command { svc: "foo", timeout: "123", retry: "77" }

$ /plain_object_lite.ts --help
Usage: <Object file> [Options] [command [command args]]

Commands:
  main                (default)
  up <svc> <timeout>  create and start the services
  down <svc>

Options:
  --retry=<RETRY>  (default "2")
  --help           Show this help
```

## Boolean options

```shell
$ ./example-lite.ts
main command Tool { retry: 2, webUrl: "none", no_color: undefined }
$ ./example-lite.ts --no-color
main command Tool { retry: 2, webUrl: "none", no_color: true }
$ ./example-lite.ts --no-color=false
main command Tool { retry: 2, webUrl: "none", no_color: "false" }
$ ./example-lite.ts --no-color=true
main command Tool { retry: 2, webUrl: "none", no_color: "true" }
```

## Warning

All options and command arguments are strings ! There is no boolean/number/...
conversion !

## CliteRunConfig

`cliteRun(new Tool(), < optional CliteRunConfig > )`

```typescript
type CliteRunConfig = {
  args?: string[]; // default : Deno.args or process.argv.slice(2)
  dontPrintResult?: boolean; // default false : false, print the command return
  noCommand?: boolean; // no default command : do not run "main" methode if no arg
  printHelpOnError?: boolean; // print the help if an error is thrown and then re-throw the error
  mainFile?: string; // allows to change the name of the file in the help, instead of the default <{Class name} file>
  meta?: ImportMeta; // import.meta to use : don't run if the file is imported, and use import.meta.url in the help
};
```

### Return value

If the method run by `cliteRun` return a value != undefined, it will be print in
stdout.

This behavior can be disabled with the config :
`cliteRun(new Tool(), { dontPrintResult: true })`

### noCommand

<!-- TODO -->

`cliteRun(new Tool(), { noCommand: true });` → `./example-no-command.ts ---help`
give :

```
This tool is a "no-command" example of CliteParser usage

Usage: <Tool file> [Options] [args]

Options:
  --retry=<RETRY>        (default "2")
  --web-url=<WEB_URL>    web URL ... (default "none")
  --no-color=<NO_COLOR>  skip colorize
  --help                 Show this help
```

### printHelpOnError

Print the help if an error is thrown and then re-throw the error:

```typescript
import { cliteRun } from "jsr:@jersou/clite@0.5.0";
export class Tool {
  throw = "true";
  main() {
    if (this.throw === "true") {
      throw new Error("add --throw=false option !");
    }
    console.log("OK !");
  }
}
cliteRun(new Tool(), { printHelpOnError: true });
```

To print help on specific error without `printHelpOnError=true`, use
`{ cause: { clite: true } }` :

```typescript
import { cliteRun } from "jsr:@jersou/clite@0.5.0";
export class Tool {
  noThrow = false;

  main() {
    if (!this.noThrow) {
      throw new Error("add --no-throw option !", { cause: { clite: true } });
    }
    console.log("OK !");
  }
}
cliteRun(new Tool());
```

### mainFile

Allows to change the name of the file in the help, instead of the default for
example `<Tool file>`.

```typescript
cliteRun(new Tool(), { mainFile: "my-tool" });
```

...will change the usage line in the help :

```
Usage: my-tool [Options] [command [command args]]
```

### meta

Use meta to avoid the import.meta.main check :

```typescript
if (import.meta.main) { // if the file is imported, do not execute this block
  cliteRun(new Tool());
}
```

is equivalent to :

```typescript
cliteRun(new Tool(), { meta: import.meta });
```

The basename of import.meta.url will be used in the generated help, as
"mainFile".

This feature does not work with NodeJS (no import.meta.main).

## Node support : `npx jsr add @jersou/clite`

Run `npx jsr add @jersou/clite` and then, import with
`import { cliteRun } from "@jersou/clite";` :

```javascript
import { cliteRun } from "@jersou/clite"; // after "npx jsr add @jersou/clite"
class Tool { ... }
cliteRun(new Tool());
```

See node usage examples :

- [examples/node/dax](examples/node/dax)
- [examples/node/simple](examples/node/simple)
- [examples/node/zx](examples/node/zx)

## Links

- https://jsr.io/@jersou/clite
- https://github.com/jersou/clite-parser
