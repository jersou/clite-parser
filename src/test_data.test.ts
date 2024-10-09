export class Tool {
  _help = "test data";
  opt1 = 123;
  opt2 = true;
  opt3 = "azer";
  opt_snake_case?: string;
  optCamelCase?: string;
  _hidden = 5;
  _opt3_help = "option 3 desc";
  _clean_help = "clean all data";
  _optCamelCase_help = "optCamelCase desc";

  up() {
    console.log("up command", this);
  }

  down(force: boolean, timeout = 10) {
    console.log("down command", force, timeout, this);
    return `down force=${force} timeout=${timeout}
    opt1=${this.opt1}
    opt2=${this.opt2}
    opt3=${this.opt3}
    opt_snake_case=${this.opt_snake_case}
    optCamelCase=${this.optCamelCase}`;
  }

  clean() {
    console.log("clean command", this);
  }

  _priv() {
    console.log("this method is not visible in the help (starts with '_')");
  }

  main() {
    console.log("main command", this);
  }
}
