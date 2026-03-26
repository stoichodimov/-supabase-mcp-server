# Contributing to Supabase MCP Server

First off, thanks for taking the time to contribute! ❤️

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps which reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots and animated GIFs if possible**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and expected behavior**
- **Explain why this enhancement would be useful**

### Pull Requests

- Fill in the required template
- Follow the style guides
- Follow all instructions in the template
- Include appropriate test cases

## Style Guides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

### JavaScript/Node.js Style Guide

- Use ES6+ features
- Use `const` by default, `let` if you need to reassign
- Use arrow functions where appropriate
- Comment complex logic
- Keep functions small and focused

### Documentation Style Guide

- Use clear and concise language
- Include code examples where helpful
- Keep documentation in sync with code changes

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/supabase-mcp-server.git`
3. Add upstream: `git remote add upstream https://github.com/original-owner/supabase-mcp-server.git`
4. Create a branch: `git checkout -b my-feature`
5. Install dependencies: `npm install`
6. Start development: `npm run dev`
7. Make your changes
8. Commit your changes: `git commit -am 'Add feature'`
9. Push to your fork: `git push origin my-feature`
10. Create a Pull Request

## Testing

- Test your changes locally before submitting
- Test with both authentication methods (Email/Password and GitHub)
- Test note CRUD operations
- Check that database isolation works correctly

## License

By contributing to this project, you agree that your contributions will be licensed under its MIT License.
