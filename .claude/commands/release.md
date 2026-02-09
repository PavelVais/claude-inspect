Add descriptions from /changelog/*.md files and add to CHANGELOG.md


## Usage

```
/release
/release {identifier}
```

When the user runs `/release`, I will:

1. **Collect all changelog files**:
   - Scan `/changelog` directory for all `.md` files (excluding `.gitkeep`)
   - Read each file and extract title (first line with #) and description
   - Convert each file's content into format: `- description from md file` in czech

2. **Update CHANGELOG.md**:
   - Find the `## [Unreleased]` section
   - Add all collected entries under this section as bullet points
   - Each changelog file becomes one line item

3. **Ask for release version**:
   - If an argument is provided, use it as the version
   - If no argument is provided:
     - Prompt user: "Enter release date (e.g., 2025-06-09):"
   - User provides release date/version

4. **Finalize release**:
   - Rename `## [Unreleased]` to `## [provided-date]`
   - Add new `## [Unreleased]` section above the dated release
   - Ask user if they want to delete processed changelog files

5. **Move changelof files**:
   - Move all `DGS-XXXX.md` files inside changelog folder to `changelog/released` folder

This command consolidates all individual task changelogs into the main CHANGELOG.md for release documentation.
