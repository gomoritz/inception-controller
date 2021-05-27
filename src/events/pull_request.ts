import { Context } from "probot"
import deploy from "../deploy/deploy"
import { PullRequest } from "../types/github"
import logger from "../logger/logger"

export async function handlePullRequestOpen(context: Context) {
    logger.debug("Received event: %s", "pull_request.open")
    const pullRequest: PullRequest = context.payload.pull_request

    if (isEligible(pullRequest)) {
        await deployPreview(context, pullRequest)
    } else {
        logger.debug("Pull request is not eligible")
    }
}

export async function handlePullRequestLabeled(context: Context) {
    logger.debug("Received event: %s", "pull_request.labeled")
    const label = context.payload.label
    const pullRequest: PullRequest = context.payload.pull_request

    if (label && isDeploymentLabel(label)) {
        await deployPreview(context, pullRequest)
    } else {
        logger.debug("Label is no deployment label: %s", label)
    }
}

export async function handlePullRequestSynchronize(context: Context) {
    logger.debug("Received event: %s", "pull_request.synchronize")
    const pullRequest: PullRequest = context.payload.pull_request

    if (isEligible(pullRequest) || pullRequest.labels.some((label) => isDeploymentLabel(label))) {
        await deployPreview(context, pullRequest)
    } else {
        logger.debug("Pull request is not eligible and has no deployment label")
    }
}

// TODO: handle pull request close

async function deployPreview(context: Context, pullRequest: PullRequest) {
    logger.info("Deploying preview from pull request %o", pullRequest.id)
    await deploy({
        repositorySpec: context.repo(),
        ref: pullRequest.head.ref,
        type: "preview",
        context,
        pullRequest
    })
}

function isEligible(pullRequest: PullRequest) {
    const sameRepository = pullRequest.head.repo.id === pullRequest.base.repo.id
    const validBranch =
        pullRequest.base.ref === pullRequest.base.repo.default_branch || pullRequest.base.ref === "production"
    return sameRepository && validBranch
}

function isDeploymentLabel(label: { name?: string | undefined }) {
    return label?.name === "preview" || label?.name === "deploy"
}
