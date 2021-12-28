import { transformSync, TransformResult } from 'esbuild';
import { transformRequire, isCommonJS } from './lib';
import * as fs from 'fs';
import { Plugin } from 'vite';
import createFilter from './filter';

export type Options = {
  include?: string | string[] | undefined;
  exclude?: string | string[] | undefined;
  skipPreBuild?: boolean;
};

export function viteCommonjs(
  options: Options = { skipPreBuild: false },
): Plugin {
  const filter = createFilter(options.include, options.exclude);
  return {
    name: 'originjs:commonjs',
    apply: 'serve',
    transform(code: string, id: string): TransformResult {
      if (
        !filter(id) ||
        (options.skipPreBuild && id.indexOf('/node_modules/.vite/') !== -1)
      ) {
        return null;
      }

      let result = transformRequire(code, id);

      if (id.indexOf('/node_modules/.vite/') == -1 && isCommonJS(code)) {
        return transformSync(result.code, { format: 'esm' });
      }

      if (result.replaced) {
        return {
          code: result.code,
          map: null,
          warnings: null,
        };
      }
      return null;
    },
  };
}

export function esbuildCommonjs(include: string[] = []) {
  return {
    name: 'originjs:commonjs',
    setup(build) {
      build.onLoad(
        {
          filter: new RegExp('(' + include.join('|') + ').*.js'),
          namespace: 'file',
        },
        async ({ path: id }) => {
          const code = fs.readFileSync(id).toString();
          let result = transformRequire(code, id);
          if (result.replaced) {
            return {
              contents: result.code,
              loader: 'js',
            };
          }
          return null;
        },
      );
    },
  };
}
