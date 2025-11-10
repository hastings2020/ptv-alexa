# Contributing to Alexa PTV Train Times

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Keep discussions professional and on-topic

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report:
1. Check the [Troubleshooting section](README.md#troubleshooting) in the README
2. Search existing issues to see if the problem has already been reported
3. Try to isolate the problem and create a minimal reproduction

When creating a bug report, include:
- Clear and descriptive title
- Exact steps to reproduce the problem
- Expected behavior vs actual behavior
- Your environment (Node.js version, AWS region, etc.)
- Relevant logs from CloudWatch
- Screenshots if applicable

### Suggesting Enhancements

Enhancement suggestions are welcome! Please:
1. Use a clear and descriptive title
2. Provide a detailed description of the proposed feature
3. Explain why this enhancement would be useful
4. Provide examples of how the feature would work

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Follow the coding style** used throughout the project
3. **Add tests** for any new functionality
4. **Update documentation** if you change functionality
5. **Ensure tests pass** before submitting
6. **Write clear commit messages**

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- AWS Account and CLI configured
- PTV API credentials
- Git

### Setup Steps

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/alexa-ptv-skill.git
cd alexa-ptv-skill

# Install dependencies
cd lambda
npm install

# Copy environment variables
cp .env.example .env
# Edit .env and add your PTV credentials

# Run tests
npm test

# Run tests in watch mode (for development)
npm run test:watch
```

## Project Structure

```
alexa-ptv-skill/
├── lambda/              # Lambda function code
│   ├── index.js         # Main handler (Alexa intent handlers)
│   ├── ptvApi.js        # PTV API integration
│   └── utils.js         # Utility functions
├── tests/               # Unit tests
├── skill-package/       # Alexa skill configuration
└── docs/                # Documentation
```

## Coding Guidelines

### JavaScript Style

- Use ES6+ features (const, let, arrow functions, async/await)
- Use meaningful variable and function names
- Add JSDoc comments for functions
- Follow existing code formatting
- Use 4 spaces for indentation
- Maximum line length: 100 characters

### Example

```javascript
/**
 * Format departure time for speech output
 * @param {string} departureTimeUTC - ISO 8601 datetime string
 * @returns {string} Formatted time string
 */
function formatDepartureTime(departureTimeUTC) {
    const now = new Date();
    const departure = new Date(departureTimeUTC);
    const diffMinutes = Math.floor((departure - now) / 60000);

    if (diffMinutes < 0) return 'now';
    if (diffMinutes === 1) return 'in 1 minute';
    return `in ${diffMinutes} minutes`;
}
```

### Alexa Voice Design

When adding new intents or responses:
- Use natural, conversational language
- Keep responses concise (under 30 seconds of speech)
- Provide clear error messages
- Include re-prompts for clarification
- Test pronunciation of station names

### Error Handling

Always handle errors gracefully:

```javascript
try {
    const station = await ptvApi.searchStation(stationName);
    if (!station) {
        // Provide helpful user feedback
        return 'I couldn\'t find that station. Please try again.';
    }
    // Continue with logic
} catch (error) {
    console.error('Error:', error);
    // Return user-friendly error message
    return 'Sorry, I had trouble getting that information.';
}
```

## Testing

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

- Write tests for all new functionality
- Use descriptive test names
- Test both success and failure cases
- Mock external API calls
- Aim for >80% code coverage

Example test:

```javascript
describe('formatDepartureTime', () => {
    it('should format departure in minutes', () => {
        const futureTime = new Date(Date.now() + 5 * 60000).toISOString();
        const result = formatDepartureTime(futureTime);
        expect(result).toBe('in 5 minutes');
    });

    it('should handle past times', () => {
        const pastTime = new Date(Date.now() - 1000).toISOString();
        const result = formatDepartureTime(pastTime);
        expect(result).toBe('now');
    });
});
```

## Commit Messages

Write clear, concise commit messages:

```
Add support for tram departures

- Add route_type parameter to searchStation
- Update getDepartures to handle trams (route_type 1)
- Add tests for tram functionality
- Update documentation
```

Format:
- First line: Brief summary (50 chars or less)
- Blank line
- Detailed explanation if needed
- List changes with bullet points

## Pull Request Process

1. **Update documentation** for any changed functionality
2. **Add tests** for new features
3. **Update CHANGELOG.md** with your changes
4. **Ensure all tests pass**: `npm test`
5. **Update README.md** if needed
6. **Create PR** with clear description of changes

### PR Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Checklist
- [ ] Tests pass locally
- [ ] Added tests for new functionality
- [ ] Updated documentation
- [ ] Updated CHANGELOG.md
- [ ] No hardcoded credentials or secrets
```

## Feature Requests

We welcome feature requests! Priority areas:

- **Service alerts and disruptions**
- **Tram and bus support**
- **Journey planning**
- **Multi-language support**
- **Location-based features**

## Questions?

- Open an issue with the "question" label
- Check existing documentation first
- Be specific about what you need help with

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- CHANGELOG.md

Thank you for contributing! 🚆
