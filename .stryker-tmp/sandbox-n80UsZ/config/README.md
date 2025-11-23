# Centralized Configuration System

This directory contains the centralized configuration management system for the Floresya project.

## Files

- **default.json** - Default configuration for all environments
- **development.json** - Development-specific overrides
- **production.json** - Production-specific overrides
- **testing.json** - Testing-specific overrides
- **README.md** - This file

## Usage

### In JavaScript/TypeScript

```javascript
import configManager from '../config/config-manager.js'

// Get the full configuration
const config = configManager.getConfig()

// Access values
console.log(config.api.port) // 3000 (or env PORT)
console.log(config.database.url) // Database connection string
console.log(config.logger.level) // INFO (or env LOG_LEVEL)

// Access nested values
const rate = configManager.getNestedValue(config, 'bcv.rate')
```

### Environment Variables

You can override any configuration value using environment variables:

```bash
# Database
export DATABASE_URL="postgresql://localhost:5432/mydb"

# API
export PORT=8080
export HOST="0.0.0.0"

# Logger
export LOG_LEVEL="DEBUG"
export LOG_COLORS="true"
export LOG_FILE="/var/log/app.log"

# Order Generator
export ORDER_GENERATOR_MIN_DAILY=200
export ORDER_GENERATOR_MAX_DAILY=500
export ORDER_GENERATOR_VERBOSE="true"
export ORDER_GENERATOR_LOG_FILE="/var/log/orders.log"

# BCV Rate
export BCV_RATE=36.75

# Testing
export HEADLESS="false"
```

## Configuration Structure

```json
{
  "database": {
    "url": "postgresql://...",
    "maxConnections": 20,
    "timeout": 10000
  },
  "logger": {
    "level": "INFO",
    "colors": true,
    "timestamp": true,
    "file": null
  },
  "api": {
    "port": 3000,
    "host": "localhost",
    "timeout": 30000
  },
  "orderGenerator": {
    "minDaily": 100,
    "maxDaily": 300,
    "minItems": 1,
    "maxItems": 5,
    "verbose": false,
    "logFile": null
  },
  "bcv": {
    "rate": 36.5,
    "updateInterval": 3600000
  },
  "testing": {
    "timeout": 5000,
    "retries": 3,
    "headless": true
  }
}
```

## Environment Selection

The configuration system automatically selects the environment based on:

1. `NODE_ENV` environment variable (default: 'development')
2. Falls back to default.json

## Best Practices

1. **Never commit sensitive data** - Use environment variables for secrets
2. **Use .env files** for local development
3. **Document all config options** in this README
4. **Validate configuration** on startup
5. **Use defaults** for non-critical settings
6. **Log configuration** at startup (without secrets)

## Updating Configuration

To add a new configuration option:

1. Add it to **default.json** with a sensible default
2. Override in environment-specific files if needed
3. Update this README
4. Update type definitions (if using TypeScript)

## Validation

The configuration manager validates all required values on startup:

- database.url
- logger.level
- api.port
- orderGenerator.minDaily
- orderGenerator.maxDaily

If any required value is missing, the application will fail to start.

## Silicon Valley Best Practices Applied

✅ **Single Responsibility** - Config manager only handles configuration
✅ **Dependency Inversion** - Depends on environment variables, not hardcoded values
✅ **Open/Closed** - Easy to add new config options
✅ **Fail Fast** - Validates configuration on startup
✅ **DRY** - Centralized config prevents duplication
✅ **Environment-based** - Different configs for dev/staging/prod

```

## References

- [12-Factor App](https://12factor.net/config)
- [The Config Pattern](https://github.com/lorenwest/node-config)
- [Google Cloud Configuration](https://cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-java-service)
```
