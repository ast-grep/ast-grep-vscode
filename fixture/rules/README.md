Make sure that your custom rules in this directory are properly parsed.
`npm run test` will test the LSP which does NOT report errors with rule files (https://github.com/ast-grep/ast-grep/issues/722)
but it will break all of the tests.

You can run

```bash
cd fixture
sg scan
```

to verify that the rules are parsed correctly.
