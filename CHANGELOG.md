## [0.7.6](https://github.com/jersou/clite-parser/compare/0.7.5...0.7.6) (2024-11-07)

### Features

- keep decorators on extends
  ([d9f6b73](https://github.com/jersou/clite-parser/commit/d9f6b7320ee77eb4e3838a765170c496f4158978))

## [0.7.5](https://github.com/jersou/clite-parser/compare/0.7.4...0.7.5) (2024-11-07)

### Features

- add getMethodNamesDeep to extends tools
  ([adc758f](https://github.com/jersou/clite-parser/commit/adc758fffe1326149af40f30deaba07f972eb1dd))

## [0.7.4](https://github.com/jersou/clite-parser/compare/0.7.3...0.7.4) (2024-10-20)

### Features

- allow private method call
  ([0557e90](https://github.com/jersou/clite-parser/commit/0557e90bfe473e6a2415e9fef09d5c4dfd3a8c8a))

### Bug Fixes

- fix "default true" boolean
  ([b3ce94e](https://github.com/jersou/clite-parser/commit/b3ce94eaf24b1c16b0998834c57714a30c307688))

## [0.7.3](https://github.com/jersou/clite-parser/compare/0.7.2...0.7.3) (2024-10-19)

### Features

- NPM package: fix README
  ([845ca1d](https://github.com/jersou/clite-parser/commit/845ca1d5ba65a658399483a1c61e6a7e93e30d7c))

## [0.7.2](https://github.com/jersou/clite-parser/compare/0.7.1...0.7.2) (2024-10-19)

### Features

- NodeJS implementation of --config/configCli
  ([780331f](https://github.com/jersou/clite-parser/commit/780331f645876318a749ff88a856edcb98cb2a4d))
- NPM package
  ([b427bdd](https://github.com/jersou/clite-parser/commit/b427bdd3096625862643add5cfb8d9c3fa65bbd8))

### Bug Fixes

- config check
  ([d646c60](https://github.com/jersou/clite-parser/commit/d646c60a2578ed83b5b171a13c22bf25cb5f3b5f))

## [0.7.1](https://github.com/jersou/clite-parser/compare/0.7.0...0.7.1) (2024-10-18)

### Features

- import json from string `--config '{"retry": 44}'`
  ([5d7e63f](https://github.com/jersou/clite-parser/commit/5d7e63f4cc564741338c670123d4df0500bce1d8))

## [0.7.0](https://github.com/jersou/clite-parser/compare/0.6.5...0.7.0) (2024-10-16)

### Features

- add [@json](https://github.com/json)Config to enable --config
  ([02c6099](https://github.com/jersou/clite-parser/commit/02c60993299ef7273ee4d12d869e7a514fe19395))

### Bug Fixes

- big refactor: add test, fix bugs, clean code

## [0.6.5](https://github.com/jersou/clite-parser/compare/0.6.4...0.6.5) (2024-10-15)

### Bug Fixes

- add tests & fix_negatable, configCli
  ([65e25b0](https://github.com/jersou/clite-parser/commit/65e25b06c2686f6303f724d4b57e823e2d8de515))

## [0.6.4](https://github.com/jersou/clite-parser/compare/0.6.3...0.6.4) (2024-10-13)

### Features

- add `@subcommand` & `@noCommand`
  ([8618478](https://github.com/jersou/clite-parser/commit/86184780bbcf891520264457e4a2408791ce4634))
- add cliteParse/CliteResult, remove CliteRunConfig.dontRun
  ([6b3fcd1](https://github.com/jersou/clite-parser/commit/6b3fcd1e982273cb54418ee7f89f273ad000df80))
- add generic Obj to CliteResult
  ([c477526](https://github.com/jersou/clite-parser/commit/c477526c366db811abe8970665577ad6854beb46))
- throw if an option doesn't exists
  ([44d0760](https://github.com/jersou/clite-parser/commit/44d0760b7e51683934281021e68e7870bd6000b9))

## [0.6.3](https://github.com/jersou/clite-parser/compare/0.6.2...0.6.3) (2024-10-13)

### Bug Fixes

- set config if configCli=true
  ([e71d5ef](https://github.com/jersou/clite-parser/commit/e71d5ef6fdaeea5207e096b3a5e123584715c255))

## [0.6.2](https://github.com/jersou/clite-parser/compare/0.6.1...0.6.2) (2024-10-12)

### Features

- add `@hidden` decorator and `_*_hidden` to hide field or method from the help
  ([f78215e](https://github.com/jersou/clite-parser/commit/f78215e91bf9a8b919fa5a8845238657709b8077))
- add`@usage`, add help to DontRunResult
  ([451cf3f](https://github.com/jersou/clite-parser/commit/451cf3fe7c72d814b7a33fe9df917a7a31389917))
- add CliteRunConfig.dontRun & DontRunResult
  ([7ed0aee](https://github.com/jersou/clite-parser/commit/7ed0aee9397bc64acd7d1f9396a57c0ca1c219a9))

## [0.6.1](https://github.com/jersou/clite-parser/compare/0.6.0...0.6.1) (2024-10-12)

### Features

- allows to take a class as input: `cliteRun(new Tool())` or `cliteRun(Tool)`
  ([7cd08fa](https://github.com/jersou/clite-parser/commit/7cd08fa7b6e0f0024e93009ed8f2b1265550e149))

## [0.6.0](https://github.com/jersou/clite-parser/compare/0.5.0...0.6.0) (2024-10-11)

- feat: use [@std/cli](https://jsr.io/@std/cli/doc/parse-args) ! based on
  [minimist](https://github.com/minimistjs/minimist).
- feat: add `@alias` decorator & `_<prop>_alias`
- feat: add `@types` decorator & `_<prop>_types`
- feat: add `@defaultHelp` decorator & `_<prop>_default`
- feat: add `@negatable` decorator & `_<prop>_negatable`
- feat: update help format
- feat: add --config & configCli to load CLI params from file
- feat: convert command args (booleans & numbers)
- several bug fix & refactor

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
