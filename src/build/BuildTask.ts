import { RepositorySpec } from "../types/github"
import { Context } from "probot"
import path from "path"
import fs from "fs"
import fse from "fs-extra"
import extract from "extract-zip"
import { Config } from "../types/config"
import { execute } from "../process/process"

export default class BuildTask {
    private octokit = this.context.octokit

    public state: "queued" | "running" | "finished"
    public identifier = `${this.repositorySpec.owner}-${this.repositorySpec.repo}@${this.ref}`

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
        const buildDir = await this.build(repositoryDir)
        await this.copy(buildDir)
    }

    private async download(): Promise<string> {
        const { data: arrayBuffer } = await this.octokit.repos.downloadZipballArchive({
            ...this.repositorySpec,
            ref: this.ref
        })

        const workingDir = path.join(process.env.WORKING_DIR ?? "/home", "build", this.identifier)
        const downloadFile = path.join(workingDir, "zipball.zip")

        if (fs.existsSync(workingDir)) fs.rmdirSync(workingDir, { recursive: true })

        fs.mkdirSync(workingDir, { recursive: true })
        fs.writeFileSync(downloadFile, Buffer.from(arrayBuffer as ArrayBuffer))

        await extract(downloadFile, { dir: workingDir })
        fs.rmSync(downloadFile)

        return path.join(workingDir, fs.readdirSync(workingDir)[0])
    }

    private async build(repositoryDir: string): Promise<string> {
        for await (const command of this.config.commands) {
            await execute(command, repositoryDir)
        }

        return path.join(repositoryDir, this.config.buildDir)
    }

    private async copy(buildDir: string) {
        const destinationDir = this.previewId
            ? path.join(this.config.destination + "-preview", this.previewId)
            : this.config.destination

        if (fs.existsSync(destinationDir)) fs.rmdirSync(destinationDir, { recursive: true })
        fs.mkdirSync(destinationDir, { recursive: true })

        fse.copySync(buildDir, destinationDir, { recursive: true, overwrite: true })
    }
}
