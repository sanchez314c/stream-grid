# StreamGRID Documentation Index

## Overview

This document provides a comprehensive index of all StreamGRID documentation, organized by topic and purpose.

## Core Documentation

### Getting Started
- **[README.md](../README.md)** - Project overview, features, and quick start guide
- **[QUICK_START.md](QUICK_START.md)** - Minimal steps to get StreamGRID running
- **[INSTALLATION.md](INSTALLATION.md)** - Detailed installation and setup instructions

### Development
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Development environment setup and workflow
- **[BUILD_COMPILE.md](BUILD_COMPILE.md)** - Build system guide and compilation instructions
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines and pull request process

### Architecture & API
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and design patterns
- **[API.md](API.md)** - Complete API reference documentation
- **[AGENTS.md](AGENTS.md)** - AI agent guidance and development assistance

### Configuration & Deployment
- **[TECHSTACK.md](TECHSTACK.md)** - Technology stack and dependencies
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment strategies and configuration
- **[WORKFLOW.md](WORKFLOW.md)** - Development workflow and processes

### Project Management
- **[PRD.md](PRD.md)** - Product requirements document
- **[TODO.md](TODO.md)** - Development roadmap and feature backlog
- **[CHANGELOG.md](CHANGELOG.md)** - Version history and release notes
- **[LEARNINGS.md](LEARNINGS.md)** - Project insights and lessons learned

### Support & Reference
- **[FAQ.md](FAQ.md)** - Frequently asked questions
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions
- **[SECURITY.md](SECURITY.md)** - Security policy and vulnerability reporting
- **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)** - Community guidelines

## Documentation by Audience

### For Users
- **New Users**: Start with README.md → QUICK_START.md
- **Installation**: INSTALLATION.md
- **Troubleshooting**: FAQ.md → TROUBLESHOOTING.md
- **Features**: README.md features section

### For Developers
- **Getting Started**: DEVELOPMENT.md → CONTRIBUTING.md
- **Architecture**: ARCHITECTURE.md → API.md
- **Build System**: BUILD_COMPILE.md
- **Code Style**: DEVELOPMENT.md code style section

### For System Administrators
- **Deployment**: DEPLOYMENT.md
- **Configuration**: INSTALLATION.md configuration section
- **Security**: SECURITY.md
- **Performance**: ARCHITECTURE.md performance section

### For Contributors
- **First Steps**: CONTRIBUTING.md → DEVELOPMENT.md
- **Project Understanding**: PRD.md → ARCHITECTURE.md
- **Technical Details**: API.md → TECHSTACK.md
- **Roadmap**: TODO.md

## Documentation by Topic

### Installation & Setup
- **Quick Start**: QUICK_START.md
- **Detailed Setup**: INSTALLATION.md
- **Development Setup**: DEVELOPMENT.md (prerequisites section)
- **Build from Source**: BUILD_COMPILE.md

### Architecture & Design
- **System Overview**: ARCHITECTURE.md
- **Component Design**: ARCHITECTURE.md (component hierarchy)
- **Data Flow**: ARCHITECTURE.md (data flow section)
- **Security Architecture**: ARCHITECTURE.md (security section)

### API Reference
- **IPC API**: API.md (Electron IPC section)
- **React Components**: API.md (React Component section)
- **Database API**: API.md (Database section)
- **Plugin API**: API.md (Plugin section - future)

### Configuration
- **Application Settings**: INSTALLATION.md (configuration section)
- **Environment Variables**: INSTALLATION.md (environment section)
- **Performance Tuning**: INSTALLATION.md (performance section)
- **Network Configuration**: INSTALLATION.md (network section)

### Development Workflow
- **Local Development**: DEVELOPMENT.md
- **Testing**: DEVELOPMENT.md (testing section)
- **Code Quality**: DEVELOPMENT.md (code quality section)
- **Contributing**: CONTRIBUTING.md

