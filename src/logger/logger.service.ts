import { LoggerConfig, LogLevel, LogEntry } from './logger.types';
import { formatConsoleMessage, formatFileMessage } from './logger.utils';
import { isNodeEnvironment, ensureNodeModules, getFs, getPath } from './logger.node';

class LoggerService {
  private config: LoggerConfig;
  private logLevels: LogLevel[] = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
  private fileReady = false;
  private initPromise: Promise<void> | null = null;

  constructor(config: LoggerConfig) {
    this.config = config;
    if (config.enableFile && isNodeEnvironment()) {
      this.initPromise = this.initFileSystem();
    }
  }

  private async initFileSystem(): Promise<void> {
    await ensureNodeModules();
    const fs = getFs();
    const path = getPath();

    if (!fs || !path || !this.config.filePath) return;

    try {
      const logDir = path.dirname(this.config.filePath);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      this.fileReady = true;
    } catch {
      this.fileReady = false;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const currentLevelIndex = this.logLevels.indexOf(this.config.level);
    const messageLevelIndex = this.logLevels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private async writeToFileAsync(entry: LogEntry): Promise<void> {
    if (!this.fileReady && this.initPromise) {
      await this.initPromise;
    }
    if (!this.fileReady) return;

    const fs = getFs();
    const path = getPath();
    if (!fs || !path || !this.config.filePath) return;

    try {
      const message = formatFileMessage(entry) + '\n';
      fs.appendFileSync(this.config.filePath, message, 'utf8');
      this.rotateLogFileIfNeeded();
    } catch (error) {
      console.error('[lognerd] Error escribiendo en archivo de log:', error);
    }
  }

  private writeToFile(entry: LogEntry): void {
    if (!this.config.enableFile || !this.config.filePath) return;
    if (this.config.runtimeEnvironment === 'client') return;
    if (!isNodeEnvironment()) return;

    this.writeToFileAsync(entry).catch((err) => {
      console.error('[lognerd] Error writing to log file:', err);
    });
  }

  private rotateLogFileIfNeeded(): void {
    const fs = getFs();
    const path = getPath();
    if (!this.config.filePath || !this.config.maxFileSize || !fs || !path) return;

    try {
      const stats = fs.statSync(this.config.filePath);
      const fileSizeInMB = stats.size / (1024 * 1024);

      if (fileSizeInMB >= this.config.maxFileSize) {
        const logDir = path.dirname(this.config.filePath);
        const logFileName = path.basename(this.config.filePath, '.log');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const rotatedFileName = `${logFileName}-${timestamp}.log`;
        const rotatedFilePath = path.join(logDir, rotatedFileName);

        fs.renameSync(this.config.filePath, rotatedFilePath);
        this.cleanOldLogFiles(logDir, logFileName);
      }
    } catch {
      // Ignorar errores de rotación
    }
  }

  private cleanOldLogFiles(logDir: string, logFileName: string): void {
    const fs = getFs();
    const path = getPath();
    if (!this.config.maxFiles || !fs || !path) return;

    try {
      const files = fs.readdirSync(logDir)
        .filter(file => file.startsWith(logFileName) && file.endsWith('.log'))
        .map(file => {
          const filePath = path.join(logDir, file);
          return {
            name: file,
            path: filePath,
            time: fs.statSync(filePath).mtime.getTime(),
          };
        })
        .sort((a, b) => b.time - a.time);

      if (files.length > this.config.maxFiles) {
        files.slice(this.config.maxFiles).forEach(file => {
          fs.unlinkSync(file.path);
        });
      }
    } catch {
      // Ignorar errores de limpieza
    }
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };

    if (this.config.enableConsole) {
      if (!isNodeEnvironment()) {
        const webColors = {
          ERROR: 'color: #ff4444;',
          WARN: 'color: #ffaa00;',
          INFO: 'color: #00aaff;',
          DEBUG: 'color: #aa00ff;',
        };

        const levelTag = `[${level}]`;
        const colorStyle = webColors[level] || '';

        if (data !== undefined) {
          console.log(`%c${levelTag}%c ${message}`, colorStyle, '', data);
        } else {
          console.log(`%c${levelTag}%c ${message}`, colorStyle, '');
        }
      } else {
        console.log(formatConsoleMessage(level, message, data));
      }
    }

    this.writeToFile(entry);
  }

  error(message: string, data?: unknown): void {
    this.log('ERROR', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log('WARN', message, data);
  }

  info(message: string, data?: unknown): void {
    this.log('INFO', message, data);
  }

  debug(message: string, data?: unknown): void {
    this.log('DEBUG', message, data);
  }

  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };

    if (newConfig.enableFile && isNodeEnvironment() && !this.fileReady) {
      this.initPromise = this.initFileSystem();
    }
  }
}

export { LoggerService };
