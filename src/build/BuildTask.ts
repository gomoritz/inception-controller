import { RepositorySpec } from "../types/github"
import { Context } from "probot"
import path from "path"
import fs from "fs"
import fse from "fs-extra"
import extract from "extract-zip"
import { Config } from "../types/config"
import { execute } from "../process/process"
import logger from "../logger/logger"

export default class BuildTask {
    private octokit = this.context.octokit
    private readonly controllerWorkingDir = process.env.WORKING_DIR ?? "/home"

    public state: "queued" | "running" | "finished"
    public identifier = `${this.repositorySpec.owner}+${this.repositorySpec.repo}@${this.ref}`

    public onFinish: () => void
    public onStart: () => void
    public onError: () => void

    constructor(
        private repositorySpec: RepositorySpec,
        private ref: string,
        private config: Config,
        private context: Context,
        private previewId?: string
    ) {}

    async run() {
        const repositoryDir = await this.download()
        this.injectTemplate(repositoryDir)
        const buildDir = await this.build(repositoryDir)
        await this.copy(buildDir)
        this.cleanup(repositoryDir)
    }

    private async download(): Promise<string> {
        logger.debug("Downloading zipball archive from repository")
        const { data: arrayBuffer } = await this.octokit.repos.downloadZipballArchive({
            ...this.repositorySpec,
            ref: this.ref
        })

        const workingDir = path.join(
            this.controllerWorkingDir,
            "build",
            this.identifier.replace("/", "_")
        )
        const downloadFile = path.join(workingDir, "zipball.zip")
        logger.debug("Working directory is: %s", this.wdf(workingDir))
        logger.debug("Downloading archive to: %s", this.wdf(downloadFile))

        if (fs.existsSync(workingDir)) fs.rmdirSync(workingDir, { recursive: true })

        fs.mkdirSync(workingDir, { recursive: true })
        fs.writeFileSync(downloadFile, Buffer.from(arrayBuffer as ArrayBuffer))

        await extract(downloadFile, { dir: workingDir })
        fs.rmSync(downloadFile)

        const repositoryDir = path.join(workingDir, fs.readdirSync(workingDir)[0])
        logger.debug("Extracted repository into: %s", this.wdf(repositoryDir))
        return repositoryDir
    }

    private injectTemplate(repositoryDir: string) {
        const templateDir = path.join(
            this.controllerWorkingDir,
            "templates",
            `${this.repositorySpec.owner}+${this.repositorySpec.repo}`
        )

        if (fs.existsSync(templateDir)) {
            logger.debug(
                "Copying template from %s into %s",
                this.wdf(templateDir),
                this.wdf(repositoryDir)
            )
            fse.copySync(templateDir, repositoryDir, { recursive: true, overwrite: true })
        } else {
            logger.debug("Found no template at %s", this.wdf(templateDir))
        }
    }

    private async build(repositoryDir: string): Promise<string> {
        logger.debug("Executing %d build commands", this.config.commands.length)
        for await (const command of this.config.commands) {
            await execute(command, repositoryDir)
        }

        return path.join(repositoryDir, this.config.buildDir)
    }

    private async copy(buildDir: string) {
        const destinationDir = this.previewId
            ? path.join(this.config.destination + "-preview", this.previewId)
            : this.config.destination
        logger.debug(
            "Copying build output from %s into %s",
            this.wdf(buildDir),
            this.wdf(destinationDir)
        )

        if (fs.existsSync(destinationDir)) fs.rmdirSync(destinationDir, { recursive: true })
        fs.mkdirSync(destinationDir, { recursive: true })

        fse.copySync(buildDir, destinationDir, { recursive: true, overwrite: true })
    }

    private cleanup(repositoryDir: string) {
        logger.debug("Cleaning up repository directory")
        fs.rmdirSync(repositoryDir, { recursive: true })
    }

    private wdf(path: string): string {
        return "*" + path.replace(this.controllerWorkingDir, "")
    }
}
