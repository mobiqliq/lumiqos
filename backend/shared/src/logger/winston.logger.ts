import { WinstonModule, utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';

const isProduction = process.env.NODE_ENV === 'production';

export const createWinstonLogger = (serviceName: string) =>
  WinstonModule.createLogger({
    level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
    format: isProduction
      ? winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json(),
        )
      : winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          nestWinstonModuleUtilities.format.nestLike(serviceName, {
            prettyPrint: true,
            colors: true,
          }),
        ),
    transports: [new winston.transports.Console()],
  });

export const createWinstonModuleOptions = (serviceName: string) => ({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  format: isProduction
    ? winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      )
    : winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        nestWinstonModuleUtilities.format.nestLike(serviceName, {
          prettyPrint: true,
          colors: true,
        }),
      ),
  transports: [new winston.transports.Console()],
});
