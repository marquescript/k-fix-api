import { createLogger, format, transports } from "winston"
import { env } from "../config/validate-env"
import { LoggerProvider } from "src/domain/providers/logger-provider"

const isProduction = env.NODE_ENV === "prod"

const winston = createLogger({
    level: isProduction ? "info" : "debug",
    format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.errors({ stack: true }),
        format.printf(({ timestamp, level, message, stack }) => {
            return stack
                ? `${timestamp} ${level}: ${message}\n${stack}`
                : `${timestamp} ${level}: ${message}`
        })
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: "logs/error.log", level: "error" }),
        new transports.File({ filename: "logs/combined.log" })
    ]
})

export class WinstonLogger implements LoggerProvider {
    info(message: string, context?: unknown): void {
        winston.info(message + this.stringify(context));
    }
  
    warn(message: string, context?: unknown): void {
        winston.warn(message + this.stringify(context));
    }
  
    error(message: string, context?: unknown): void {
        winston.error(message + this.stringify(context));
    }
  
    debug(message: string, context?: unknown): void {
        if (!isProduction) {
            winston.debug(message + this.stringify(context));
        }
    }
  
    private stringify(context?: unknown): string {
        return context ? ` | context: ${JSON.stringify(context)}` : '';
    }
}

export const logger = new WinstonLogger()