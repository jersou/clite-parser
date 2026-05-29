#!/usr/bin/env node
import { clinfer } from "@jersou/clinfer";

class Tool {
  retry = 2;
  webUrl = "none"; // fields are converted to kebab case as global options
  no_color = false; // → --no-color

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

clinfer(new Tool());
