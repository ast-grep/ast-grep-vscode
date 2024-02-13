# ast-grep-vscode

VSCode extension package for ast-grep language server

## Features

- Code search
- Code linting(\*)
- Code actions(\*)

Note, code linting and code actions requires [setting up `sgconfig.yml`](https://ast-grep.github.io/guide/scan-project.html) in your workspace root.

## Requirements

- [ast-grep](https://ast-grep.github.io/) binary in your path.

```bash
# install via npm
npm i @ast-grep/cli -g

# install via cargo
cargo install ast-grep

# install via homebrew
brew install ast-grep
```

- setting up ast-grep project.

  This is an optional step to enable code linting and code actions. It requires at least one file and one folder to work:

  - `sgconfig.yml`, the [project configuration file](https://ast-grep.github.io/reference/sgconfig.html)
  - a directory storing rule files, conventionally `rules/`

You can also use the [command line tool](https://ast-grep.github.io/reference/cli/new.html) to set it up.

```bash
ast-grep new
```

## Extension Settings

This extension contributes the following settings:

- `astGrep.serverPath`: Specify the language server binary path.
