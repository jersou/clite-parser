# CLI lite parser for Deno

**CliteParser generate CLI from class**, each method generate a "command", each
field generate an "option" :

```typescript
#!/usr/bin/env -S deno run -A
import { cliteRun } from "https://deno.land/x/clite_parser@0.1.2/clite_parser.ts";

class Tool {
  retry = 2;
  webUrl = "none";
  no_color?: boolean;

  main() {
    console.log("main", this);
  }

  up() {
    console.log("up command", this);
  }

  down(force: boolean, timeout: number) {
    console.log("down command", { force, timeout }, this);
  }
}

cliteRun(new Tool());
```

## The help is generated automatically:

```shell
$ ./example-lite.ts --help
Usage: Tool [Options] [command [command args]]
Commands:
  main (default)
  up
  down <force> <timeout>
Options:
  --retry=<value>   (default "2")
  --web-url=<value>   (default "none")
  --no-color=<value>
```

Fields and methods that start with "_" are ignored.

## Example with options and command arguments

```shell
$ ./example-lite.ts --retry=4 --web-url=tttt --no-color down true 14
down command { force: "true", timeout: "14" } Tool { retry: "4", webUrl: "tttt", no_color: true }

$ ./example-lite.ts down true 14
down command { force: "true", timeout: "14" } Tool { retry: 2, webUrl: "none", no_color: undefined }

$ ./example-lite.ts  --retry=4 --web-url=tttt --no-color
main Tool { retry: "4", webUrl: "tttt", no_color: true }
```

## Default command

```shell
$ ./example-lite.ts
main Tool { retry: 2, webUrl: "none", no_color: undefined }
```

## Boolean option

```shell
$ ./example-lite.ts --no-color
main Tool { retry: 2, webUrl: "none", no_color: true }
```
