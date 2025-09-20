# StreamGRID Task Completion Checklist

## Required Checks Before Completion
When completing any development task in StreamGRID, always run these commands:

### 1. Type Checking
```bash
npm run type-check
```
- Ensures TypeScript compilation without errors
- Verifies all type definitions are correct
- Catches type mismatches between main and renderer processes

### 2. Code Linting
```bash
npm run lint
```
- Runs ESLint with TypeScript support
- Checks React and React Hooks best practices
- Enforces consistent code style

### 3. Testing
```bash
npm run test
```
- Runs Vitest test suite with jsdom environment
- Executes unit tests for utilities and components
- Validates stream validation logic

### 4. Build Verification
```bash
npm run build
```
- Builds both main and renderer processes
- Verifies production build works correctly
- Ensures all imports and dependencies resolve

## Optional but Recommended
- **Manual Testing**: Test core functionality in development mode
- **Performance Check**: Monitor CPU and memory usage with multiple streams
- **Cross-Process Communication**: Verify IPC handlers work correctly

## Native Module Considerations
If working with native modules (like sqlite3):
```bash
npm run rebuild
```
This rebuilds native modules for the current Electron version.

## Distribution Testing
For major changes, test packaging:
```bash
npm run dist:mac    # or dist:win, dist:linux
```

## Git Workflow
- Commit changes with descriptive messages
- Reference issue numbers when applicable
- Include type of change (feat, fix, docs, style, refactor, test, chore)