# ast-grep-vscode

VSCode extension package for ast-grep language server

## Features

- Code linting
- Code actions
- Code search in opened documents

## Commands

- `ast-grep.search`

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
- `astGrep.configPath`: Customize ast-grep config file path relative. Default is `sgconfig.yml`.
