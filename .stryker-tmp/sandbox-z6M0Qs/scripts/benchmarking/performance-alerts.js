/**
 * Performance Alerting System
 * Sends alerts when performance regressions are detected
 */
// @ts-nocheck

class PerformanceAlerts {
  constructor(config = {}) {
    this.config = {
      slack: {
        enabled: process.env.SLACK_WEBHOOK_URL ? true : false,
        webhookUrl: process.env.SLACK_WEBHOOK_URL,
        channel: config.slack?.channel || '#performance-alerts',
        username: config.slack?.username || 'Performance Monitor'
      },
      email: {
        enabled: config.email?.enabled || false,
        smtpHost: config.email?.smtpHost || process.env.SMTP_HOST,
        smtpPort: config.email?.smtpPort || process.env.SMTP_PORT || 587,
        smtpUser: config.email?.smtpUser || process.env.SMTP_USER,
        smtpPass: config.email?.smtpPass || process.env.SMTP_PASS,
        from: config.email?.from || process.env.ALERT_FROM_EMAIL || 'performance@floresya.com',
        to:
          config.email?.to ||
          (process.env.ALERT_TO_EMAILS ? process.env.ALERT_TO_EMAILS.split(',') : [])
      },
      github: {
        enabled: config.github?.enabled !== false,
        createIssue: config.github?.createIssue !== false,
        labels: config.github?.labels || ['performance', 'regression', 'urgent']
      },
      ...config
    }
  }

  /**
   * Send alerts for detected regressions
   */
  async sendRegressionAlerts(regressions, benchmarkResults, options = {}) {
    if (!regressions || regressions.length === 0) {
      console.log('✅ No regressions to alert on')
      return { success: true, message: 'No regressions detected' }
    }

    console.log(`🚨 Sending alerts for ${regressions.length} performance regression(s)`)

    const results = {
      slack: null,
      email: null,
      github: null
    }

    // Send Slack alert
    if (this.config.slack.enabled) {
      try {
        results.slack = await this.sendSlackAlert(regressions, benchmarkResults, options)
        console.log('✅ Slack alert sent')
      } catch (error) {
        console.error('❌ Failed to send Slack alert:', error.message)
        results.slack = { success: false, error: error.message }
      }
    }

    // Send email alert
    if (this.config.email.enabled && this.config.email.to.length > 0) {
      try {
        results.email = await this.sendEmailAlert(regressions, benchmarkResults, options)
        console.log('✅ Email alert sent')
      } catch (error) {
        console.error('❌ Failed to send email alert:', error.message)
        results.email = { success: false, error: error.message }
      }
    }

    // Create GitHub issue
    if (this.config.github.enabled && this.config.github.createIssue) {
      try {
        results.github = await this.createGitHubIssue(regressions, benchmarkResults, options)
        console.log('✅ GitHub issue created')
      } catch (error) {
        console.error('❌ Failed to create GitHub issue:', error.message)
        results.github = { success: false, error: error.message }
      }
    }

    const successCount = Object.values(results).filter(r => r && r.success).length
    const totalCount = Object.values(results).filter(r => r !== null).length

    return {
      success: successCount > 0,
      message: `Alerts sent: ${successCount}/${totalCount} successful`,
      results
    }
  }

