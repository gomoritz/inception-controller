import { Format } from "logform"
import { format } from "winston"

const metaRegEx = /%[scdjifoO%]/g

type FormatMetaOptions = { functions: [(input: string) => string] }

const formatMeta: (options: FormatMetaOptions) => Format = format((info, options: FormatMetaOptions) => {
    let formatted = "$&"
    options.functions.forEach((func) => (formatted = func(formatted)))

    const formattedMessage = info.message.replace(metaRegEx, formatted)
    return { ...info, message: formattedMessage }
})

export default formatMeta
