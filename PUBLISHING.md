# Publishing Baseline CLI to npm

This guide will walk you through publishing your Baseline CLI tool to npm so users can install it with `npm install -g baseline-cli`.

## 📋 Pre-Publishing Checklist

Before publishing, make sure you've completed these steps:

### 1. Update package.json Metadata

✅ **Already done!** But verify these fields are correct:

```json
{
  "name": "baseline-cli",
  "version": "1.0.0",
  "author": "Your Name <your.email@example.com>",  // ← UPDATE THIS
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/baseline-cli.git"  // ← UPDATE THIS
  }
}
```

**Action needed:** Replace "Your Name" and the GitHub URL with your actual information.

### 2. Create npm Account

If you don't have an npm account:

1. Go to [npmjs.com](https://www.npmjs.com/)
2. Click "Sign Up"
3. Create your account
4. Verify your email address

### 3. Check Package Name Availability

The name `baseline-cli` might be taken. Check availability:

```bash
npm view baseline-cli
```

If it returns "npm error code E404", the name is available! ✅

If the package exists, you'll need to either:
- Choose a different name (e.g., `baseline-web-cli`, `@yourname/baseline-cli`)
- Or reach out to the current owner if it's unused

**To use a scoped package name:**

```json
{
  "name": "@yourusername/baseline-cli"
}
```

Users would then install with: `npm install -g @yourusername/baseline-cli`

## 🚀 Publishing Steps

### Step 1: Login to npm

```bash
npm login
```

Enter your:
- Username
- Password
- Email (public)
- One-time password (if 2FA is enabled)

Verify you're logged in:

```bash
npm whoami
```

### Step 2: Build the Project

Make sure your latest changes are compiled:

```bash
npm run build
```

### Step 3: Test the Package Locally

Create a test tarball to see what will be published:

```bash
npm pack --dry-run
```

This shows all files that will be included (you should see `dist/`, `README.md`, `LICENSE`).

### Step 4: Publish to npm!

**For first-time publishing:**

```bash
npm publish
```

**If using a scoped package (@yourname/baseline-cli):**

```bash
npm publish --access public
```

🎉 **That's it!** Your package is now live on npm!

## ✅ Verify Publication

Check that your package is live:

```bash
npm view baseline-cli
# or
npm view @yourusername/baseline-cli
```

Visit your package page:
- https://www.npmjs.com/package/baseline-cli
- https://www.npmjs.com/package/@yourname/baseline-cli

## 📦 Installing Your Published Package

Now anyone can install it globally:

```bash
npm install -g baseline-cli
# or
npm install -g @yourusername/baseline-cli
```

Then use it:

```bash
baseline --help
baseline scan
baseline init --github
baseline badge
```

## 🔄 Publishing Updates

When you make changes and want to publish a new version:

### 1. Update the Version

Use semantic versioning (major.minor.patch):

```bash
# Patch release (bug fixes): 1.0.0 → 1.0.1
npm version patch

# Minor release (new features): 1.0.0 → 1.1.0
npm version minor

# Major release (breaking changes): 1.0.0 → 2.0.0
npm version major
```

This automatically:
- Updates `package.json`
- Creates a git commit
- Creates a git tag

### 2. Build and Publish

```bash
npm run build
npm publish
```

### 3. Push to GitHub

If you have a git repo:

```bash
git push
git push --tags
```

## 🔐 Security Best Practices

### Enable 2FA (Highly Recommended)

1. Go to npmjs.com → Account Settings
2. Enable Two-Factor Authentication
3. Use an authenticator app (Google Authenticator, Authy, etc.)

### Use Access Tokens for CI/CD

If publishing from CI/CD:

1. Generate an automation token: npmjs.com → Access Tokens
2. Store in your CI/CD secrets
3. Use in your workflow:

```bash
npm config set //registry.npmjs.org/:_authToken ${NPM_TOKEN}
npm publish
```

## 📊 Package Statistics

After publishing, you can track:

- **Downloads**: npmjs.com/package/baseline-cli
- **npm trends**: npmtrends.com/baseline-cli
- **Bundle size**: bundlephobia.com/package/baseline-cli

## 🎯 Next Steps After Publishing

### 1. Create a GitHub Repository

```bash
git init
git add .
git commit -m "Initial commit: Baseline CLI v1.0.0"
git branch -M main
git remote add origin https://github.com/yourusername/baseline-cli.git
git push -u origin main
```

### 2. Add Badges to README

Update your README.md with:

```markdown
[![npm version](https://badge.fury.io/js/baseline-cli.svg)](https://www.npmjs.com/package/baseline-cli)
[![npm downloads](https://img.shields.io/npm/dm/baseline-cli.svg)](https://www.npmjs.com/package/baseline-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
```

### 3. Share Your Package

- Post on Twitter/X with #npm #webdev #baseline
- Submit to dev.to or Hashnode
- Share in relevant Reddit communities (r/webdev, r/javascript)
- Post on Product Hunt
- Share in the Baseline Tooling Hackathon Discord/Slack

### 4. Set Up GitHub Actions for Auto-Publishing

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      - run: npm install
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 🐛 Troubleshooting

### "You do not have permission to publish"

- Check you're logged in: `npm whoami`
- Verify package name isn't taken
- If using scoped package, add `--access public`

### "Package name too similar to existing package"

npm may block names too similar to popular packages. Choose a more unique name.

### "ENEEDAUTH"

Run `npm login` again.

### "Version already exists"

You're trying to publish a version that's already on npm. Run `npm version patch` to bump the version.

## 📝 Quick Reference

```bash
# One-time setup
npm login

# Every publish
npm run build
npm version patch  # or minor/major
npm publish

# For scoped packages
npm publish --access public

# Verify
npm view baseline-cli
```

## 🎉 Congratulations!

Your Baseline CLI is now available to developers worldwide! 🌍

Users can install it with:

```bash
npm install -g baseline-cli
```

And start using it immediately:

```bash
baseline scan
```

---

**Need help?** Check the [npm documentation](https://docs.npmjs.com/cli/v9/commands/npm-publish) or reach out to the npm support team.
