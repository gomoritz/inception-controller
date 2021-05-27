import BuildTask from "./BuildTask"
import logger from "../logger/logger"

const items: BuildTask[] = []

export default function queue(task: BuildTask, onStart: () => void, onFinish: () => void, onError: () => void) {
    task.onStart = onStart
    task.onFinish = onFinish
    task.onError = onError
    task.state = "queued"

    items.push(task)
    if (items.length === 1) {
        logger.debug("Build tasked queued and instantly executed")
        // noinspection JSIgnoredPromiseFromCall
        runNext()
    } else {
        logger.debug("Build task queued")
    }
}

async function runNext() {
    const next = items.find((task) => task.state === "queued")
    if (next) {
        logger.info("Running next build task %s", next.identifier)
        await run(next)
    } else {
        logger.info("No more build tasks in queue")
    }
}

async function run(task: BuildTask) {
    try {
        task.state = "running"
        task.onStart?.()
        await task.run()
        task.state = "finished"
        task.onFinish?.()
    } catch (e) {
        task.onError?.()
        logger.error("Failed to run build task %s", task.identifier)
        logger.error(e)
    } finally {
        items.splice(items.indexOf(task), 1)
        await runNext()
    }
}
