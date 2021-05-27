import { createLogger, format, transports } from "winston"
import chalk from "chalk"
import formatMeta from "./formatMeta"

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
                format.printf(
                    ({ timestamp, level, message }) =>
                        chalk.gray("[") +
                        chalk.magenta(timestamp) +
                        chalk.gray("] [") +
                        level +
                        chalk.gray("] ") +
                        chalk.white(message)
                )
            )
        })
    ]
})

export default logger
