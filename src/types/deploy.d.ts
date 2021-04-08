import { Context } from "probot"
import { PullRequest, RepositorySpec } from "./github"

interface BaseDeployParams {
    context: Context
    repositorySpec: RepositorySpec
    ref: string
}

export interface DeployParamsProduction extends BaseDeployParams {
    type: "production"
}

export interface DeployParamsPreview extends BaseDeployParams {
    type: "preview"
    pullRequest: PullRequest
}

export type DeployParams = DeployParamsProduction | DeployParamsPreview
