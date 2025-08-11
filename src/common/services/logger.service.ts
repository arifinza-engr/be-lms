import { Injectable, LoggerService, LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface LogContext {
  userId?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  [key: string]: any;
}

@Injectable()
export class CustomLoggerService implements LoggerService {
  private logLevels: LogLevel[] = ['error', 'warn', 'log', 'debug', 'verbose'];
  private currentLogLevel: string;

  constructor(private configService: ConfigService) {
    this.currentLogLevel = this.configService.get('LOG_LEVEL', 'info');
  }

  private formatMessage(level: string, message: any, context?: string, trace?: string): string {
    const timestamp = new Date().toISOString();
    const pid = process.pid;
    
    const logObject = {
      timestamp,
      level: level.toUpperCase(),
      pid,
      context: context || 'Application',
      message: typeof message === 'object' ? JSON.stringify(message) : message,
      ...(trace && { trace }),
    };

    return JSON.stringify(logObject);
  }

  log(message: any, context?: string) {
    console.log(this.formatMessage('info', message, context));
  }

  error(message: any, trace?: string, context?: string) {
    console.error(this.formatMessage('error', message, context, trace));
  }

  warn(message: any, context?: string) {
    console.warn(this.formatMessage('warn', message, context));
  }

  debug(message: any, context?: string) {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  verbose(message: any, context?: string) {
    if (this.shouldLog('verbose')) {
      console.log(this.formatMessage('verbose', message, context));
    }
  }

  logWithContext(level: LogLevel, message: any, context: LogContext) {
    const contextString = Object.entries(context)
      .map(([key, value]) => `${key}=${value}`)
      .join(' ');
    
    this[level](`${message} | ${contextString}`);
  }

  private shouldLog(level: string): boolean {
    const levelIndex = this.logLevels.indexOf(level as LogLevel);
    const currentLevelIndex = this.logLevels.indexOf(this.currentLogLevel as LogLevel);
    return levelIndex <= currentLevelIndex;
  }
}