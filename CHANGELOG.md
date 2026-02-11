# Changelog

## [v0.1.0] - 2026-02-10

### Added
- Initial Docker Hub release as `pavelvais/claude-inspect`
- Auto-detect mount style: supports both whole-project and `.claude`-only Docker mounts
- One-liner `docker run` support for inspecting any project
- GitHub Actions workflow for automated Docker Hub publishing on version tags
- Docker image labels (maintainer, description, source, version)
- Initial release

### Mount styles

```bash
# Whole project
docker run --rm -v $(pwd):/inspect:ro -p 3000:3000 pavelvais/claude-inspect

# Just .claude directory
docker run --rm -v $(pwd)/.claude:/inspect:ro -p 3000:3000 pavelvais/claude-inspect

# With custom project name
docker run --rm -v $(pwd):/inspect:ro -e PROJECT_NAME=MyApp -p 3000:3000 pavelvais/claude-inspect

# Docker Compose
TARGET_PROJECT_PATH=/path/to/project docker compose up
```
