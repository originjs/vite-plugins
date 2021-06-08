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
const requireContextStringPrefix: string = '__require_context_for_vite'

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
            let addedCode: string = ''

            requireContextMatches.forEach((requireContextMatch, index) => {
                const params: string[] = requireContextMatch[1].split(',')
                const directory: string = params[0] || ''
                const recursive: string = params[1] || ''
                const regExp: string = params[2] || ''

                const { importsString, key2FilesMapString, contextFunctionString, requireContextFunctionName} = transformRequireContext(
                    eval(directory),
                    eval(recursive),
                    eval(regExp) || options.defaultRegExp,
                    id,
                    options.projectBasePath,
                    index
                )

                addedCode += importsString + key2FilesMapString + contextFunctionString
                transformedCode = transformedCode.replace(
                    requireContextMatch[0],
                    requireContextFunctionName
                )
            })

            transformedCode = addedCode + transformedCode
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
        return './' + absolutePath.slice(basePath.length + 1)
    })

    const requireContextMapName = `${requireContextStringPrefix}_map_${matchIndex}`
    const requireContextFunctionName = `${requireContextStringPrefix}_function_${matchIndex}`

    const key2FilesMap = generateKey2FilesMap(keys, importedFiles, matchIndex)
    const importsString = generateImportsString(keys, importedFiles, matchIndex)
    const key2FilesMapString = generateKey2FilesMapString(key2FilesMap, requireContextMapName)
    const contextFunctionString = generateContextFunctionString(requireContextFunctionName, requireContextMapName, matchIndex)

    // let requireContextString: string = '{'
    // keys.forEach((key, index) => {
    //     const importEntry:string = `${importStringPrefix}_${matchIndex}_${index}`
    //     importsString += `import * as ${importEntry} from "${importedFiles[index]}";`
    //     requireContextString += ` ${JSON.stringify(key)} : ${importEntry},`
    // })
    // requireContextString = requireContextString.substring(0, requireContextString.length - 1) + '}'

    return {
        importsString,
        key2FilesMapString,
        contextFunctionString,
        requireContextFunctionName
    }
}

function generateKey2FilesMap(
    keys: string[],
    importedFiles: string[],
    matchIndex: number
): object {
    let key2FilesMap: object = {}
    keys.forEach((key, index) => {
        const importEntry:string = `${requireContextStringPrefix}_${matchIndex}_${index}`
        key2FilesMap[key] = {
            'importEntry': importEntry,
            'filePath': './' + importedFiles[index]
        }
    })

    return key2FilesMap
}

function generateImportsString(
    keys: string[],
    importedFiles: string[],
    matchIndex: number
): string {
    let importsString: string = ''
    for (let index = 0; index < keys.length; index++) {
        const importEntry:string = `${requireContextStringPrefix}_${matchIndex}_${index}`
        importsString += `import * as ${importEntry} from "${importedFiles[index]}";`
    }
    importsString += '\n'

    return importsString
}

function generateKey2FilesMapString (
    key2FilesMap: object,
    requireContextMapName: string
): string {
    let key2FilesMapString = `var ${requireContextMapName} = {\n`
    Object.keys(key2FilesMap).forEach((key) => {
        key2FilesMapString += `"${key}" : ${key2FilesMap[key].importEntry},\n`
    })
    key2FilesMapString = key2FilesMapString.substring(0, key2FilesMapString.length - 2) + '\n}'

    return key2FilesMapString
}

function generateContextFunctionString(
    requireContextFunctionName: string,
    requireContextMapName: string,
    matchIndex: number
): string {
    const requireContextResolveFunctionName = `${requireContextFunctionName}_resolve`
    const requireContextKeysFunctionName = `${requireContextFunctionName}_keys`
    // webpackContext(req)
    let contextFunctionString = `function ${requireContextFunctionName}(req) {\n
        var id = ${requireContextResolveFunctionName}(req);\n
        return ${requireContextMapName}[req];\n
    }\n`

    // webpackContextResolve(req)
    contextFunctionString += `function ${requireContextResolveFunctionName}(req) {\n
        if (req in ${requireContextMapName}) {\n
            return ${requireContextMapName}[req];\n
        }\n
        var e = new Error("Cannot find module '" + req + "'");\n
        e.code = 'MODULE_NOT_FOUND';\n
        throw e;\n
    }\n`

    // webpackConext.keys
    contextFunctionString += `${requireContextFunctionName}.keys = function ${requireContextKeysFunctionName}() {\n
        return Object.keys(${requireContextMapName});\n
    }\n`

    // webpackContext.resolve
    contextFunctionString += `${requireContextFunctionName}.resolve = ${requireContextResolveFunctionName}\n`

    // webpackContext.id
    // TODO: not implemented
    contextFunctionString += `${requireContextFunctionName}.id = "id${matchIndex}"`

    return contextFunctionString
}