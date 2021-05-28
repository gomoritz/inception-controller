import chalk from "chalk"
import logger from "../logger/logger"

export function log(command: string, level: "error" | "info", message: string) {
    const lines = message.split("\n")
    const func = level === "error" ? logger.warn : logger.debug

    for (const line of lines) {
        if (line.length <= 1) continue

        func(
            chalk.gray("> ") +
                chalk.yellowBright(command) +
                chalk.gray(" - ") +
                chalk.whiteBright(line)
        )
    }
}

export function begin(command: string) {
    logger.info(
        chalk.gray("=== ") +
            chalk.white("Executing command ") +
            chalk.green(command) +
            chalk.gray(" ===")
    )
}

export function end(command: string, withError?: boolean) {
    logger.info(
        chalk.gray("=== ") +
            chalk.white("Finished command ") +
            chalk.green(command) +
            (withError ? chalk.white(" with error") : "") +
            chalk.gray(" ===")
    )
}

export function info(command: string, message: string) {
    log(command, "info", message)
}

export function error(command: string, message: string) {
    log(command, "error", message)
}
