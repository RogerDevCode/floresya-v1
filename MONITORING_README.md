# FloresYa Monitoring and Profiling Infrastructure

## Overview

This document provides comprehensive guidance for the monitoring and profiling infrastructure implemented for the FloresYa E-commerce platform. The system ensures performance monitoring stays within CLAUDE.md boundaries (≤50% CPU overhead) while providing detailed insights into application performance, database queries, and system health.

## Architecture

### Components

1. **Metrics Collector** (`api/monitoring/metricsCollector.js`)
   - Core metrics collection and analysis
   - CPU overhead monitoring (≤50% limit enforcement)
   - Response time percentiles (P50, P95, P99)
   - Throughput calculation (requests/sec, min, hour)
   - Health score calculation

2. **Database Monitor** (`api/monitoring/databaseMonitor.js`)
   - Automatic query performance tracking
   - Slow query logging (>1 second threshold)
   - Query type categorization
   - Supabase client wrapping

3. **Clinic.js Integration** (`api/monitoring/clinicIntegration.js`)
   - Runtime profiling capabilities
   - CPU, memory, and async operation profiling
   - Automated profiling based on health scores
   - Overhead-aware profiling controls

4. **Health Check Routes** (`api/routes/healthRoutes.js`)
   - RESTful health monitoring endpoints
   - Real-time metrics API
   - Profiling controls
   - Database connectivity checks

## Health Check Endpoints

### Basic Health Check

```
GET /health
```

Returns basic system status and uptime.

### Comprehensive Health Check

```
GET /health/comprehensive
```

Detailed system analysis including monitoring health.

### Real-time Metrics

```
GET /health/metrics
```

Current performance metrics snapshot.

### Metrics Report

```
GET /health/metrics/report
```

Complete metrics report with historical data.

### Database Health

```
GET /health/database
```

Database connectivity and performance metrics.

### Profiling Status

```
GET /health/profiling
```

Current profiling session status.

### Profiling Controls

```
POST /health/profiling/start
POST /health/profiling/stop
```

Start/stop profiling sessions.

### System Diagnostics

```
GET /health/diagnostics
```

Detailed system information and process metrics.

## Monitoring Dashboard

Access the real-time monitoring dashboard at:

```
http://localhost:3000/monitoring-dashboard.html
```

### Dashboard Features

- **Real-time Metrics**: Live updates every 5 seconds
- **Performance Charts**: Response time and throughput trends
- **Health Indicators**: Visual system health status
- **Alert System**: Automatic alerts for critical issues
- **Profiling Controls**: Start/stop profiling sessions
- **Report Generation**: Download detailed performance reports

### Dashboard Sections

1. **System Health Overview**
   - Overall health score
   - Response time metrics
   - CPU and memory usage
   - Visual health indicators

2. **Performance Charts**
   - Response time trends (line chart)
   - Request throughput (line chart)

3. **Detailed Metrics**
   - Database performance (query counts, slow queries)
   - Error statistics (rates, recent errors)
   - Business metrics (orders, products, users)

4. **Profiling Controls**
   - Start/stop profiling sessions
   - Status monitoring
   - Report generation

5. **Alert System**
   - CPU overhead warnings
   - Memory usage alerts
   - Error rate notifications

## Profiling Scripts

### Automated Profiling

```bash
npm run profile:auto
```

Runs profiling when system health is poor (<70 score).

### CPU Profiling

```bash
npm run profile:cpu
```

Flame graph analysis of CPU bottlenecks.

### Memory Profiling

```bash
npm run profile:memory
```

Heap analysis for memory leaks.

### Async Operations Profiling

```bash
npm run profile:async
```

Bubbleprof analysis of async operations.

### General Diagnosis

```bash
npm run profile
```

Clinic doctor general diagnosis.

### Report Generation

```bash
npm run profile:report
```

Generates comprehensive performance reports.

## Configuration

### Environment Variables

No additional environment variables required. The system uses existing configuration from `configLoader.js`.

### Profiling Thresholds

