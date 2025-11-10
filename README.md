# PTV Alexa Skills

This repository contains Alexa skills for Melbourne's Public Transport Victoria (PTV) network.

## 🚆 Alexa PTV Train Times

An Alexa skill that provides real-time train departure information from any Melbourne PTV station.

### Features

- 🚆 Real-time train departures from all Melbourne stations
- 🏠 Save your home station for quick access
- ⏱️ Smart time formatting (minutes or clock time)
- 📱 Visual cards with full departure details
- 🎯 Simple, natural voice interactions

### Quick Start

```bash
cd alexa-ptv-skill
```

See the [Quick Start Guide](alexa-ptv-skill/QUICKSTART.md) for deployment in 15 minutes!

### Sample Interactions

- "Alexa, ask train times when is the next train from Flinders Street"
- "Alexa, ask train times to set my home station to Richmond"
- "Alexa, ask train times when is my next train"

### Documentation

- **[README.md](alexa-ptv-skill/README.md)** - Full documentation
- **[QUICKSTART.md](alexa-ptv-skill/QUICKSTART.md)** - 15-minute setup guide
- **[CONTRIBUTING.md](alexa-ptv-skill/CONTRIBUTING.md)** - Contribution guidelines
- **[CHANGELOG.md](alexa-ptv-skill/CHANGELOG.md)** - Version history

### Requirements

- AWS Account (for Lambda hosting)
- Amazon Developer Account (for Alexa Skill)
- PTV API credentials ([register here](https://www.ptv.vic.gov.au/footer/data-and-reporting/datasets/ptv-timetable-api/))
- Node.js 18+

### Project Structure

```
ptv-alexa/
└── alexa-ptv-skill/          # PTV Train Times Alexa Skill
    ├── lambda/               # Lambda function code
    ├── skill-package/        # Alexa skill configuration
    ├── tests/                # Unit tests
    ├── README.md             # Detailed documentation
    ├── QUICKSTART.md         # Quick setup guide
    └── deploy.sh             # Deployment script
```

## Future Skills

Planned Alexa skills for this repository:

- **PTV Tram Times** - Real-time tram departures
- **PTV Bus Times** - Real-time bus departures
- **PTV Journey Planner** - Multi-modal journey planning
- **PTV Service Alerts** - Service disruptions and notifications

## Getting Started

1. **Get PTV API Credentials**
   - Visit [PTV API Registration](https://www.ptv.vic.gov.au/footer/data-and-reporting/datasets/ptv-timetable-api/)
   - Register for free API access
   - Note your Developer ID and API Key

2. **Choose a Skill**
   - Navigate to the skill directory (e.g., `cd alexa-ptv-skill`)
   - Follow the README or QUICKSTART guide

3. **Deploy**
   - Install dependencies: `npm install`
   - Configure credentials
   - Deploy to AWS Lambda
   - Configure Alexa Skill

## Contributing

Contributions are welcome! Please read the [Contributing Guidelines](alexa-ptv-skill/CONTRIBUTING.md) before submitting pull requests.

### How to Contribute

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Resources

- [PTV Timetable API Documentation](https://www.ptv.vic.gov.au/footer/data-and-reporting/datasets/ptv-timetable-api/)
- [Alexa Skills Kit Documentation](https://developer.amazon.com/en-US/docs/alexa/ask-overviews/what-is-the-alexa-skills-kit.html)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)

## License

MIT License - see [LICENSE](alexa-ptv-skill/LICENSE) for details

## Acknowledgments

- Public Transport Victoria for providing the Timetable API
- Amazon for the Alexa Skills Kit
- The open-source community

## Support

- 📖 Check the documentation in each skill's directory
- 🐛 Report issues on GitHub
- 💡 Suggest features via GitHub issues
- 🤝 Contribute via pull requests

---

**Made with ❤️ for Melbourne commuters**
