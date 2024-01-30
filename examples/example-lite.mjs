import { cliteRun } from "../clite_parser.mjs";

class Tool {
  _desc = "This tool is a little example of CliteParser";
  retry = 2;
  webUrl = "none";
  no_color;
  _no_color_desc = "skip colorize";
  _up_desc = "create and start";

  main() {
    console.log("main command", this);
  }

  up() {
    console.log("up command", this);
  }

  down(force, timeout) {
    console.log("down command", {
      force,
      timeout,
    }, this);
  }
}

cliteRun(new Tool());
