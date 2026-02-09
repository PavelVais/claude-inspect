# Generate API Docs

Generate OpenAPI documentation from source code annotations and publish to the developer portal.

## Usage
```
/generate-api            # Generate and validate docs
/generate-api serve      # Generate and serve locally
/generate-api publish    # Publish to developer portal
```

## What it does
1. Scans all route handlers for JSDoc/OpenAPI annotations
2. Generates OpenAPI 3.0 specification (JSON + YAML)
3. Validates the spec against the OpenAPI schema
4. Generates TypeScript client SDK from the spec
5. Updates the Postman collection export
