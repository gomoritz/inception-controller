import { DeployParams } from "../types/deploy"
import { Deployment, PullRequest } from "../types/github"
import crypto from "crypto"
import { Context } from "probot"
import { Config } from "../types/config"
import BuildTask from "../build/BuildTask"
import queue from "../build/queue"
import logger from "../logger/logger"

export default class DeploymentTask {
    private readonly type: "preview" | "production"
    private readonly previewId: string | undefined
    private readonly context: Context

    private deployment: Deployment

    constructor(private readonly params: DeployParams, private readonly config: Config) {
        this.type = params.type
        this.previewId = params.type === "preview" ? generatePreviewId(params.pullRequest) : undefined
        this.context = params.context
    }

    async run() {
        logger.debug("Running deployment task with previewId %s", this.previewId)

        await this.createDeployment()
        await this.updateState("queued")

        const buildTask = new BuildTask(
            this.params.repositorySpec,
            this.params.ref,
            this.config,
            this.context,
            this.previewId
        )
        queue(
            buildTask,
            () => this.updateState("in_progress"),
            () => this.updateState("success"),
            () => this.updateState("failure")
        )
    }

    private async createDeployment() {
        logger.debug("Creating deployment on GitHub")
        // noinspection TypeScriptValidateJSTypes
        const { data: deployment } = await this.context.octokit.repos.createDeployment(
            this.context.repo({
                ref: this.params.ref,
                description: "Inception Deployment",
                environment: this.previewId ? `preview-${this.previewId}` : "production",
                mediaType: { previews: ["ant-man-preview"] },
                auto_merge: false
            })
        )

        if (!("id" in deployment)) throw Error("Deployment failed")
        this.deployment = deployment
    }

    private async updateState(state: "queued" | "failure" | "pending" | "in_progress" | "success") {
        logger.debug("Updating deployment state to %s", state)
        const environmentUrl = this.previewId
            ? this.config.previewUrl.replace("%0", this.previewId)
            : this.config.productionUrl

        await this.context.octokit.repos.createDeploymentStatus(
            this.context.repo({
                deployment_id: this.deployment.id,
                state,
                environment_url: environmentUrl,
                mediaType: { previews: ["flash-preview", "ant-man-preview"] }
            })
        )
    }
}

function generatePreviewId(pullRequest: PullRequest) {
    return crypto.createHash("sha256").update(pullRequest.id.toString()).digest("hex").substr(0, 10)
}
