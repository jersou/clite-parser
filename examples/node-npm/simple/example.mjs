#!/usr/bin/env node
import { clinfer } from "clinfer";

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

  down(force = false, timeout = 5) {
    console.log("down", { force, timeout }, this);
  }
}

clinfer(Tool);
