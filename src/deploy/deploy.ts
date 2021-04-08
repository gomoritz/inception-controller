import { DeployParams } from "../types/deploy"
import { loadConfig } from "./configuration"
import DeploymentTask from "./DeploymentTask"

export default async function deploy(params: DeployParams) {
    const config = await loadConfig(params.repositorySpec, params.context, params.ref)
    if (config) {
        const deployTask = new DeploymentTask(params, config)
        await deployTask.run()
    }
}