  /**
   * Send Slack alert
   */
  async sendSlackAlert(regressions, benchmarkResults, options = {}) {
    const { execSync } = await import('child_process')

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🚨 Performance Regression Detected'
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${regressions.length} performance regression(s)* detected exceeding the 10% threshold.`
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text:
            '*Regression Details:*\n' +
            regressions
              .map(
                r =>
                  `• *${r.benchmark}* - ${r.metric}: degraded by ${r.degradation.toFixed(1)}% (baseline: ${r.baseline.toFixed(2)}, current: ${r.current.toFixed(2)})`
              )
              .join('\n')
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Environment:* ${options.environment || 'Unknown'}\n*Run ID:* ${options.runId || 'N/A'}\n*Commit:* ${options.commit || 'N/A'}`
        }
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Report'
            },
            url: options.reportUrl || '#'
          }
        ]
      }
    ]

    const payload = {
      channel: this.config.slack.channel,
      username: this.config.slack.username,
      icon_emoji: ':chart_with_downwards_trend:',
      blocks
    }

    const curlCommand = `curl -X POST -H 'Content-type: application/json' --data '${JSON.stringify(payload).replace(/'/g, "'\\''")}' ${this.config.slack.webhookUrl}`

    try {
      execSync(curlCommand, { stdio: 'pipe' })
      return { success: true }
    } catch (error) {
      throw new Error(`Slack API error: ${error.message}`)
    }
  }

  /**
   * Send email alert
   */
  async sendEmailAlert(regressions, benchmarkResults, options = {}) {
    const { createTransport } = await import('nodemailer')

    const transporter = createTransport({
      host: this.config.email.smtpHost,
      port: this.config.email.smtpPort,
      secure: this.config.email.smtpPort === 465,
      auth: {
        user: this.config.email.smtpUser,
        pass: this.config.email.smtpPass
      }
    })

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #d32f2f;">🚨 Performance Regression Alert</h1>

        <p><strong>${regressions.length} performance regression(s)</strong> detected exceeding the 10% threshold.</p>

        <h2>Regression Details</h2>
        <ul>
          ${regressions
            .map(
              r => `
            <li><strong>${r.benchmark} - ${r.metric}</strong>: degraded by ${r.degradation.toFixed(1)}%
                (baseline: ${r.baseline.toFixed(2)}, current: ${r.current.toFixed(2)})</li>
          `
            )
            .join('')}
        </ul>

        <h2>Environment Information</h2>
        <ul>
          <li><strong>Environment:</strong> ${options.environment || 'Unknown'}</li>
          <li><strong>Run ID:</strong> ${options.runId || 'N/A'}</li>
          <li><strong>Commit:</strong> ${options.commit || 'N/A'}</li>
          <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
        </ul>

        <h2>Summary</h2>
        <ul>
          <li><strong>Total Operations:</strong> ${benchmarkResults.summary?.totalOperations || 0}</li>
          <li><strong>Average Response Time:</strong> ${benchmarkResults.summary?.averageResponseTime?.toFixed(2) || 0}ms</li>
          <li><strong>Throughput:</strong> ${benchmarkResults.summary?.throughput?.toFixed(1) || 0} ops/sec</li>
          <li><strong>Error Rate:</strong> ${(benchmarkResults.summary?.errorRate * 100 || 0).toFixed(2)}%</li>
        </ul>

        <p style="color: #d32f2f; font-weight: bold;">
          Please investigate and optimize performance immediately.
        </p>

        ${options.reportUrl ? `<p><a href="${options.reportUrl}" style="background: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Full Report</a></p>` : ''}
      </div>
    `

    const mailOptions = {
      from: this.config.email.from,
      to: this.config.email.to,
      subject: `🚨 Performance Regression: ${regressions.length} issue(s) detected`,
      html: htmlContent
    }

    const info = await transporter.sendMail(mailOptions)
    return { success: true, messageId: info.messageId }
  }

  /**
   * Create GitHub issue
   */
  async createGitHubIssue(regressions, benchmarkResults, options = {}) {
    const { execSync } = await import('child_process')

    const title = `🚨 Performance Regression Detected`

    const body = `## Performance Regression Alert

**${regressions.length} performance regression(s)** detected exceeding the 10% threshold.

### Regression Details
${regressions
  .map(
    r =>
      `- **${r.benchmark} - ${r.metric}**: degraded by ${r.degradation.toFixed(1)}% (baseline: ${r.baseline.toFixed(2)}, current: ${r.current.toFixed(2)})`
  )
  .join('\n')}

### Environment Information
- **Environment**: ${options.environment || 'Unknown'}
- **Run ID**: ${options.runId || 'N/A'}
- **Commit**: ${options.commit || 'N/A'}
- **Timestamp**: ${new Date().toISOString()}

### Benchmark Summary
- **Total Operations**: ${benchmarkResults.summary?.totalOperations || 0}
- **Average Response Time**: ${benchmarkResults.summary?.averageResponseTime?.toFixed(2) || 0}ms
- **Throughput**: ${benchmarkResults.summary?.throughput?.toFixed(1) || 0} ops/sec
- **Error Rate**: ${(benchmarkResults.summary?.errorRate * 100 || 0).toFixed(2)}%

### Action Required
Please investigate the performance regression(s) and implement necessary optimizations.

${options.reportUrl ? `**Full Report**: ${options.reportUrl}` : ''}

---
*This issue was automatically created by the performance monitoring system.*`

    const labels = this.config.github.labels.join(',')

    try {
      const command = `gh issue create --title "${title}" --body "${body.replace(/"/g, '\\"')}" --label "${labels}"`
      const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' })

      // Extract issue URL from output
      const issueUrl = result.trim().split('\n').pop()

      return { success: true, issueUrl }
    } catch (error) {
      throw new Error(`GitHub CLI error: ${error.message}`)
    }
  }

  /**
   * Send performance improvement notification
   */
  async sendImprovementAlert(improvements, benchmarkResults, options = {}) {
    console.log(
      `🎉 Sending improvement alerts for ${improvements.length} performance improvement(s)`
    )

    // For now, just log improvements (could extend to send notifications)
    console.log('Performance improvements detected:')
    improvements.forEach(improvement => {
      console.log(
        `  ✅ ${improvement.benchmark} - ${improvement.metric}: +${improvement.improvement.toFixed(1)}%`
      )
    })

    return { success: true, message: 'Improvement notification logged' }
  }
}

const performanceAlerts = new PerformanceAlerts()

export { PerformanceAlerts, performanceAlerts }
