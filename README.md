# ast-grep-vscode

VSCode extension package for ast-grep language server

## Features

- Code search
- Code linting(\*)
- Code actions(\*)

Note, code linting and code actions requires [setting up `sgconfig.yml`](https://ast-grep.github.io/guide/scan-project.html) in your workspace root.

## Requirements

- [ast-grep](https://ast-grep.github.io/)

```bash
# install via npm
npm i @ast-grep/cli -g

# install via cargo
cargo install ast-grep

# install via homebrew
brew install ast-grep
```

## Extension Settings

This extension contributes the following settings:

- `astGrep.serverPath`: Specify the language server binary path.
