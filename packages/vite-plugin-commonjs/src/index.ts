import { transformSync, TransformResult } from "esbuild";
import { transformRequire, isCommonJS } from "./lib";
import * as fs from "fs";
import { Plugin } from "vite";
import createFilter from "./filter";
import MagicString from 'magic-string';

export type Options = {
  include?: string | string[] | undefined;
  exclude?: string | string[] | undefined;
  skipPreBuild?: boolean;
};

export function viteCommonjs(
  options: Options = { skipPreBuild: false }
): Plugin {
  const filter = createFilter(options.include, options.exclude);
  return {
    name: "originjs:commonjs",
    apply: "serve",
    transform(code: string, id: string): TransformResult {
      if (
        !filter(id) ||
        (options.skipPreBuild && id.indexOf("/node_modules/.vite/") !== -1)
      ) {
        return null;
      }

      const ms = new MagicString(code);
      const replaced = transformRequire(ms, id);

      if (id.indexOf("/node_modules/.vite/") == -1 && isCommonJS(code)) {
        return transformSync(ms.toString(), { format: "esm" });
      }

      if (replaced) {
        return {
          code: ms.toString(),
          map: ms.generateMap().toString(),
          warnings: null,
        };
      }
      return null;
    },
  };
}

export function esbuildCommonjs(include: string[] = []) {
  return {
    name: "originjs:commonjs",
    setup(build) {
      build.onLoad(
        {
          filter: new RegExp("(" + include.join("|") + ").*.js"),
          namespace: "file",
        },
        async ({ path: id }) => {
          const code = fs.readFileSync(id).toString();
          const ms = new MagicString(code);
          const replaced = transformRequire(ms, id);
          if (replaced) {
            return {
              contents: ms.toString(),
              loader: "js",
            };
          }
          return null;
        }
      );
    },
  };
}
