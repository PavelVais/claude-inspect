Create a changelog file for the current branch

## Usage

```

/changelog
/changelog DGS-XXXX

```

1. **Get current branch name** and extract ticket number:
   - If no argument is provided, use the current branch name
      - If branch matches `DGS-XXXX-*` pattern, use `DGS-XXXX` as filename
      - If not, ask user for ticket number in format `DGS-XXXX`
   - If an argument is provided, use it as the ticket number
      - Validate that it matches `DGS-XXXX` format
      - If invalid, prompt user to provide a valid ticket number

2. **Analyze changes made in this branch**:
   - Compare current branch commits against develop branch
   - Look at git diff to understand what files were modified
   - Generate concise description focusing on functional changes
   - **Include category prefix** in square brackets (e.g., [BulkSigning], [Dashboard], [Admin], [API], etc.) based on the area/component that was modified

3. **Create changelog file**:
   - Create `changelog/DGS-XXXX.md` file
   - Include brief one-line title describing what was done in czech langauge
   - Add short description of changes with business impact focus
   - Check if file exists and ask about overwriting if needed

The generated changelog will help track what was done in each task for easier deployment and code review.