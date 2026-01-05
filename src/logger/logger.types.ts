export type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
export type RuntimeEnvironment = 'backend' | 'client';

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  filePath?: string;
  environment: 'development' | 'production';
  runtimeEnvironment: RuntimeEnvironment; // 'backend' o 'client'
  maxFileSize?: number; // en MB
  maxFiles?: number;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
}
