import { assertEquals } from "@std/assert";
import { getCliteMetadata } from "./metadata.ts";
import {
  alias,
  defaultHelp,
  help,
  hidden,
  negatable,
  noCommand,
  subcommand,
  type,
  usage,
} from "./decorators.ts";

Deno.test({
  name: "metadata _alias []",
  fn() {
    class Tool {
      _dryRun_alias = ["n", "d"];
      dryRun = false;
      main() {}
    }
    const metadata = getCliteMetadata(new Tool());
    assertEquals(metadata.fields.dryRun?.alias, ["n", "d"]);
  },
});

Deno.test({
  name: "metadata @alias []",
  fn() {
    class Tool {
      @alias("d")
      @alias("n")
      dryRun = false;
      main() {}
    }
    const metadata = getCliteMetadata(new Tool());
    // TODO order ?
    assertEquals(metadata.fields.dryRun?.alias, ["n", "d"]);
  },
});

Deno.test({
  name: "metadata _alias",
  fn() {
    class Tool {
      _dryRun_alias = "n";
      dryRun = false;
      main() {}
    }
    const metadata = getCliteMetadata(new Tool());
    assertEquals(metadata.fields.dryRun?.alias, ["n"]);
  },
});

Deno.test({
  name: "metadata @alias",
  fn() {
    class Tool {
      @alias("n")
      dryRun = false;
      main() {}
    }
    const metadata = getCliteMetadata(new Tool());
    assertEquals(metadata.fields.dryRun?.alias, ["n"]);
  },
});

Deno.test({
  name: "metadata @help",
  fn() {
    class Tool {
      @help("dryRun help")
      dryRun = false;
      main() {}
    }
    const metadata = getCliteMetadata(new Tool());
    assertEquals(metadata.fields.dryRun?.help, "dryRun help");
  },
});

Deno.test({
  name: "metadata @help",
  fn() {
    class Tool {
      @help("dryRun help")
      dryRun = false;
      main() {}
    }
    const metadata = getCliteMetadata(new Tool());
    assertEquals(metadata.fields.dryRun?.help, "dryRun help");
  },
});

Deno.test({
  name: "metadata @subcommand obj",
  fn() {
    class Tool {
      @subcommand()
      sub = {};
      main() {}
    }
    const metadata = getCliteMetadata(new Tool());
    assertEquals(metadata.subcommands, ["sub"]);
  },
});

Deno.test({
  name: "metadata @subcommand class",
  fn() {
    class Tool {
      @subcommand()
      sub = class Sub {};
      main() {}
    }
    const metadata = getCliteMetadata(new Tool());
    assertEquals(metadata.subcommands, ["sub"]);
  },
});

Deno.test({
  name: "metadata _subcommand class",
  fn() {
    class Tool {
      _sub_subcommand = true;
      sub = class Sub {};
      main() {}
    }
    const metadata = getCliteMetadata(new Tool());
    assertEquals(metadata.subcommands, ["sub"]);
  },
});

Deno.test({
  name: "metadata @type",
  fn() {
    class Tool {
      @type("dryRun type")
      dryRun = false;
      main() {}
    }
    const metadata = getCliteMetadata(new Tool());
    assertEquals(metadata.fields.dryRun?.type, "dryRun type");
  },
});

Deno.test({
  name: "metadata _type",
  fn() {
    class Tool {
      _dryRun_type = "dryRun type";
      dryRun = false;
      main() {}
    }
    const metadata = getCliteMetadata(new Tool());
    assertEquals(metadata.fields.dryRun?.type, "dryRun type");
  },
});

Deno.test({
  name: "metadata @default",
  fn() {
    class Tool {
      @defaultHelp("dryRun default")
      dryRun = false;
      main() {}
    }
    const metadata = getCliteMetadata(new Tool());
    assertEquals(metadata.fields.dryRun?.defaultHelp, "dryRun default");
  },
});

Deno.test({
  name: "metadata _default",
  fn() {
    class Tool {
      _dryRun_default = "dryRun default";
      dryRun = false;
      main() {}
    }
    const metadata = getCliteMetadata(new Tool());
    assertEquals(metadata.fields.dryRun?.defaultHelp, "dryRun default");
  },
});

Deno.test({
  name: "metadata @negatable str",
  fn() {
    class Tool {
      @negatable("dryRun negatable")
      dryRun = false;
      main() {}
    }
    const metadata = getCliteMetadata(new Tool());
    assertEquals(metadata.fields.dryRun?.negatable, "dryRun negatable");
  },
});

Deno.test({
  name: "metadata _negatable str",
  fn() {
    class Tool {
      _dryRun_negatable = "dryRun negatable";
      dryRun = false;
      main() {}
    }
    const metadata = getCliteMetadata(new Tool());
    assertEquals(metadata.fields.dryRun?.negatable, "dryRun negatable");
  },
});

Deno.test({
  name: "metadata @negatable str",
  fn() {
    class Tool {
      @negatable()
      dryRun = false;
      main() {}
    }
    const metadata = getCliteMetadata(new Tool());
    assertEquals(metadata.fields.dryRun?.negatable, true);
  },
});

Deno.test({
  name: "metadata _negatable str",
  fn() {
    class Tool {
      _dryRun_negatable = true;
      dryRun = false;
      main() {}
    }
    const metadata = getCliteMetadata(new Tool());
    assertEquals(metadata.fields.dryRun?.negatable, true);
  },
});

Deno.test({
  name: "metadata @hidden",
  fn() {
    class Tool {
      @hidden()
      dryRun = false;
      main() {}
    }
    const metadata = getCliteMetadata(new Tool());
    assertEquals(metadata.fields.dryRun?.hidden, true);
  },
});

Deno.test({
  name: "metadata _hidden",
  fn() {
    class Tool {
      _dryRun_hidden = true;
      dryRun = false;
      main() {}
    }
    const metadata = getCliteMetadata(new Tool());
    assertEquals(metadata.fields.dryRun?.hidden, true);
  },
});

Deno.test({
  name: "metadata class @help",
  fn() {
    @help("Tool help")
    class Tool {
      main() {}
    }
    const metadata = getCliteMetadata(new Tool());
    assertEquals(metadata.help, "Tool help");
  },
});

Deno.test({
  name: "metadata class _help",
  fn() {
    class Tool {
      _help = "Tool help";
      main() {}
    }
    const metadata = getCliteMetadata(new Tool());
    assertEquals(metadata.help, "Tool help");
  },
});

Deno.test({
  name: "metadata class @usage",
  fn() {
    @usage("Tool usage")
    class Tool {
      main() {}
    }
    const metadata = getCliteMetadata(new Tool());
    assertEquals(metadata.usage, "Tool usage");
  },
});

Deno.test({
  name: "metadata class _usage",
  fn() {
    class Tool {
      _usage = "Tool usage";
      main() {}
    }
    const metadata = getCliteMetadata(new Tool());
    assertEquals(metadata.usage, "Tool usage");
  },
});

Deno.test({
  name: "metadata class @noCommand",
  fn() {
    @noCommand()
    class Tool {
      main() {}
    }
    const metadata = getCliteMetadata(new Tool());
    assertEquals(metadata.noCommand, true);
  },
});

Deno.test({
  name: "metadata class _noCommand",
  fn() {
    class Tool {
      _no_command = true;
      main() {}
    }
    const metadata = getCliteMetadata(new Tool());
    assertEquals(metadata.noCommand, true);
  },
});
