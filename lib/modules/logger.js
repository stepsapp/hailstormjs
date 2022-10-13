import winston from 'winston';

const alignColorsAndTime = winston.format.combine(
  winston.format.label({
    label: '[Hailstorm]',
  }),
  winston.format.timestamp({
    format: 'YY-MM-DD HH:MM:SS',
  }),
  winston.format.printf((info) => `${info.label} ${info.timestamp} ${info.level}: ${info.message}`),
  winston.format.errors({ stack: true }),
);

const logger = winston.createLogger({
  level: 'debug',
  transports: [
    new winston.transports.Console({
      format: alignColorsAndTime,
    }),
  ],
});
export default logger;
