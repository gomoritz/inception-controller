import chalk from "chalk"

export function log(command: string, level: string, message: string) {
    console.log(
        chalk.gray("> ") +
            chalk.yellowBright(command) +
            chalk.gray(" [") +
            level +
            chalk.gray("] ") +
            chalk.whiteBright(message.substr(0, message.length - 1))
    )
}

export function begin(command: string) {
    console.log(
        chalk.gray("=== ") +
            chalk.white('Executing command "') +
            chalk.green(command) +
            chalk.white('"') +
            chalk.gray(" ===")
    )
}

export function end(command: string) {
    console.log(
        chalk.gray("=== ") +
            chalk.white('Finished command "') +
            chalk.green(command) +
            chalk.white('"') +
            chalk.gray(" ===")
    )
}

export function info(command: string, message: string) {
    log(command, chalk.blueBright("INFO"), message)
}

export function error(command: string, message: string) {
    log(command, chalk.redBright("ERROR"), message)
}
