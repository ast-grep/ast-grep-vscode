# ast-grep VSCode

_ast-grep VSCode, a structural search and replace extension._

It uses ASTs to find and modify code patterns. No more tedious and error-prone text manipulation.

## Introduction

Have you ever spent hours trying to find and replace a code pattern using plain text or regular expressions? If so, you know how tedious and error-prone it can be. However, there is a better way to do this: **Structural Search and Replace**, a [technique](https://www.jetbrains.com/help/idea/structural-search-and-replace.html) that allows you to find and modify code patterns based on their syntax and semantics, not just their text.

[ast-grep](https://ast-grep.github.io/) is a structural search/replace tool that uses abstract syntax trees (ASTs) to represent the syntax and structure of your code, and lets you write patterns as if you are writing ordinary code.

It can help you search and replace code elements more precisely and efficiently than using regular expressions or plain text. You can also use ast-grep to perform linting and rewriting tasks, and write your own rules using YAML configuration.

## Features

The ast-grep VSCode is an extension to bridge the power of ast-grep and the beloved editor VSCode.

It includes two parts: a UI for ast-grep CLI and a client for ast-grep LSP.

### Code search

Use [pattern](https://ast-grep.github.io/guide/pattern-syntax.html) to structural search your codebase.

|Search Pattern|Search In Folder|
|--|--|
|<img src="https://github.com/ast-grep/ast-grep-vscode/blob/main/readme/search-pattern.png?raw=true">|<img src="https://github.com/ast-grep/ast-grep-vscode/blob/main/readme/search-in-folder.png?raw=true">|

### Code Replace

Use pattern to [replace](https://ast-grep.github.io/guide/rewrite-code.html) matching code.

|Replace Preview|Commit Replace|
|--|--|
|<img src="https://github.com/ast-grep/ast-grep-vscode/blob/main/readme/replace.png?raw=true">|<img src="https://github.com/ast-grep/ast-grep-vscode/blob/main/readme/commit-replace.png?raw=true">|

### Code Linting and Actions(\*)
*Require LSP setup*

Code linting and code actions require [setting up `sgconfig.yml`](https://ast-grep.github.io/guide/scan-project.html) in your workspace root.

<img src="https://github.com/ast-grep/ast-grep-vscode/blob/main/readme/linter.png?raw=true">

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

See the introduction on YouTube! Please give it a like~

<div align="center">
  <a href="https://www.youtube.com/watch?v=1ZM4RfIvWKc" target="_blank">
     <img src="https://img.youtube.com/vi/1ZM4RfIvWKc/0.jpg" >
  </a>
</div>