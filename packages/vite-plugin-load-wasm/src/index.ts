import { Plugin, ResolvedConfig } from 'vite'

type PluginOptions = {
  [name: string]: any
}

export default (options: PluginOptions = {}): Plugin => {
  const checkLoadResult = (loadRes: any) => {
    return (
      typeof loadRes === 'string' && loadRes.includes('import initWasm from ')
    )
  }

  const overwriteResult = (loadRes: string) => {
    const str1 = loadRes.replace('export default', 'const init =')
    const str2 = 'const exports = await init()\nexport default exports'
    return str1 + str2
  }

  return {
    name: 'vite:load-wasm',

    configResolved(config: ResolvedConfig) {
      // find and check original vite:wasm plugin and its load function
      const wasmPlugin = config.plugins.find(p => p.name === 'vite:wasm')
      if (!wasmPlugin || !wasmPlugin.load) {
        return
      }

      // original vite:wasm load function
      const orgLoad = wasmPlugin.load
      // overwrite
      wasmPlugin.load = async function (id) {
        const loadRes = await orgLoad.apply(this, [id])
        if (!checkLoadResult(loadRes)) {
          return loadRes
        }
        return overwriteResult(loadRes as string)
      }
    },
  }
}
