# ast-grep-vscode

ast-grep VSCode, a structural search and replace extension.

It uses ASTs to find and modify code patterns. No more tedious and error-prone text manipulation.

## Features

ast-grep is a tool that allows you to search and replace code patterns based on their structure, not just their text. It uses abstract syntax trees (ASTs) to represent the syntax and structure of your code, and lets you write patterns as if you are writing ordinary code. You can also use ast-grep to perform linting and rewriting tasks, and write your own rules using YAML configuration.

The VSCode extension includes two parts: a UI for ast-grep CLI and a client for ast-grep LSP.

### Code search
|Search Pattern|Search In Folder|
|--|--|
|<img src="https://github.com/ast-grep/ast-grep-vscode/blob/master/readme/search-pattern.png?raw=true">|<img src="https://github.com/ast-grep/ast-grep-vscode/blob/master/readme/search-in-folder.png?raw=true">|

### Code Replace
|Replace Preview|Commit Replace|
|--|--|
|<img src="https://github.com/ast-grep/ast-grep-vscode/blob/master/readme/replace.png?raw=true">|<img src="https://github.com/ast-grep/ast-grep-vscode/blob/master/readme/commit-replace.png?raw=true">|

### Code Linting and Actions(\*)
*Require LSP setup*

<img src="https://github.com/ast-grep/ast-grep-vscode/blob/master/readme/replace.png?raw=true">|<img src="https://github.com/ast-grep/ast-grep-vscode/blob/master/readme/linter.png?raw=true">

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

Also see the [quickstart guide](https://ast-grep.github.io/guide/quick-start.html) for installation.

- (optional) setting up ast-grep [project](https://ast-grep.github.io/guide/scan-project.html).

  This is an optional step to enable code linting and code actions. It requires at least one file and one folder to work:

  - `sgconfig.yml`, the [project configuration file](https://ast-grep.github.io/reference/sgconfig.html)
  - a directory storing rule files, conventionally `rules/`

You can also use the [command line tool](https://ast-grep.github.io/reference/cli/new.html) to set it up.

```bash
ast-grep new
```

## Available Commands

- `ast-grep.restartLanguageServer`
  Restart ast-grep langauge server. Useful to reload rule or configuration changes.

- `ast-grep.searchInFolder`
  Find ast-grep pattern in the specified folder in a project.

## Extension Settings

This extension contributes the following settings:

- `astGrep.serverPath`: Specify the language server binary path.

## Video Introduction

See the introduction on YouTube! Please give a thumbup~

<iframe width="560" height="315" src="https://www.youtube.com/embed/1ZM4RfIvWKc?si=dp0SAtQYeUpAOhSk" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>