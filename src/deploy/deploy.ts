import { DeployParams } from "../types/deploy"
import { loadConfig } from "./configuration"
import DeploymentTask from "./DeploymentTask"
import logger from "../logger/logger"

export default async function deploy(params: DeployParams) {
    const logParams = { ...params } as any
    delete logParams.pullRequest
    delete logParams.context

    logger.debug("Trying to deploy with params: %s", logParams)
    const config = await loadConfig(params.repositorySpec, params.context, params.ref)
    logger.debug("Loaded deployment configuration: %o", config)

    if (config) {
        const deployTask = new DeploymentTask(params, config)
        await deployTask.run()
    }
}
