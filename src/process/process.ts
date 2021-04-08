import { error, begin, info, end } from "./logger"
import { exec } from "child_process"

export function execute(command: string, workingDir: string): Promise<void> {
    begin(command)

    const childProcess = exec(command, { cwd: workingDir })
    childProcess.stdout!.on("data", (data) => info(command, data))
    childProcess.stderr!.on("data", (data) => error(command, data))

    return new Promise((resolve) => {
        childProcess.on("close", () => {
            end(command)
            resolve()
        })
    })
}
