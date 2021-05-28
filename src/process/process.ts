import { error, begin, info, end } from "./process-logger"
import { exec } from "child_process"

export function execute(
    command: string,
    workingDir: string,
    env: NodeJS.ProcessEnv
): Promise<void> {
    begin(command)

    const childProcess = exec(command, { cwd: workingDir, env: { ...process.env, ...env } })
    childProcess.stdout!.on("data", (data) => info(command, data))
    childProcess.stderr!.on("data", (data) => error(command, data))

    return new Promise((resolve, reject) => {
        childProcess.on("close", () => {
            if (childProcess.exitCode != 0) {
                end(command, true)
                reject(
                    `Build command '${command}' finished with invalid exit code ${childProcess.exitCode}`
                )
                return
            }

            end(command)
            resolve()
        })
    })
}
