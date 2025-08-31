// src/common/services/security-audit.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';

export interface SecurityEvent {
  type:
    | 'auth_failure'
    | 'rate_limit_exceeded'
    | 'suspicious_request'
    | 'unauthorized_access'
    | 'data_breach_attempt';
  userId?: string;
  ip: string;
  userAgent?: string;
  endpoint: string;
  details: Record<string, any>;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

@Injectable()
export class SecurityAuditService {
  private readonly logger = new Logger(SecurityAuditService.name);

  constructor(private readonly redis: RedisService) {}

  /**
   * Log security event
   */
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      const eventData = {
        ...event,
        id: this.generateEventId(),
        timestamp: event.timestamp || new Date(),
      };

      // Log to application logger
      const logMessage = `Security Event [${event.type}] from ${event.ip} on ${event.endpoint}`;

      switch (event.severity) {
        case 'critical':
          this.logger.error(logMessage, eventData);
          break;
        case 'high':
          this.logger.warn(logMessage, eventData);
          break;
        case 'medium':
          this.logger.warn(logMessage, eventData);
          break;
        default:
          this.logger.log(logMessage, eventData);
      }

      // Store in Redis for analysis
      await this.storeSecurityEvent(eventData);

      // Check for patterns that might indicate an attack
      await this.analyzeSecurityPatterns(event);
    } catch (error) {
      this.logger.error(`Failed to log security event: ${error.message}`);
    }
  }

  /**
   * Log authentication failure
   */
  async logAuthFailure(
    ip: string,
    email: string,
    reason: string,
    userAgent?: string,
  ): Promise<void> {
    await this.logSecurityEvent({
      type: 'auth_failure',
      ip,
      userAgent,
      endpoint: '/auth/login',
      details: { email, reason },
      timestamp: new Date(),
      severity: 'medium',
    });
  }

  /**
   * Log rate limit exceeded
   */
  async logRateLimitExceeded(
    ip: string,
    endpoint: string,
    userId?: string,
  ): Promise<void> {
    await this.logSecurityEvent({
      type: 'rate_limit_exceeded',
      userId,
      ip,
      endpoint,
      details: { limit_type: 'request_rate' },
      timestamp: new Date(),
      severity: 'medium',
    });
  }

  /**
   * Log suspicious request
   */
  async logSuspiciousRequest(
    ip: string,
    endpoint: string,
    reason: string,
    details: Record<string, any> = {},
  ): Promise<void> {
    await this.logSecurityEvent({
      type: 'suspicious_request',
      ip,
      endpoint,
      details: { reason, ...details },
      timestamp: new Date(),
      severity: 'high',
    });
  }

  /**
   * Log unauthorized access attempt
   */
  async logUnauthorizedAccess(
    ip: string,
    endpoint: string,
    userId?: string,
    details: Record<string, any> = {},
  ): Promise<void> {
    await this.logSecurityEvent({
      type: 'unauthorized_access',
      userId,
      ip,
      endpoint,
      details,
      timestamp: new Date(),
      severity: 'high',
    });
  }

  /**
   * Get security events for analysis
   */
  async getSecurityEvents(
    type?: SecurityEvent['type'],
    hours: number = 24,
    limit: number = 100,
  ): Promise<SecurityEvent[]> {
    try {
      const cutoffTime = Date.now() - hours * 60 * 60 * 1000;
      const pattern = type ? `security:events:${type}:*` : 'security:events:*';

      const keys = await this.redis.keys(pattern);
      const events: SecurityEvent[] = [];

      for (const key of keys.slice(0, limit)) {
        const eventData = await this.redis.get(key);
        if (eventData) {
          const event = JSON.parse(eventData as string);
          if (new Date(event.timestamp).getTime() > cutoffTime) {
            events.push(event);
          }
        }
      }

      return events.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
    } catch (error) {
      this.logger.error(`Failed to get security events: ${error.message}`);
      return [];
    }
  }

  /**
   * Get security statistics
   */
  async getSecurityStats(hours: number = 24): Promise<Record<string, number>> {
    try {
      const events = await this.getSecurityEvents(undefined, hours);

      const stats = {
        total_events: events.length,
        auth_failures: 0,
        rate_limit_exceeded: 0,
        suspicious_requests: 0,
        unauthorized_access: 0,
        data_breach_attempts: 0,
        unique_ips: new Set<string>(),
        critical_events: 0,
        high_severity_events: 0,
      };

      events.forEach((event) => {
        stats[event.type]++;
        stats.unique_ips.add(event.ip);

        if (event.severity === 'critical') {
          stats.critical_events++;
        } else if (event.severity === 'high') {
          stats.high_severity_events++;
        }
      });

      return {
        ...stats,
        unique_ips: stats.unique_ips.size,
      };
    } catch (error) {
      this.logger.error(`Failed to get security stats: ${error.message}`);
      return {};
    }
  }

  private async storeSecurityEvent(
    event: SecurityEvent & { id: string },
  ): Promise<void> {
    const key = `security:events:${event.type}:${event.id}`;
    const ttl = 7 * 24 * 60 * 60; // 7 days

    await this.redis.set(key, JSON.stringify(event), ttl);
  }

  private async analyzeSecurityPatterns(event: SecurityEvent): Promise<void> {
    try {
      // Check for repeated failures from same IP
      if (event.type === 'auth_failure') {
        const recentFailures = await this.getSecurityEvents('auth_failure', 1);
        const ipFailures = recentFailures.filter((e) => e.ip === event.ip);

        if (ipFailures.length >= 5) {
          await this.logSecurityEvent({
            type: 'suspicious_request',
            ip: event.ip,
            endpoint: event.endpoint,
            details: {
              reason: 'Multiple authentication failures',
              failure_count: ipFailures.length,
            },
            timestamp: new Date(),
            severity: 'critical',
          });
        }
      }

      // Check for rapid requests from same IP
      const recentEvents = await this.getSecurityEvents(undefined, 0.25); // 15 minutes
      const ipEvents = recentEvents.filter((e) => e.ip === event.ip);

      if (ipEvents.length >= 50) {
        await this.logSecurityEvent({
          type: 'suspicious_request',
          ip: event.ip,
          endpoint: event.endpoint,
          details: {
            reason: 'High frequency requests',
            request_count: ipEvents.length,
          },
          timestamp: new Date(),
          severity: 'high',
        });
      }
    } catch (error) {
      this.logger.error(
        `Failed to analyze security patterns: ${error.message}`,
      );
    }
  }

  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
}
