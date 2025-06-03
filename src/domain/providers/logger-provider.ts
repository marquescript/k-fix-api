
export interface LoggerProvider {
    info(message: string, context?: unknown): void;
    warn(message: string, context?: unknown): void;
    error(message: string, context?: unknown): void;
    debug(message: string, context?: unknown): void;
}
  