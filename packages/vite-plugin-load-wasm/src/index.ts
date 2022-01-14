import { normalizePath, Plugin } from 'vite';
import { createFilter } from '@rollup/pluginutils';
import { readFileSync } from 'fs';
import { getImportObjInfo } from './parser';
import { join, dirname } from 'path';

type PluginOptions = {
  include?: Array<string>;
  exclude?: Array<string>;
};

const DEFAULT_OPTIONS: PluginOptions = {
  include: [],
  exclude: [],
};

// matching like: 'import wasm from "xxx.wasm"'
export const WASM_IMPORT_STATEMENT_REX = /import\s*(\S*)\s*from\s*['"](.*\.wasm).*/;

export default (options: PluginOptions = {}): Plugin => {
  // init options
  options = Object.assign(DEFAULT_OPTIONS, options);

  // normalize path of include and exclude. Then create a filter.
  const include = options.include!.map(item => normalizePath(item));
  const exclude = options.exclude!.map(item => normalizePath(item));
  const filter = createFilter(include, exclude);

  return {
    name: 'vite:load-wasm',
    enforce: 'pre',

    async transform(code: string, id: string) {
      // check file id
      if (!filter(id)) {
        return null;
      }

      // regular matching and check
      const rexRes = WASM_IMPORT_STATEMENT_REX.exec(code);
      if (rexRes === null) {
        return null;
      }
      if (!rexRes[0] || !rexRes[1] || !rexRes[2]) {
        console.log('vite-plugin-load-wasm: regular matching result fail');
        return null;
      }

      // init matchStr, importName, wasmFileName
      const [matchStr, importName, wasmFileName] = [
        rexRes[0],
        rexRes[1],
        rexRes[2],
      ];

      // get importObj
      const info = getImportObjInfo(
        readFileSync(join(dirname(id), wasmFileName)),
      );
      if (info.size > 1) {
        console.log(
          'vite-plugin-load-wasm: import item number should less than 1',
        );
        return null;
      }
      let importFileName;
      for (let name of info.keys()) {
        importFileName = name;
        break;
      }

      // replace string
      let replaceStr;
      if (!!importFileName) {
        replaceStr = `import init from '${wasmFileName}'
let imports = {}
imports['${importFileName}'] = {${info.get(importFileName)!.join(', ')}}
const ${importName} = await init(imports)
`;
      } else {
        replaceStr = `import init from '${wasmFileName}'
const ${importName} = await init()
`;
      }

      // console.log(code.replace(matchStr, replaceStr));
      return code.replace(matchStr, replaceStr);
    },
  };
};
