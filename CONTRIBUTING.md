# Contributing to Byit Real Estate Platform

Thank you for your interest in contributing to the Byit Real Estate Platform! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- Git
- Code editor (VS Code recommended)

### Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/WGhaly/byit-real-estate-platform.git
   cd byit-real-estate-platform
   ```

2. **Run the setup script:**
   ```bash
   ./setup.sh
   ```

3. **Configure environment:**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your database configuration
   ```

4. **Initialize database:**
   ```bash
   npm run db:migrate
   npm run seed
   ```

5. **Start development servers:**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
byit-real-estate-platform/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Auth, logging, etc.
│   │   ├── controllers/    # Business logic
│   │   └── types/          # TypeScript definitions
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── migrations/     # Database migrations
│   └── package.json
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   ├── components/    # React components
│   │   ├── lib/           # Utilities and API client
│   │   └── types/         # TypeScript definitions
│   └── package.json
├── README.md
├── CONTRIBUTING.md
└── package.json           # Root package.json for scripts
```

## 🛠️ Development Guidelines

### Code Style

- **TypeScript**: Use TypeScript for all new code
- **ESLint**: Follow the ESLint configuration
- **Prettier**: Use Prettier for code formatting
- **Naming**: Use descriptive names for variables and functions

### Commit Messages

Follow the conventional commit format:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(commission): add hierarchical commission calculation
fix(auth): resolve JWT token expiration issue
docs(readme): update installation instructions
```

### Branch Naming

- Feature branches: `feature/description`
- Bug fixes: `fix/description`
- Documentation: `docs/description`
- Hotfixes: `hotfix/description`

**Examples:**
```
feature/broker-performance-dashboard
fix/commission-calculation-bug
docs/api-documentation-update
```

## 🧪 Testing

### Running Tests

```bash
# Frontend tests
cd frontend && npm run test

# Backend tests
cd backend && npm run test

# E2E tests
npm run test:e2e
```

### Writing Tests

- Write unit tests for utilities and business logic
- Write integration tests for API endpoints
- Write component tests for React components
- Use meaningful test descriptions

## 📝 Pull Request Process

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes:**
   - Follow the coding guidelines
   - Add tests for new functionality
   - Update documentation if needed

3. **Test your changes:**
   ```bash
   npm run lint
   npm run type-check
   npm run test
   ```

4. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

5. **Push and create PR:**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create a pull request on GitHub.

### PR Requirements

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No console errors
- [ ] Responsive design (frontend)
- [ ] TypeScript types added

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment:**
   - OS and version
   - Node.js version
   - Browser (for frontend issues)

2. **Steps to reproduce:**
   - Clear, numbered steps
   - Expected vs actual behavior
   - Screenshots if applicable

3. **Code snippets:**
   - Relevant code snippets
   - Error messages
   - Console logs

## 💡 Feature Requests

For feature requests, please provide:

1. **Problem description:**
   - What problem does this solve?
   - Who would benefit?

2. **Proposed solution:**
   - Detailed description
   - Alternative solutions considered
   - Implementation ideas

3. **Additional context:**
   - Screenshots/mockups
   - Links to similar features
   - Priority level

## 🚀 Release Process

1. **Version bump:**
   ```bash
   npm version [patch|minor|major]
   ```

2. **Update changelog:**
   - Document all changes
   - Follow semver guidelines

3. **Create release:**
   - Tag the version
   - Create GitHub release
   - Deploy to staging/production

## 📚 Resources

### Documentation
- [API Documentation](./docs/api.md)
- [Database Schema](./docs/database.md)
- [Deployment Guide](./docs/deployment.md)

### Tools
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

### Egyptian Real Estate Context
- [Commission Rates in Egypt](./docs/egyptian-market.md)
- [Legal Requirements](./docs/legal-compliance.md)
- [Market Standards](./docs/market-standards.md)

## 🤝 Community

- **GitHub Discussions**: For questions and general discussion
- **Issues**: For bug reports and feature requests
- **Pull Requests**: For code contributions
- **Code Review**: All PRs require review

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project.

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

---

**Thank you for contributing to the Byit Real Estate Platform!** 🏠✨
