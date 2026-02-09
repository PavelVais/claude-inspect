# Changelog

Generate a changelog entry for the current branch based on commit history.

## Usage
```
/changelog               # Generate changelog for current branch
/changelog release       # Generate full release changelog
```

## What it does
1. Reads all commits since branching from main
2. Categorizes changes by type (feat, fix, refactor, docs, chore)
3. Generates a markdown changelog entry
4. Includes links to relevant PRs and issues
5. Prepends to CHANGELOG.md with the current date
