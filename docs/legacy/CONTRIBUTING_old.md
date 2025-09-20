# Contributing to StreamGRID

Thank you for your interest in contributing to StreamGRID! This document provides guidelines and instructions for contributing to this professional RTMP multi-stream viewer.

## Getting Started

### Prerequisites
- Node.js 20.x or higher
- npm (comes with Node.js)
- Git

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd StreamGRID
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   npm run electron:dev
   ```

4. **Verify your setup**
   ```bash
   npm run type-check
   npm run lint
   npm run test
   ```

## Development Workflow

### Code Style
- Follow the existing TypeScript and React patterns
- Use ESLint configuration (run `npm run lint`)
- Follow naming conventions:
  - Components: PascalCase (`StreamTile.tsx`)
  - Files: kebab-case (`stream-validator.ts`)
  - Variables/functions: camelCase
  - Constants: UPPER_SNAKE_CASE

### Commit Guidelines
Use conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code restructuring without feature changes
- `test`: Adding or modifying tests
- `chore`: Build process, dependencies, etc.

Examples:
```
feat(stream): add RTMP stream validation
fix(ui): resolve grid layout calculation issue
docs(readme): update installation instructions
```

### Testing
- Write tests for new features
- Ensure existing tests pass: `npm run test`
- Add integration tests for complex features
- Test on multiple platforms when possible

### Before Submitting
Run the complete validation suite:
```bash
npm run type-check  # TypeScript compilation
npm run lint        # Code linting
npm run test        # Test suite
npm run build       # Production build
```

## Architecture Guidelines

### Project Structure
- `src/main/` - Electron main process
- `src/renderer/` - React application
- `src/preload/` - Preload scripts
- `src/shared/` - Shared types and utilities
- `tests/` - Test files
- `docs/` - Documentation

### State Management
- Use Zustand for global state
- Keep state minimal and normalized
- Use React Query for server state
- Follow immutable update patterns

### IPC Communication
- Use typed IPC channels
- Handle errors gracefully
- Validate inputs on both sides
- Follow security best practices

### Performance
- Monitor CPU and memory usage
- Optimize for 9+ simultaneous streams
- Use hardware acceleration when available
- Implement efficient error recovery

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow coding standards
   - Add tests if applicable
   - Update documentation

3. **Test thoroughly**
   ```bash
   npm run type-check
   npm run lint
   npm run test
   npm run build
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat(scope): your descriptive message"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **PR Requirements**
   - Clear description of changes
   - Link to related issues
   - Screenshots for UI changes
   - Test results
   - Platform compatibility notes

## Issue Guidelines

### Bug Reports
Include:
- StreamGRID version
- Operating system
- Node.js version
- Steps to reproduce
- Expected vs actual behavior
- Error messages/logs
- Screenshots if applicable

### Feature Requests
Include:
- Clear use case description
- Expected behavior
- Alternative solutions considered
- Mockups or examples if helpful

### Performance Issues
Include:
- System specifications
- Number of streams
- Performance metrics
- Reproduction steps

## Code Review Process

All contributions go through code review:
- Focus on code quality, performance, and security
- Ensure tests pass and coverage is maintained
- Verify documentation is updated
- Check platform compatibility
- Validate performance impact

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create release PR
4. Tag release after merge
5. Build and test all platforms
6. Create GitHub release with artifacts

## Getting Help

- Check existing issues and documentation
- Ask questions in discussions
- Join development discussions
- Review the codebase for patterns

## Recognition

Contributors are recognized in:
- Release notes
- Contributors section
- Project documentation

Thank you for contributing to StreamGRID!