## [0.6.0](https://github.com/jersou/clite-parser/compare/0.5.0...0.6.0) (2024-10-??)

- feat: use [@std/cli](https://jsr.io/@std/cli/doc/parse-args) ! based on
  [minimist](https://github.com/minimistjs/minimist).
- feat: add `@alias` decorator & `_<prop>_alias`
- feat: add `@types` decorator & `_<prop>_types`
- feat: add `@defaultHelp` decorator & `_<prop>_default`
- feat: add `@negatable` decorator & `_<prop>_negatable`
- feat: update help format

## [0.5.0](https://github.com/jersou/clite-parser/compare/0.4.0...0.5.0) (2024-09-24)

- doc : update, clean
- refactor: use _help instead of _desc
- feat: add @help decorator
  ([c707ce7](https://github.com/jersou/clite-parser/commit/c707ce75efee6649d36a925787b4536c2ccf9d8a))
- feat: supports plain objects
  ([f0293da](https://github.com/jersou/clite-parser/commit/f0293dac2f0f889d0279885c64bfdc09ea242a67))

## 0.4.0 (2024-09-23)

- feat: add "meta" config
  ([ca5f347](https://github.com/jersou/clite-parser/commit/ca5f347c10f444f4a2b961c0633183af36e3ed65))
- feat: add mainFile to config
  ([6ebebf6](https://github.com/jersou/clite-parser/commit/6ebebf6ebd4799aef4217cd83140a500bf470a54))
- feat: add printHelpOnError
  ([18699a0](https://github.com/jersou/clite-parser/commit/18699a043b993b07f52dd2e11f86b91dd23fbec8))
- doc: add MIT license
- doc: refactor & add Contributors
- refactor: update dep, remove imports from deno.json
- fix: fix dcpps example
  ([d8dd2c2](https://github.com/jersou/clite-parser/commit/d8dd2c2ecb339b211e898831f77aeba2be5c09bd))

## 0.3.2 (2024-09-08)

- docs: add doc in clite_parser.ts & publish action
- refactor: move to jsr: fix node examples
- refactor: move to jsr: update comments

## 0.3.1 (2024-09-07)

- refactor: move to jsr: fix import in examples, v0.3.1

## 0.3.0 (2024-09-07)

- refactor: move to jsr
- fix: fix dcpps _getDockerComposePsData
- doc: fix example link & add js private
- doc: update config & node parts
- doc: update node part

## 0.2.2 (2024-02-23)

- feat: add noCommand to config
- fix(option parser): fix parsing of --opt=key=value
- examples: fix dcpps

## 0.2.1 (2024-01-31)

- doc: update
- doc(NodeJs support): add node shebang
- feat: add NodeJs support: add examples

## 0.2.0 (2024-01-31)

- feat: add NodeJs support
- BREAKING: remove CLITE_RUN_DONT_PRINT_RESULT env var
- typo: align

## 0.1.11 (2024-01-30)

- doc: fix dcpm example

## 0.1.10 (2024-01-29)

- doc: add dcpm example & bench
- refactor: extract functions and upgrade dep

## 0.1.9 (2024-01-27)

- doc: update
- feat: align help
- refactor: add CliteRunConfig
- refactor: move examples to folder and add dcpps ex

## 0.1.7 (2024-01-25)

- feat: print return if != undefined
- doc: update doc

## 0.1.4 (2024-01-25)

- feat: add _desc and styles in help

## 0.1.3 (2024-01-24)

- doc: fix doc and add lang to blocks

## 0.1.2 (2024-01-24)

- doc: fix doc, use example-lite.ts
- refactor: clean, add <${name} file> in help

## 0.1.1 (2024-01-22)

- fix(help): fix command arg default value

## 0.1.0 (2024-01-21)

- CliteParser init commit