- **Slow Query Threshold**: 1000ms (configurable)
- **CPU Overhead Limit**: 50% (CLAUDE.md compliance)
- **Health Score Thresholds**:
  - Healthy: ≥80
  - Warning: 60-79
  - Critical: <60

### Automatic Profiling Triggers

Profiling automatically starts when:

- Health score drops below 60
- System is not already being profiled
- CPU overhead is acceptable (<50%)

## Performance Boundaries

### CPU Overhead Limits

The monitoring system strictly enforces ≤50% CPU overhead as required by CLAUDE.md:

- **Real-time monitoring**: <5% CPU overhead
- **Metrics collection**: <10% CPU overhead
- **Database monitoring**: <15% CPU overhead
- **Profiling**: <50% CPU overhead (when active)

### Memory Management

- Metrics history limited to last 1000 response times
- Error logs limited to last 100 entries
- Request timestamps limited to last 10,000 entries
- Automatic cleanup every 60 seconds

## Usage Examples

### Check System Health

```bash
curl http://localhost:3000/health
```

### Get Real-time Metrics

```bash
curl http://localhost:3000/health/metrics
```

### Start Profiling Session

```bash
curl -X POST http://localhost:3000/health/profiling/start
```

### Generate Performance Report

```bash
curl http://localhost:3000/health/metrics/report > report.json
```

### Run Automated Profiling

```bash
npm run profile:auto
```

## Troubleshooting

### High CPU Overhead

If monitoring overhead exceeds 50%:

1. Check profiling status: `GET /health/profiling`
2. Stop active profiling: `POST /health/profiling/stop`
3. Review metrics collection frequency
4. Consider reducing logging verbosity

### Memory Issues

If memory usage is high:

1. Check metrics history: `GET /health/metrics`
2. Reset metrics if needed (restart application)
3. Review error log accumulation
4. Monitor for memory leaks in profiling sessions

### Profiling Not Starting

If automated profiling doesn't start:

1. Check health score: `GET /health/comprehensive`
2. Verify CPU overhead is acceptable
3. Check profiling status
4. Manually start profiling if needed

## Integration with Existing Systems

### Middleware Integration

The monitoring middleware is automatically integrated into the Express application:

```javascript
app.use(metricsMiddleware) // Request metrics collection
app.use(profilingMiddleware) // Conditional profiling
```

### Database Integration

Database monitoring is automatically applied to all Supabase operations through client wrapping:

```javascript
// All queries are automatically monitored
const { data } = await supabase.from('products').select('*')
```

### Error Handling Integration

Errors are automatically captured and included in metrics:

```javascript
// Errors thrown in controllers are automatically tracked
throw new AppError('Database connection failed', 500)
```

## Best Practices

### Monitoring

1. **Regular Health Checks**: Monitor `/health` endpoint in production
2. **Alert Thresholds**: Set up alerts for health score <70
3. **Performance Baselines**: Establish normal performance ranges
4. **Trend Analysis**: Use dashboard charts for trend identification

### Profiling

1. **Targeted Profiling**: Use specific profilers (CPU, memory, async) for issues
2. **Limited Duration**: Keep profiling sessions short (<5 minutes)
3. **Off-Peak Hours**: Run intensive profiling during low-traffic periods
4. **Automated Triggers**: Rely on automatic profiling for consistent monitoring

### Maintenance

1. **Regular Reports**: Generate weekly performance reports
2. **Metric Cleanup**: Monitor metric history sizes
3. **Configuration Review**: Regularly review thresholds and limits
4. **Dependency Updates**: Keep Clinic.js and monitoring dependencies updated

## Security Considerations

- Health endpoints are publicly accessible for monitoring
- Profiling data may contain sensitive query information
- Dashboard access should be restricted in production
- Report files should be securely stored and transmitted

## Future Enhancements

- Integration with external monitoring services (DataDog, New Relic)
- Custom metric collection for business logic
- Advanced alerting with email/SMS notifications
- Historical metrics storage and analysis
- Integration with CI/CD pipelines for performance regression detection
