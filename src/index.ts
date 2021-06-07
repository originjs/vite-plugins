import * as path from 'path'
import { Plugin } from 'vite'
import { files } from 'node-dir'

type PluginOptions = {
    /**
     * The base path of your project used in require.context. Default to be `process.cwd()`
     */
    projectBasePath?: string,

    /**
     * The default RegExp used in `require.context` if the third parameter of `require.context` is not specified. Default to be `/\.(json|js)$/`
     */
    defaultRegExp?: RegExp
}

const DEFAULT_REGEXP: RegExp = /\.(json|js)$/
const DEFAULT_PROJECT_BASE_PATH: string = process.cwd()

export default (options: PluginOptions = {}): Plugin => {
    return {
        name: 'vite:require-context',
        apply: 'serve',
        async transform(code: string, id: string) {
            const requireContextRegex: RegExp = /require\.context\((.+)\)/g
            const nodeModulesPath: string = '/node_modules/'

            if (id.includes(nodeModulesPath)) {
                return null
            }

            const requireContextMatches = [...code.matchAll(requireContextRegex)]
            if (requireContextMatches.length === 0) {
                return null
            }

            let transformedCode: string = code
            let importsStrings: string = ''

            requireContextMatches.forEach((requireContextMatch, index) => {
                const params: string[] = requireContextMatch[1].split(',')
                const directory: string = params[0] || ''
                const recursive: string = params[1] || ''
                const regExp: string = params[2] || ''

                const { importsString, requireContextString } = transformRequireContext(
                    eval(directory),
                    eval(recursive),
                    eval(regExp) || options.defaultRegExp,
                    id,
                    options.projectBasePath,
                    index
                )

                importsStrings += importsString + '\n'
                transformedCode = transformedCode.replace(
                    requireContextMatch[0],
                    requireContextString
                )
            })

            transformedCode = importsStrings + transformedCode
            return { code: transformedCode }
        },
    }
}

function transformRequireContext(
    directory: string,
    recursive: boolean = false,
    regExp: RegExp = DEFAULT_REGEXP,
    workingFilePath: string,
    projectBasePath: string = DEFAULT_PROJECT_BASE_PATH,
    matchIndex: number
) {
    const importStringPrefix: string = '__require_context_for_vite'
    let basePath: string

    switch (directory[0]) {
        case '.' :
            basePath = path.join(workingFilePath, '..\\', directory)
            break
        case '/' :
            basePath = path.join(projectBasePath, directory)
            break
        case '@' :
            basePath = path.join(projectBasePath, 'src', directory.substr(1))
            break
        default:
            basePath = path.join(projectBasePath, 'node_modules', directory)
    }

    const absolutePaths: string[] = files(basePath, {
            sync: true,
            recursive: recursive,
        })
        .filter(function (file) {
            return file.match(regExp)
        })
        .map(function (absolutePath) {
            return absolutePath.replace(/\\/g, '/')
        })

    const importedFiles: string[] = absolutePaths.map((absolutePath) => {
        return absolutePath.slice(projectBasePath.length)
    })

    const keys: string[] = absolutePaths.map((absolutePath) => {
        return absolutePath.slice(basePath.length + 1)
    })

    let importsString: string = ''
    let requireContextString: string = '{'
    keys.forEach((key, index) => {
        const importEntry:string = `${importStringPrefix}_${matchIndex}_${index}`
        importsString += `import * as ${importEntry} from "${importedFiles[index]}";`
        requireContextString += ` ${JSON.stringify(key)} : ${importEntry},`
    })
    requireContextString = requireContextString.substring(0, requireContextString.length - 2) + '}'

    return {
        importsString,
        requireContextString
    }
}