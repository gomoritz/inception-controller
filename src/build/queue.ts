import BuildTask from "./BuildTask"

const items: BuildTask[] = []

export default function queue(task: BuildTask, onStart: () => void, onFinish: () => void, onError: () => void) {
    task.onStart = onStart
    task.onFinish = onFinish
    task.onError = onError
    task.state = "queued"

    items.push(task)
    if (items.length === 1) {
        // noinspection JSIgnoredPromiseFromCall
        runNext()
    }
}

async function runNext() {
    const next = items.find((task) => task.state === "queued")
    if (next) {
        console.log("Running next build task " + next.identifier)
        await run(next)
    } else {
        console.log("No more build tasks in queue")
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
        console.error("Failed to run build task " + task.identifier)
        console.error(e)
    } finally {
        items.splice(items.indexOf(task), 1)
        await runNext()
    }
}
