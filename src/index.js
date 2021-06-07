const dir = require('node-dir')
const path = require('path')

export default function requireContext(projectBasePath) {
    return {
        name: 'vite:require-context',
        apply: 'serve',
        async transform(code, id) {
            const requireContextRegex = /require\.context\((.+)\)/g
            const nodeModulesPath = '/node_modules/'

            if (id.includes(nodeModulesPath)) {
                return null
            }

            const requireContextMatches = [...code.matchAll(requireContextRegex)]
            if (requireContextMatches.length === 0) {
                return null
            }

            let transformedCode = code
            let importsStrings = ''

            requireContextMatches.forEach((requireContextMatch, index) => {
                const params = requireContextMatch[1].split(',')
                const directory = params[0] || ''
                const recursive = params[1] || ''
                const regExp = params[2] || ''

                const { importsString, requireContextString } = transformRequireContext(
                    eval(directory),
                    eval(recursive),
                    eval(regExp),
                    id,
                    projectBasePath,
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
    directory,
    recursive = false,
    regExp = /\.(json|js)$/,
    workingFilePath,
    projectBasePath = process.cwd(),
    matchIndex
) {
    const importStringPrefix = '__require_context_for_vite'
    let basePath

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

    const absolutePaths = dir
        .files(basePath, {
            sync: true,
            recursive: recursive,
        })
        .filter(function (file) {
            return file.match(regExp)
        })
        .map(function (absolutePath) {
            return absolutePath.replace(/\\/g, '/')
        })

    const importedFiles = absolutePaths.map((absolutePath) => {
        return absolutePath.slice(projectBasePath.length)
    })

    const keys = absolutePaths.map((absolutePath) => {
        return absolutePath.slice(basePath.length + 1)
    })

    let importsString = ''
    let requireContextString = '{'
    for (let i = 0; i < keys.length; i++) {
        const importEntry = `${importStringPrefix}_${matchIndex}_${i}`
        importsString += `import * as ${importEntry} from "${importedFiles[i]}";`
        requireContextString += ` ${JSON.stringify(keys[i])} : ${importEntry},`
    }
    requireContextString = requireContextString.substring(0, requireContextString.length - 2) + '}'

    return {
        importsString,
        requireContextString
    }
}