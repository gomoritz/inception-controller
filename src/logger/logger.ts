import { createLogger, format, transports } from "winston"
import chalk from "chalk"
import formatMeta from "./formatMeta"

export const customFormat = format.printf(
    ({ timestamp, level, message }) =>
        chalk.gray("[") +
        chalk.magenta(timestamp) +
        chalk.gray("] [") +
        level +
        chalk.gray("] ") +
        chalk.white(message)
)

export const uncoloredCustomFormat = format.printf(
    ({ timestamp, level, message }) => `[${timestamp}] [${level}] ${message}`
)

const logger = createLogger({
    level: "debug",
    format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.errors({ stack: true }),
        format.json()
    ),
    transports: [
        new transports.File({
            filename: "error.log",
            dirname: "logs",
            level: "error",
            format: format.combine(format.splat())
        }),
        new transports.File({
            filename: "combined.log",
            dirname: "logs",
            format: format.combine(format.splat())
        }),
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.align(),
                formatMeta({ functions: [chalk.cyan] }),
                format.splat(),
                customFormat
            )
        })
    ]
})

export default logger
