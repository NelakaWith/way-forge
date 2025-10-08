# Commitizen Setup Guide

This project uses **Commitizen** for standardized conventional commits.

## 🚀 Quick Start

### Option 1: Using npm script (Recommended)

```bash
npm run commit
```

### Option 2: Using global Commitizen

```bash
git cz
```

### Option 3: Using npx

```bash
npx cz
```

## 📝 Commit Types

Commitizen will prompt you to choose from these commit types:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to our CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

## 📋 Commit Flow

1. Stage your changes:

   ```bash
   git add .
   ```

2. Use Commitizen to commit:

   ```bash
   npm run commit
   ```

3. Follow the interactive prompts:
   - Select commit type
   - Enter scope (optional)
   - Write short description
   - Write longer description (optional)
   - Note breaking changes (if any)
   - Reference issues (if any)

## 📖 Example Commits

```
feat(map): add interactive Leaflet map component

- Added MapView component with zoom/pan controls
- Integrated NodeMarker and RouteLine components
- Fixed SSR issues with dynamic imports

Closes #123
```

```
fix(ui): resolve shadcn/ui path import issues

- Updated import paths to use relative imports
- Fixed TypeScript compilation errors
- Added proper type definitions

BREAKING CHANGE: Updated MapView component API
```

## 🔧 Configuration

The Commitizen configuration is in:

- `package.json` - Main config
- `.commitizenrc.json` - Additional settings

## 📚 Benefits

- ✅ **Consistent commit messages**
- ✅ **Automated changelog generation**
- ✅ **Better git history**
- ✅ **Semantic versioning support**
- ✅ **Team collaboration improvement**

## 🔗 Resources

- [Commitizen Documentation](https://github.com/commitizen/cz-cli)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
