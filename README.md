# 🚀 Baseline CLI

[![Baseline Compliant](https://img.shields.io/badge/Baseline-Compliant-brightgreen)](https://web.dev/baseline/)

A powerful command-line tool that helps developers instantly check if their web projects are compliant with the latest Baseline web features standard. Stop jumping between MDN, caniuse.com, and blog posts—just run a single command to scan your codebase and find out whether your use of modern web APIs, CSS selectors, or JavaScript features is safe to use in production.

## 🌟 Features

### 🔍 Local Scanning
- Run `baseline scan` to analyze your project files (JS, TS, CSS, HTML)
- Detects usage of modern web APIs, CSS features, and JavaScript syntax
- Outputs results in multiple formats:
  - **Summary**: Human-readable report with color-coded status
  - **JSON**: Machine-readable format for scripts and dashboards
  - **JUnit**: CI-friendly XML format for test reporting

### 🔄 GitHub Actions Integration
- Run `baseline init --github` to scaffold a ready-to-use GitHub Actions workflow
- Automatically checks every PR and push for Baseline compliance
- Optional PR comment bot posts results directly into pull requests
- Integrates seamlessly with your existing CI/CD pipeline

### ⚙️ Configurable Compliance
- Support for `.baselinerc.json` to define your minimum baseline threshold
- Fail builds when features below that threshold are detected
- Allow warnings for experimental features instead of blocking them
- Customize ignore patterns for specific files or directories

### 🎯 Developer Experience Enhancements
- `baseline badge` generates a README badge (e.g., "Baseline 2024 Compliant ✅")
- `--dry-run` flag to preview results without failing builds
- Detailed feature detection with source locations
- Clear, actionable output with suggestions for improving compliance

## 📦 Installation

### Global Installation (Recommended)

```bash
npm install -g baseline-cli
```

### Local Project Installation

```bash
npm install --save-dev baseline-cli
```

### From Source

```bash
git clone https://github.com/your-username/baseline-cli.git
cd baseline-cli
npm install
npm run build
npm link
```

## 🚀 Quick Start

### 1. Initialize Configuration

Create a `.baselinerc.json` configuration file in your project:

```bash
baseline init
```

This creates a default configuration:

```json
{
  "minimumBaseline": "2023",
  "ignore": [
    "node_modules/**",
    "dist/**",
    "build/**",
    "*.min.js",
    "vendor/**"
  ],
  "failOnWarning": false,
  "outputFormat": "summary"
}
```

### 2. Scan Your Project

Run a baseline compliance check:

```bash
baseline scan
```

Example output:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📊 Baseline Compliance Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Files scanned: 42
  Features detected: 87

  ✅ Baseline compliant: 76
  ⚠️  Limited support: 8
  🧪 Experimental: 3

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📁 Detailed Results
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  📄 src/components/App.tsx
     ✅ Baseline features:
        • Promise (Promise)
        • Async functions (async function)
        • Fetch API (fetch()

     🧪 Experimental:
        • Container Queries (@container)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Compliance rate: 87.4%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 3. Set Up GitHub Actions (Optional)

Generate a GitHub Actions workflow:

```bash
baseline init --github
```

This creates `.github/workflows/baseline.yml` that will:
- Run on every push and pull request
- Generate compliance reports
- Post results as PR comments
- Upload artifacts for review

### 4. Generate a Badge

Create a compliance badge for your README:

```bash
baseline badge
```

Copy the generated markdown into your README.md:

```markdown
![Baseline Compliant](https://img.shields.io/badge/Baseline-87%25-yellow)
```

## 📖 Command Reference

### `baseline scan [options]`

Scan your project for Baseline compliance.

**Options:**
- `-p, --path <path>` - Path to scan (default: current directory)
- `-f, --format <format>` - Output format: `summary`, `json`, or `junit` (default: `summary`)
- `--dry-run` - Preview results without failing builds

**Examples:**

```bash
# Scan current directory with summary output
baseline scan

# Scan specific directory with JSON output
baseline scan --path ./src --format json

# Dry run to preview without failing
baseline scan --dry-run

# Generate JUnit report for CI
baseline scan --format junit
```

### `baseline init [options]`

Initialize Baseline configuration.

**Options:**
- `--github` - Generate GitHub Actions workflow

**Examples:**

```bash
# Create .baselinerc.json
baseline init

# Create config + GitHub workflow
baseline init --github
```

### `baseline badge [options]`

Generate a compliance badge for your README.

**Options:**
- `-p, --path <path>` - Path to project (default: current directory)

**Examples:**

```bash
# Generate badge for current project
baseline badge

# Generate badge for specific path
baseline badge --path ./my-app
```

## ⚙️ Configuration

### `.baselinerc.json`

Configure Baseline CLI behavior:

```json
{
  "minimumBaseline": "2023",
  "ignore": [
    "node_modules/**",
    "dist/**",
    "*.min.js"
  ],
  "failOnWarning": false,
  "outputFormat": "summary"
}
```

**Options:**

- **`minimumBaseline`** (string): Minimum baseline year required (e.g., `"2023"`, `"2024"`)
- **`ignore`** (array): Glob patterns for files to ignore
- **`failOnWarning`** (boolean): Fail build on limited-support features
- **`outputFormat`** (string): Default output format (`summary`, `json`, `junit`)

## 🧪 Detected Features

Baseline CLI detects a wide range of modern web features:

### JavaScript/TypeScript
- Promises, async/await
- Fetch API
- Intersection/Resize/Mutation Observers
- Service Workers
- WebSockets
- IndexedDB
- Geolocation
- ES6+ syntax (classes, arrow functions, destructuring, etc.)

### CSS
- Grid and Flexbox
- Container Queries
- `:has()` selector
- `@layer` cascade layers
- `color-mix()`
- `clamp()`
- Aspect ratio
- Backdrop filter

### HTML
- `<dialog>` element
- `<details>` element
- `<template>` element
- Lazy loading
- `<picture>` element
- ES6 modules

## 🎯 Use Cases

### Local Development
Run `baseline scan` before committing to catch compatibility issues early.

### CI/CD Integration
Add Baseline checks to your pipeline:

```yaml
- name: Install Baseline CLI
  run: npm install -g baseline-cli

- name: Run Baseline scan
  run: baseline scan --format junit
```

### Pre-commit Hooks
Add to `.husky/pre-commit`:

```bash
#!/bin/sh
baseline scan --dry-run
```

### Documentation
Generate badges to show your project's compliance status:

```bash
baseline badge
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- Built with the official [web-features](https://www.npmjs.com/package/web-features) npm package
- Inspired by the [Baseline initiative](https://web.dev/baseline/) from Google and the web community
- Created for the [Baseline Tooling Hackathon](https://baseline-tooling-hackathon.devpost.com/)

## 📚 Resources

- [Baseline Documentation](https://web.dev/baseline/)
- [Web Features Package](https://github.com/web-platform-dx/web-features)
- [MDN Web Docs](https://developer.mozilla.org/)
- [Can I Use](https://caniuse.com/)

---

Made with ❤️ for the web developer community
