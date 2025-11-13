# FloresYa CI/CD Setup Instructions

This document provides comprehensive setup instructions for the FloresYa CI/CD pipeline as recommended in the QA audit.

## Overview

The CI/CD pipeline implements a multi-stage approach:

1. **Linting & Formatting** - Code quality checks
2. **Testing & Coverage** - Unit, integration tests with 80% coverage requirement
3. **Security Scanning** - npm audit and Snyk vulnerability scanning
4. **Performance Testing** - Clinic.js profiling and performance metrics
5. **Build & Validation** - Deployment readiness checks
6. **Integration & E2E Tests** - Full application testing
7. **Deployment** - Preview and production deployments

## Prerequisites

- GitHub repository with Actions enabled
- Node.js 20.x environment
- Supabase project for testing
- Vercel account for deployment (optional)

## Required GitHub Secrets

Set up the following secrets in your GitHub repository settings:

### Required Secrets

```bash
# Supabase Configuration (for testing)
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Code Coverage
CODECOV_TOKEN=your_codecov_token

# Security Scanning
SNYK_TOKEN=your_snyk_api_token

# Deployment (optional)
VERCEL_TOKEN=your_vercel_deployment_token
```

### How to Set Up Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with its corresponding value

## Required GitHub Repository Settings

### 1. Branch Protection Rules

Set up branch protection for `main` branch:

1. Go to **Settings** → **Branches**
2. Click **Add rule**
3. Configure:
   - Branch name pattern: `main`
   - Require status checks to pass before merging
   - Require branches to be up to date before merging
   - Status checks:
     - `lint-and-format`
     - `test-coverage`
     - `security-scan`
     - `performance-test`
     - `build-and-validate`

### 2. Enable GitHub Actions

Ensure GitHub Actions are enabled:

1. Go to **Settings** → **Actions** → **General**
2. Under "Actions permissions", select **Allow all actions**
3. Save changes

## Third-Party Service Setup

### 1. Codecov Setup

1. Sign up at [codecov.io](https://codecov.io)
2. Connect your GitHub repository
3. Copy the repository token
4. Add as `CODECOV_TOKEN` secret in GitHub

### 2. Snyk Setup

1. Sign up at [snyk.io](https://snyk.io)
2. Generate an API token from your account settings
3. Add as `SNYK_TOKEN` secret in GitHub

### 3. Supabase Setup (for Testing)

1. Create a Supabase project for testing
2. Note the project URL and keys
3. Add as GitHub secrets:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create `.env.local` for local development:

```bash
# Copy from .env.example and fill in your values
cp .env.example .env.local
```

### 3. Test the Pipeline Locally

Run individual pipeline stages locally:

```bash
# Linting
npm run lint

# Formatting check
npm run format:check

# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# Coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# Performance profiling
npm run profile:auto
```

## Pipeline Stages Explained

### 1. Lint & Format Check

- Runs ESLint for code quality
- Checks Prettier formatting
- Validates OpenAPI specification
- Ensures API client sync

### 2. Test Coverage

- Runs unit and integration tests
- Generates coverage reports
- **Requires 80% minimum coverage** across all metrics:
  - Lines: 80%
  - Functions: 80%
  - Branches: 80%
  - Statements: 80%
- Uploads reports to Codecov

### 3. Security Scan

- Runs `npm audit` for dependency vulnerabilities
- Uses Snyk for advanced security scanning
- Fails build on high-severity vulnerabilities
- Warns on medium-severity issues

### 4. Performance Test

- Uses Clinic.js for performance profiling
- Measures response times
- Generates performance reports
- Validates health check response time (< 2 seconds)

### 5. Build & Validation

- Builds CSS assets
- Validates build artifacts
- Runs contract validation
- Performs deployment readiness checks
- Creates deployment artifacts

### 6. Integration & E2E Tests

- Runs full API integration tests
- Executes Cypress E2E tests
- Seeds test data
- Validates end-to-end functionality

### 7. Deployment

- Deploys to Vercel preview (PRs)
- Deploys to Vercel production (main branch)
- Creates deployment tags

## Quality Gates

The pipeline enforces these quality gates:

### Code Coverage

- Minimum 80% coverage required
- Fails build if not met
- Reports uploaded to Codecov

### Security

- No high-severity vulnerabilities allowed
- Maximum 5 medium-severity vulnerabilities
- npm audit and Snyk integration

### Performance

- Health check response time < 2 seconds
- Performance profiling reports generated

### Build Validation

- All critical files present
- Dependencies resolved correctly
- Environment variables configured
- Build artifacts generated

## Troubleshooting

### Common Issues

#### 1. Coverage Not Meeting Threshold

```bash
# Check current coverage
npm run test:coverage

# View detailed coverage report
open coverage/index.html
```

#### 2. Security Scan Failures

```bash
# Check vulnerabilities
npm audit

# Run Snyk locally
npx snyk test
```

#### 3. Performance Issues

```bash
# Run performance profiling
npm run profile:auto

# Generate report
npm run profile:report
```

#### 4. Build Failures

```bash
# Check build artifacts
npm run build:css
ls -la public/css/
```

### Pipeline Logs

Access pipeline logs in GitHub Actions:

1. Go to **Actions** tab in your repository
2. Click on the failed workflow run
3. Check individual job logs
4. Download artifacts for detailed reports

## Monitoring and Maintenance

### Regular Tasks

1. **Weekly**: Review security scan results
2. **Monthly**: Update dependencies
3. **Quarterly**: Review and update coverage thresholds if needed

### Alerts and Notifications

Configure GitHub notifications for:

- Failed builds
- Security vulnerabilities
- Coverage drops

## Advanced Configuration

### Customizing Coverage Thresholds

Edit `vitest.config.js`:

```javascript
coverage: {
  thresholds: {
    global: {
      branches: 85,    // Increase to 85%
      functions: 85,
      lines: 85,
      statements: 85
    }
  }
}
```

### Adding New Security Checks

Extend the security scan job in `.github/workflows/ci-cd.yml`:

```yaml
- name: Additional security check
  run: |
    # Add your custom security checks here
    echo "Running custom security scan..."
```

### Performance Benchmarks

Add custom performance benchmarks in the performance test job:

```yaml
- name: Custom performance benchmark
  run: |
    # Add your performance benchmarks here
    echo "Running custom performance tests..."
```

## Support

For issues with the CI/CD pipeline:

1. Check this documentation
2. Review GitHub Actions logs
3. Check the QA audit report for additional context
4. Create an issue in the repository

## Version History

- **v1.0.0**: Initial comprehensive CI/CD implementation
  - Multi-stage pipeline
  - 80% coverage requirement
  - Snyk integration
  - Performance testing
  - Deployment automation
