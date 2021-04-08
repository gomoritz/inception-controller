import { Context } from "probot"
import deploy from "../deploy/deploy"

export async function handlePush(context: Context) {
    const ref = context.payload.ref
    if (!ref.includes("heads")) return

    const branch = ref.split("/")[ref.split("/").length - 1]
    if (branch !== "production") return

    await deploy({ repositorySpec: context.repo(), ref, context, type: "production" })
}
