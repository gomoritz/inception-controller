import Transport from "winston-transport"
const strip = require("strip-color")
const { MESSAGE } = require("triple-beam")

type Options = Transport.TransportStreamOptions & { callback: (message: string) => void }

export default class CallbackTransport extends Transport {
    constructor(private options: Options) {
        super(options)
    }

    log(info: any, next: () => void): any {
        setImmediate(() => this.emit("logged", info))

        this.options.callback(strip(info[MESSAGE]))
        next()
    }
}
