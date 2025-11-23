# Performance Benchmarking Suite

A comprehensive performance benchmarking system for the FloresYa e-commerce platform that automatically detects performance regressions and provides detailed analysis reports.

## Overview

The benchmarking suite includes:

- **API Endpoint Benchmarks**: Tests key API endpoints for response times, throughput, and error rates
- **Database Query Benchmarks**: Measures database query performance and indexing efficiency
- **Cache Performance Benchmarks**: Evaluates multi-level cache operations and hit rates
- **Regression Detection**: Automatically compares results against baselines and detects performance degradation
- **Alerting System**: Sends notifications via Slack, email, and GitHub issues when regressions are detected
- **CI/CD Integration**: Runs automatically in GitHub Actions with configurable thresholds

## Quick Start

### Prerequisites

- Node.js 20.x
- Running application server
- Database connection (Supabase)
- Cache service (Redis)

### Installation

The benchmarking scripts are included in the project. No additional installation required.

### Running Benchmarks

```bash
# Run full benchmark suite
npm run benchmark

# Run CI-optimized benchmarks (faster, fewer iterations)
npm run benchmark:ci

# Run with custom options
node scripts/benchmarking/benchmark-runner.js --iterations 50 --concurrency 5
```

### Benchmark Options

- `--iterations <number>`: Number of iterations per benchmark (default: 100/50 for CI)
- `--concurrency <number>`: Concurrent operations (default: 10/5 for CI)
- `--output-dir <path>`: Output directory for results (default: ./benchmark-results)
- `--baseline-file <path>`: Baseline file for regression comparison (default: ./benchmark-baseline.json)
- `--regression-threshold <number>`: Regression threshold as decimal (default: 0.1 = 10%)

## Benchmark Components

### 1. API Benchmarks (`api-benchmark.js`)

Tests key API endpoints including:

- Health check endpoint
- Product listing and search
- User profile operations
- Order management
- Occasion/special offers

**Metrics Collected:**

- Response time (average, P95)
- Throughput (requests/second)
- Error rate
- Status code distribution

### 2. Database Benchmarks (`database-benchmark.js`)

Tests database query performance:

- Simple product selects
- Complex joins and filtering
- Search queries
- Analytics queries

**Metrics Collected:**

- Query execution time
- Connection pooling efficiency
- Index usage effectiveness

### 3. Cache Benchmarks (`cache-benchmark.js`)

Evaluates caching performance:

- L1 cache operations (memory)
- L2 cache operations (Redis)
- Cache hit/miss ratios
- Invalidation performance

**Metrics Collected:**

- Cache operation latency
- Hit/miss rates
- Throughput
- Memory efficiency

## Regression Detection

The system automatically detects performance regressions by:

1. **Baseline Comparison**: Compares current results against stored baseline
2. **Threshold Analysis**: Flags degradation exceeding configurable thresholds
3. **Multi-Metric Evaluation**: Checks response time, throughput, and error rates
4. **Historical Trending**: Tracks performance over time

### Regression Thresholds

- **Response Time**: >10% increase (configurable)
- **Throughput**: >10% decrease (configurable)
- **Error Rate**: >5% absolute increase
- **Critical Threshold**: >25% degradation (immediate action required)

## Alerting System

When regressions are detected, alerts are sent via:

### Slack Notifications

- Real-time alerts to dedicated channels
- Detailed regression information
- Direct links to reports

### Email Alerts

- HTML-formatted reports
- Comprehensive performance summaries
- Actionable recommendations

### GitHub Issues

- Automatic issue creation
- Performance regression tracking
- Integration with development workflow

### Configuration

Set environment variables for alerting:

```bash
# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ALERT_FROM_EMAIL=performance@floresya.com
ALERT_TO_EMAILS=user1@example.com,user2@example.com

# GitHub (automatic with GitHub Actions)
```

## CI/CD Integration

### GitHub Actions Workflow

The benchmarking suite is integrated into the CI/CD pipeline:

```yaml
- name: Run automated performance benchmarks
  run: npm run benchmark:ci
  env:
    NODE_ENV: test
    BASE_URL: http://localhost:3000
    SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    SUPABASE_KEY: ${{ secrets.SUPABASE_KEY }}
    SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}

- name: Check for performance regressions
  run: |
    # Regression detection logic
    # Fails build on significant regressions
```

### Quality Gates

- **Performance Regression**: Fails build if degradation >10%
- **Health Check**: Validates API response time <2 seconds
- **Error Rate**: Monitors for significant error rate increases
- **Baseline Updates**: Automatically updates baselines on successful runs

## Reports and Analytics

### HTML Reports

Interactive HTML reports include:

- Performance dashboards
- Trend analysis charts
- Detailed benchmark results
- Regression comparisons
- Environment information

### JSON Data Export

Structured JSON output for:

- Integration with monitoring systems
- Historical data analysis
- Custom reporting tools

### Trend Analysis

- 7-day performance trending
- Regression pattern detection
- Performance forecasting
- Seasonal analysis

## Configuration

### Benchmark Configuration (`benchmark-config.js`)

Centralized configuration for:

- Benchmark parameters
- Threshold settings
- Environment-specific overrides
- Alerting preferences

### Environment Overrides

Different settings for development, staging, and production:

```javascript
environments: {
  development: {
    iterations: 20,
    thresholds: { regressionThreshold: 0.2 } // More lenient
  },
  production: {
    iterations: 100,
    thresholds: { regressionThreshold: 0.1 } // Strictest
  }
}
```

## Troubleshooting

### Common Issues

#### Benchmarks Failing to Connect

- Ensure application server is running
- Verify database connections
- Check cache service availability

#### High Error Rates

- Review application logs
- Check database performance
- Validate API endpoints

#### False Positive Regressions

- Adjust regression thresholds
- Review baseline data
- Consider environmental factors

### Debug Mode

Run benchmarks with verbose logging:

```bash
DEBUG=benchmark:* npm run benchmark
```

### Manual Baseline Management

```bash
# Reset baseline
rm benchmark-baseline.json

# Create custom baseline
cp benchmark-results/benchmark-*.json benchmark-baseline.json
```

## Performance Optimization

### Recommendations

Based on benchmark results, the system provides:

- **Database Optimization**: Index recommendations, query improvements
- **API Optimization**: Caching strategies, response optimization
- **Cache Tuning**: Configuration adjustments, sizing recommendations
- **Infrastructure Scaling**: Resource allocation guidance

### Automated Actions

Future enhancements may include:

- Automatic index creation
- Cache configuration optimization
- Resource scaling recommendations

## Integration with Monitoring

The benchmarking system integrates with existing monitoring infrastructure:

- **Metrics Collector**: Feeds performance data to existing metrics
- **Health Checks**: Enhances health check endpoints
- **Logging**: Structured logging for performance events
- **Dashboards**: Data export for monitoring dashboards

## Contributing

### Adding New Benchmarks

1. Create benchmark module in `scripts/benchmarking/`
2. Implement required interface methods
3. Add to benchmark runner
4. Update configuration
5. Add tests

### Extending Alerting

1. Add new alert channel in `performance-alerts.js`
2. Update configuration schema
3. Add environment variables
4. Test alerting functionality

## License

MIT License - see project license file.

## Support

For issues with the benchmarking system:

1. Check benchmark logs
2. Review configuration settings
3. Validate environment setup
4. Create issue in project repository
