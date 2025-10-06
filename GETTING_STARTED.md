# Getting Started with Baseline CLI

This guide will help you understand, test, and submit this project for the Baseline Tooling Hackathon.

## 🏗️ Project Structure

```
baselinehackathon/
├── src/                          # TypeScript source code
│   ├── cli.ts                   # Main CLI entry point
│   ├── commands/                # Command implementations
│   │   ├── scan.ts             # Scan command
│   │   ├── init.ts             # Init command with GitHub Actions
│   │   └── badge.ts            # Badge generation
│   ├── scanners/               # Feature detection
│   │   └── featureDetector.ts  # Pattern matching for web features
│   ├── utils/                  # Utility functions
│   │   ├── fileScanner.ts      # File system traversal
│   │   ├── config.ts           # Configuration management
│   │   └── outputFormatter.ts  # Report formatting
│   └── types/                  # TypeScript type definitions
│       └── index.ts
├── dist/                        # Compiled JavaScript (generated)
├── test-project/                # Demo project with sample files
├── README.md                    # Main documentation
├── HACKATHON.md                # Hackathon submission details
├── LICENSE                      # MIT License
├── package.json                 # Node.js dependencies
└── tsconfig.json               # TypeScript configuration
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Project

```bash
npm run build
```

### 3. Test the CLI

```bash
# Show help
node dist/cli.js --help

# Scan the test project
node dist/cli.js scan --path test-project

# Try JSON output
node dist/cli.js scan --path test-project --format json

# Generate a badge
node dist/cli.js badge --path test-project

# Initialize GitHub Actions workflow
node dist/cli.js init --github
```

### 4. Link Globally (Optional)

To use the CLI from anywhere on your system:

```bash
npm link
baseline --help
baseline scan
```

## 🧪 Testing on Your Own Projects

1. Navigate to any web project directory
2. Run: `baseline scan`
3. Review the compliance report
4. Initialize configuration: `baseline init`
5. Generate a badge: `baseline badge`

## 📝 How It Works

### Feature Detection

The CLI scans your codebase using pattern matching to detect usage of modern web features:

1. **File Scanner** (`fileScanner.ts`):
   - Uses `fast-glob` to find JS, TS, CSS, HTML files
   - Respects `.baselinerc.json` ignore patterns
   - Reads file contents for analysis

2. **Feature Detector** (`featureDetector.ts`):
   - Uses regex patterns to match feature usage
   - Queries `web-features` package for Baseline status
   - Returns features with their compliance status

3. **Report Generation** (`outputFormatter.ts`):
   - Formats results as summary, JSON, or JUnit
   - Color-codes features by status (✅ ⚠️ 🧪)
   - Calculates compliance percentage

### Configuration

Create `.baselinerc.json` in your project:

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

### GitHub Actions Integration

Running `baseline init --github` creates `.github/workflows/baseline.yml`:

- Runs on every push and PR
- Installs Baseline CLI
- Scans the repository
- Posts results as PR comments
- Uploads JSON reports as artifacts

## 🎯 Next Steps for Development

### Adding More Features

Edit `src/scanners/featureDetector.ts` to add more patterns:

```typescript
const jsPatterns = [
  { pattern: /\bYourFeature\b/g, featureId: 'your-feature-id' },
  // ... more patterns
];
```

Feature IDs must match those in the `web-features` package.

### Check Available Feature IDs

```bash
node -e "const features = require('web-features').features; console.log(Object.keys(features));"
```

### Improving Detection Accuracy

Current implementation uses regex. Future improvements:

1. **AST Parsing**: Use Babel/TypeScript parser for accurate JavaScript detection
2. **PostCSS**: Parse CSS with PostCSS for better selector matching
3. **HTML Parser**: Use htmlparser2 for proper HTML element detection
4. **Context Awareness**: Detect features only when actually used, not in comments

## 🏆 Hackathon Submission Checklist

- [x] Working CLI tool
- [x] Integrates with `web-features` package
- [x] Solves developer pain point
- [x] GitHub Actions integration
- [x] Comprehensive documentation
- [x] Example usage
- [x] Open source (MIT License)
- [ ] Video demo (create if required)
- [ ] Submit to Devpost

## 📹 Demo Script

When creating your demo video:

1. **Introduction** (30s):
   - Show the problem: jumping between MDN, caniuse
   - Introduce Baseline CLI as the solution

2. **Local Usage** (1 min):
   - `baseline scan` on a real project
   - Show the summary report
   - Explain the color-coding (✅ ⚠️ 🧪)

3. **Configuration** (30s):
   - Show `.baselinerc.json`
   - Customize ignore patterns
   - Try `--format json`

4. **GitHub Actions** (1 min):
   - Run `baseline init --github`
   - Show the generated workflow file
   - Explain how it posts PR comments

5. **Badge Generation** (30s):
   - Run `baseline badge`
   - Show the generated badge
   - Add to README

6. **Conclusion** (30s):
   - Recap benefits
   - Call to action: try it in your projects

## 🐛 Troubleshooting

### "Cannot find module 'web-features'"

```bash
npm install
```

### TypeScript compilation errors

```bash
npm install -D typescript @types/node
npm run build
```

### Feature not detected

Check if the feature ID exists in `web-features`:

```bash
node -e "const f = require('web-features').features; console.log(f['your-feature-id']);"
```

### CLI not found after `npm link`

```bash
npm unlink
npm run build
npm link
```

## 📚 Resources

- [Baseline Initiative](https://web.dev/baseline/)
- [Web Features Package](https://github.com/web-platform-dx/web-features)
- [Hackathon Details](https://baseline-tooling-hackathon.devpost.com/)

## 🤝 Contributing

Ideas for contributors:

1. Add more feature detection patterns
2. Implement AST-based parsing
3. Create IDE extensions (VS Code, WebStorm)
4. Add browser target configuration
5. Build a web dashboard
6. Create polyfill recommendations
7. Add pre-commit hook integration

## 📄 License

MIT License - see [LICENSE](LICENSE) file

---

**Ready to submit?** Review [HACKATHON.md](HACKATHON.md) for submission details!
