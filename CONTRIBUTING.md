# Contributing to FF Clash Tournament Management System

Thank you for your interest in contributing to FF Clash! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues
- Use the [Issues](https://github.com/cyber-wahid/Tournament-App-For-Free-Fire/issues) page
- Provide detailed information about the bug or feature request
- Include steps to reproduce for bugs
- Use appropriate labels

### Suggesting Features
- Open an issue with the "enhancement" label
- Describe the feature and its benefits
- Consider the impact on existing functionality

### Code Contributions
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 🛠️ Development Setup

### Prerequisites
- Node.js (v18 or higher)
- MySQL database
- Git

### Local Development
```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/Tournament-App-For-Free-Fire.git
cd Tournament-App-For-Free-Fire

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database and SMTP settings

# Run database migrations
npx drizzle-kit push

# Start development server
npm run dev
```

## 📝 Code Style Guidelines

### TypeScript
- Use TypeScript for all new code
- Follow existing type patterns
- Use proper type annotations
- Avoid `any` types when possible

### React Components
- Use functional components with hooks
- Follow the existing component structure
- Use proper prop types
- Keep components focused and reusable

### Database
- Use Drizzle ORM for all database operations
- Follow existing schema patterns
- Create migrations for schema changes
- Use proper foreign key relationships

### Styling
- Use Tailwind CSS classes
- Follow the existing design system
- Maintain responsive design
- Use consistent spacing and colors

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests
- Write tests for new features
- Test both success and error cases
- Use descriptive test names
- Mock external dependencies

## 📋 Pull Request Guidelines

### Before Submitting
- [ ] Code follows the style guidelines
- [ ] Tests pass locally
- [ ] Documentation is updated
- [ ] No console.log statements
- [ ] No commented-out code

### PR Description
- Describe what the PR does
- Reference related issues
- Include screenshots for UI changes
- List any breaking changes

### Review Process
- All PRs require review
- Address feedback promptly
- Keep PRs focused and small
- Update documentation as needed

## 🐛 Bug Reports

### Required Information
- **Description**: Clear description of the bug
- **Steps to Reproduce**: Detailed steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: OS, browser, Node.js version
- **Screenshots**: If applicable

### Bug Report Template
```markdown
## Bug Description
Brief description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Environment
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 91]
- Node.js: [e.g. v18.0.0]

## Additional Context
Any other context about the problem
```

## ✨ Feature Requests

### Required Information
- **Feature Description**: Clear description
- **Use Case**: Why is this needed?
- **Proposed Solution**: How should it work?
- **Alternatives**: Other solutions considered

### Feature Request Template
```markdown
## Feature Description
Brief description of the feature

## Use Case
Why is this feature needed?

## Proposed Solution
How should this feature work?

## Alternatives
What other solutions have you considered?

## Additional Context
Any other context or screenshots
```

## 📚 Documentation

### Code Documentation
- Document complex functions
- Use JSDoc for functions
- Keep README.md updated
- Document API endpoints

### User Documentation
- Update user guides for new features
- Include screenshots
- Keep installation instructions current
- Document configuration options

## 🔒 Security

### Reporting Security Issues
- **DO NOT** open public issues for security vulnerabilities
- Email security issues to: [security@yourdomain.com]
- Include detailed information about the vulnerability
- Allow time for response before public disclosure

### Security Guidelines
- Never commit secrets or API keys
- Use environment variables for sensitive data
- Validate all user inputs
- Use proper authentication and authorization

## 🏷️ Labels

### Issue Labels
- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Improvements to documentation
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention is needed
- `question`: Further information is requested

### PR Labels
- `ready for review`: Ready for review
- `work in progress`: Still being worked on
- `needs testing`: Requires testing
- `breaking change`: Breaking change

## 🎯 Roadmap

### Current Priorities
- [ ] Real-time tournament updates
- [ ] Mobile responsiveness improvements
- [ ] Advanced admin analytics
- [ ] Multi-language support

### Future Considerations
- Mobile app development
- Tournament streaming integration
- Advanced reporting features
- API for third-party integrations

## 💬 Community

### Getting Help
- Check existing issues and discussions
- Join our community discussions
- Ask questions in issues with `question` label

### Code of Conduct
- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow GitHub's community guidelines

## 📄 License

By contributing to FF Clash, you agree that your contributions will be licensed under the GNU General Public License v3.0.

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to FF Clash! 🎮🔥
