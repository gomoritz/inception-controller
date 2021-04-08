import { Context } from "probot"
import deploy from "../deploy/deploy"
import { PullRequest } from "../types/github"

export async function handlePullRequestOpen(context: Context) {
    const pullRequest: PullRequest = context.payload.pull_request

    if (isEligible(pullRequest)) {
        await deployPreview(context, pullRequest)
    }
}

export async function handlePullRequestLabeled(context: Context) {
    const label = context.payload.label
    const pullRequest: PullRequest = context.payload.pull_request

    if (label && isDeploymentLabel(label)) {
        await deployPreview(context, pullRequest)
    }
}

export async function handlePullRequestSynchronize(context: Context) {
    const pullRequest: PullRequest = context.payload.pull_request

    if (isEligible(pullRequest) || pullRequest.labels.some((label) => isDeploymentLabel(label))) {
        await deployPreview(context, pullRequest)
    }
}

// TODO: handle pull request close

async function deployPreview(context: Context, pullRequest: PullRequest) {
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
