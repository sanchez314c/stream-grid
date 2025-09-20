# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in StreamGRID, please report it responsibly by emailing our security team.

**Please do NOT create a public GitHub issue for security vulnerabilities.**

## Supported Versions

We provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Best Practices

### For Users
- Only download StreamGRID from official sources
- Keep the application updated to the latest version
- Be cautious when adding RTMP stream URLs from untrusted sources
- Use network firewalls to limit outbound connections if needed

### For Developers
- All RTMP URLs are validated before connection attempts
- IPC communication uses secure patterns with context isolation
- User inputs are sanitized to prevent injection attacks
- Rate limiting is implemented for reconnection attempts
- Native modules are verified and rebuilt during installation

## Security Features

StreamGRID implements several security measures:

1. **Context Isolation**: Renderer processes run in isolated contexts
2. **IPC Security**: All inter-process communication is validated
3. **Input Sanitization**: Stream labels and URLs are sanitized
4. **Network Validation**: RTMP URLs are validated before connection
5. **Rate Limiting**: Connection attempts are rate-limited to prevent abuse

## Third-Party Dependencies

We regularly audit our dependencies for security vulnerabilities using:
- npm audit
- Dependabot security alerts
- Manual security reviews

## Contact

For security-related concerns, please contact: security@streamgrid.app

Response time: We aim to acknowledge security reports within 24 hours and provide updates within 72 hours.