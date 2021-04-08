import { RepositorySpec } from "../types/github"
import { Config } from "../types/config"
import { Context } from "probot"

export async function loadConfig(
    repositorySpec: RepositorySpec,
    context: Context,
    ref: string
): Promise<Config | null> {
    try {
        const { data } = await context.octokit.repos.getContent({
            ...repositorySpec,
            path: "deploy.json",
            ref
        })
        if ("content" in data) {
            const decoded = new Buffer(data.content, "base64").toString("ascii")
            return JSON.parse(decoded) as Config
        }
    } catch (e) {}
    return null
}
