import { Endpoints } from "@octokit/types"

export interface RepositorySpec {
    owner: string
    repo: string
}

export type PullRequest = Endpoints["GET /repos/{owner}/{repo}/pulls/{pull_number}"]["response"]["data"]

export type Deployment = Endpoints["GET /repos/{owner}/{repo}/deployments/{deployment_id}"]["response"]["data"]
