# 🚀 Quick Publish Guide

Want to publish **right now**? Follow these steps:

## ⚡ 5-Minute Publishing

### 1. Update Your Info (1 min)

Edit `package.json` lines 28 and 32:

```json
"author": "Your Name <your.email@example.com>",
```

```json
"url": "https://github.com/yourusername/baseline-cli.git"
```

### 2. Check Name Availability (30 sec)

```bash
npm view baseline-cli
```

- **Error E404**: Name available! ✅ Continue to step 3
- **Package exists**: Choose different name (step 2b)

#### Step 2b: Use Scoped Name (if needed)

Edit `package.json` line 2:

```json
"name": "@yourusername/baseline-cli",
```

### 3. Login to npm (1 min)

```bash
npm login
```

Don't have an account? Sign up at [npmjs.com](https://www.npmjs.com/signup) first.

### 4. Publish! (1 min)

```bash
npm run build
npm publish
```

Or for scoped package:

```bash
npm run build
npm publish --access public
```

### 5. Verify (30 sec)

```bash
npm view baseline-cli
# or
npm view @yourusername/baseline-cli
```

## ✅ Done!

Users can now install with:

```bash
npm install -g baseline-cli
```

## 🎯 After Publishing

1. **Create GitHub repo** and push your code
2. **Update README** with npm badge
3. **Share on social media** (#baseline #npm #webdev)
4. **Submit to hackathon** with your npm package link!

## 📚 Need More Details?

See [PUBLISHING.md](PUBLISHING.md) for the complete guide.

---

**Pro tip**: Wait to publish until after you've created the GitHub repo, so the repository links in package.json work correctly!
