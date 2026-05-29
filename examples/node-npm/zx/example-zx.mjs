#!/usr/bin/env node
import { clinfer } from "clinfer";
import { $ } from "zx";
$.verbose = true;

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

  async down(force, timeout) {
    console.log("down command", { force, timeout }, this);
    await $`echo "down from zx" && date`;
  }
}

clinfer(new Tool());
