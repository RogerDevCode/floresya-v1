/**
 * Benchmark Report Generator
 * Generates comprehensive HTML reports from benchmark results
 */

/**
 * Generate HTML benchmark report
 */
export async function generateBenchmarkReport(results) {
  const timestamp = new Date(results.timestamp).toLocaleString()
  const environment = results.environment

  // Calculate trend data (mock for now - would be loaded from historical data)
  const trendData = generateMockTrendData(results)

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Benchmark Report - ${timestamp}</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }

        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }

        .header p {
            opacity: 0.9;
            font-size: 1.1em;
        }

        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .metric-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }

        .metric-card h3 {
            color: #666;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
        }

        .metric-value {
            font-size: 2em;
            font-weight: bold;
            color: #333;
        }

        .metric-unit {
            font-size: 0.8em;
            color: #666;
        }

        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
        }

        .status-good { background-color: #4CAF50; }
        .status-warning { background-color: #FF9800; }
        .status-critical { background-color: #F44336; }

        .charts-section {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 30px;
            margin-bottom: 30px;
        }

        .chart-container {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .chart-container h3 {
            margin-bottom: 20px;
            color: #333;
            text-align: center;
        }

        .details-section {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }

        .benchmark-details {
            display: grid;
            gap: 20px;
        }

        .benchmark-category {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
        }

        .benchmark-category h4 {
            color: #667eea;
            margin-bottom: 15px;
            font-size: 1.2em;
        }

        .benchmark-metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
        }

        .metric-item {
            text-align: center;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 5px;
        }

        .metric-item .label {
            font-size: 0.8em;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .metric-item .value {
            font-size: 1.2em;
            font-weight: bold;
            color: #333;
        }

        .regressions-section {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }

        .regressions-section h3 {
            color: #F44336;
            margin-bottom: 20px;
        }

        .regression-item {
            background: #ffebee;
            border-left: 4px solid #F44336;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 5px;
        }

        .environment-section {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .environment-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }

        .env-item {
            text-align: center;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 5px;
        }

        .env-item .label {
            font-size: 0.9em;
            color: #666;
            margin-bottom: 5px;
        }

        .env-item .value {
            font-weight: bold;
            color: #333;
        }

        @media (max-width: 768px) {
            .charts-section {
                grid-template-columns: 1fr;
            }

            .summary-grid {
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Performance Benchmark Report</h1>
            <p>Generated on ${timestamp}</p>
        </div>

        <div class="summary-grid">
            <div class="metric-card">
                <h3>Total Operations</h3>
                <div class="metric-value">${results.summary.totalOperations.toLocaleString()}</div>
            </div>
            <div class="metric-card">
                <h3>Average Response Time</h3>
                <div class="metric-value">${results.summary.averageResponseTime.toFixed(2)}</div>
                <div class="metric-unit">ms</div>
            </div>
            <div class="metric-card">
                <h3>Throughput</h3>
                <div class="metric-value">${results.summary.throughput.toFixed(1)}</div>
                <div class="metric-unit">ops/sec</div>
            </div>
            <div class="metric-card">
                <h3>Error Rate</h3>
                <div class="metric-value">${(results.summary.errorRate * 100).toFixed(2)}</div>
                <div class="metric-unit">%</div>
            </div>
        </div>

        <div class="charts-section">
            <div class="chart-container">
                <h3>Response Time Distribution</h3>
                <canvas id="responseTimeChart" width="400" height="300"></canvas>
            </div>
            <div class="chart-container">
                <h3>Performance Trend (7 days)</h3>
                <canvas id="trendChart" width="400" height="300"></canvas>
            </div>
        </div>

        <div class="details-section">
            <h2 style="margin-bottom: 20px; color: #333;">Benchmark Details</h2>
            <div class="benchmark-details">
                ${Object.entries(results.benchmarks)
                  .map(
                    ([category, data]) => `
                    <div class="benchmark-category">
                        <h4>${category.charAt(0).toUpperCase() + category.slice(1)} Benchmarks</h4>
                        <div class="benchmark-metrics">
                            <div class="metric-item">
                                <div class="label">Operations</div>
                                <div class="value">${data.operations || 0}</div>
                            </div>
                            <div class="metric-item">
                                <div class="label">Avg Response</div>
                                <div class="value">${(data.averageResponseTime || 0).toFixed(2)}ms</div>
                            </div>
                            <div class="metric-item">
                                <div class="label">P95 Response</div>
                                <div class="value">${(data.p95ResponseTime || 0).toFixed(2)}ms</div>
                            </div>
                            <div class="metric-item">
                                <div class="label">Throughput</div>
                                <div class="value">${(data.throughput || 0).toFixed(1)}/s</div>
                            </div>
                            <div class="metric-item">
                                <div class="label">Error Rate</div>
                                <div class="value">${((data.errorRate || 0) * 100).toFixed(2)}%</div>
                            </div>
                        </div>
                    </div>
                `
                  )
                  .join('')}
            </div>
        </div>

        ${
          results.regressions && results.regressions.length > 0
            ? `
            <div class="regressions-section">
                <h3>⚠️ Performance Regressions Detected</h3>
                ${results.regressions
                  .map(
                    regression => `
                    <div class="regression-item">
                        <strong>${regression.benchmark} - ${regression.metric}</strong><br>
                        Degraded by ${regression.degradation.toFixed(1)}% (${regression.baseline.toFixed(2)} → ${regression.current.toFixed(2)})
                    </div>
                `
                  )
                  .join('')}
            </div>
        `
            : ''
        }

        <div class="environment-section">
            <h2 style="margin-bottom: 20px; color: #333;">Environment Information</h2>
            <div class="environment-grid">
                <div class="env-item">
                    <div class="label">Node.js Version</div>
                    <div class="value">${environment.nodeVersion}</div>
                </div>
                <div class="env-item">
                    <div class="label">Platform</div>
                    <div class="value">${environment.platform}</div>
                </div>
                <div class="env-item">
                    <div class="label">Architecture</div>
                    <div class="value">${environment.arch}</div>
                </div>
                <div class="env-item">
                    <div class="label">CPU Cores</div>
                    <div class="value">${environment.cpus}</div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Response Time Distribution Chart
        const responseTimeCtx = document.getElementById('responseTimeChart').getContext('2d');
        new Chart(responseTimeCtx, {
            type: 'bar',
            data: {
                labels: ['API', 'Database', 'Cache'],
                datasets: [{
                    label: 'Average Response Time (ms)',
                    data: [
                        ${results.benchmarks.api?.averageResponseTime || 0},
                        ${results.benchmarks.database?.averageResponseTime || 0},
                        ${results.benchmarks.cache?.averageResponseTime || 0}
                    ],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(75, 192, 192, 0.8)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 99, 132, 1)',
                        'rgba(75, 192, 192, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Performance Trend Chart
        const trendCtx = document.getElementById('trendChart').getContext('2d');
        new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: ${JSON.stringify(trendData.labels)},
                datasets: [{
                    label: 'Average Response Time (ms)',
                    data: ${JSON.stringify(trendData.responseTimes)},
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    </script>
</body>
</html>`

  return html
}

/**
 * Generate mock trend data for demonstration
 */
function generateMockTrendData(currentResults) {
  const days = 7
  const labels = []
  const responseTimes = []

  const baseTime = currentResults.summary.averageResponseTime

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    labels.push(date.toLocaleDateString())

    // Generate slightly varying data around the current average
    const variation = (Math.random() - 0.5) * 0.2 * baseTime
    responseTimes.push(Math.max(0, baseTime + variation))
  }

  return { labels, responseTimes }
}