### Deployment & Operations
- **Standalone Deployment**: DEPLOYMENT.md
- **Enterprise Deployment**: DEPLOYMENT.md (enterprise section)
- **Container Deployment**: DEPLOYMENT.md (docker section)
- **Monitoring**: DEPLOYMENT.md (monitoring section)

### Troubleshooting
- **Common Issues**: TROUBLESHOOTING.md
- **Installation Issues**: INSTALLATION.md (troubleshooting section)
- **Performance Issues**: TROUBLESHOOTING.md (performance section)
- **Network Issues**: TROUBLESHOOTING.md (network section)

## Quick Reference

### Common Tasks
| Task | Documentation |
|------|---------------|
| Install StreamGRID | INSTALLATION.md |
| Set up development | DEVELOPMENT.md |
| Add a stream | README.md (usage section) |
| Configure settings | INSTALLATION.md (configuration section) |
| Build from source | BUILD_COMPILE.md |
| Report a bug | CONTRIBUTING.md (reporting issues) |
| Report security issue | SECURITY.md |
| Contribute code | CONTRIBUTING.md |

### File Locations
| File Type | Location | Documentation |
|-----------|----------|---------------|
| Configuration | Platform-specific | INSTALLATION.md (configuration files section) |
| Logs | Platform-specific | INSTALLATION.md (log analysis section) |
| Database | Platform-specific | ARCHITECTURE.md (database section) |
| Source Code | `src/` | DEVELOPMENT.md (project structure) |
| Build Output | `dist/` | BUILD_COMPILE.md |

### Command Reference
| Command | Purpose | Documentation |
|---------|---------|---------------|
| `npm run dev` | Start development | DEVELOPMENT.md |
| `npm run build` | Build application | BUILD_COMPILE.md |
| `npm run dist` | Create distributables | BUILD_COMPILE.md |
| `npm test` | Run tests | DEVELOPMENT.md |
| `npm run lint` | Check code style | DEVELOPMENT.md |

## Documentation Standards

### File Organization
- All documentation in Markdown format
- Consistent heading structure (H1, H2, H3)
- Code blocks with syntax highlighting
- Internal links use relative paths
- External links open in new tabs

### Writing Style
- Clear, concise language
- Active voice preferred
- Technical terms explained on first use
- Examples provided for complex concepts
- Step-by-step instructions for procedures

### Code Examples
- Complete, working examples
- Language-specific syntax highlighting
- Comments explaining key concepts
- Error handling included where relevant
- Platform differences noted

## Documentation Maintenance

### Version Control
- Documentation versioned with releases
- CHANGELOG.md tracks documentation changes
- Major updates noted in release notes
- Backward compatibility maintained where possible

### Review Process
- Documentation reviewed with each feature
- Technical accuracy verified
- User feedback incorporated
- Regular audits for completeness

### Updates
- API changes documented immediately
- New features documented before release
- Deprecation notices provided
- Migration guides for breaking changes

## Getting Help

### Documentation Issues
- **Typos/Errors**: Create GitHub issue with `documentation` label
- **Missing Information**: Request additions via GitHub discussions
- **Confusing Sections**: Report with specific suggestions

### Additional Resources
- **GitHub Repository**: https://github.com/spacewelder314/streamgrid
- **Issue Tracker**: GitHub issues
- **Discussions**: GitHub discussions for questions
- **Community**: Discord/Slack (links in README)

## Navigation Tips

### Searching Documentation
- Use GitHub search for specific terms
- Check table of contents in each document
- Look for cross-references between documents
- Use browser find (Ctrl+F) for quick searches

### Reading Order
1. **New Users**: README → QUICK_START → INSTALLATION
2. **Developers**: DEVELOPMENT → CONTRIBUTING → ARCHITECTURE
3. **Administrators**: DEPLOYMENT → SECURITY → TROUBLESHOOTING
4. **Contributors**: All documents, focusing on areas of contribution

This documentation index should help you quickly find the information you need. For the most current information, always check the GitHub repository.