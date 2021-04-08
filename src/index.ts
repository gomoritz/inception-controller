import { Probot } from "probot"
import { handlePush } from "./events/push"
import { handlePullRequestLabeled, handlePullRequestOpen, handlePullRequestSynchronize } from "./events/pull_request"

export = (app: Probot) => {
    app.on("push", handlePush)

    app.on("pull_request.opened", handlePullRequestOpen)
    app.on("pull_request.labeled", handlePullRequestLabeled)
    app.on("pull_request.synchronize", handlePullRequestSynchronize)
}
