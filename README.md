# CliteParser (CLI lite parser)

**CliteParser generate CLI from class**, each method generate a "command", each
field generate an "option" :

```
import { cliteRun } from "https://deno.land/x/clite_parser/clite_parser.ts";

class Tool {
  retry = 2;
  webUrl = "none";
  no_color?: boolean;

  main() {
    console.log("main", this);
  }

  down(force: boolean, timeout: number) {
    console.log("down command");
    console.log("command args :", { force, timeout });
    console.log("options :", this);
  }
}

cliteRun(new Tool());
```

## The help is generated automatically:

```
$ ./example.ts --help
Usage: Tool [Options] [command [command args]]
Commands:
  main
  up
  down <force> <timeout>
Options:
  --retry=<value>   (default "2")
  --web-url=<value>   (default "none")
  --no-color=<value>
```

Fields and methods that start with "_" are ignored.

## Example with options and command arguments

```
$ ./example.ts --retry=4 --web-url=tttt --no-color down true 14
down command
command args : { force: "true", timeout: "14" }
options : Tool { retry: "4", webUrl: "tttt", no_color: true }
```

## Default command

```
$ ./example.ts       
main Tool { retry: 2, webUrl: "none", no_color: undefined }
```
