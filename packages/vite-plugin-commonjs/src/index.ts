import { transformSync, TransformResult } from "esbuild";
import { Plugin } from "vite";
import { createFilter } from "@rollup/pluginutils";

const commonJSRegex: RegExp = /\b(module\.exports|exports\.\w+|exports\s*=\s*)/;
const requireRegex: RegExp = /require\(([\'|\"].*[\'|\"])\)/g;
const IMPORT_STRING_PREFIX: String = "__require_for_vite";

type Options = {
    include?: string | RegExp | string[] | RegExp[] | undefined;
    exclude?: string | RegExp | string[] | RegExp[] | undefined;
};

export default (options: Options = {}): Plugin => {
    const filter = createFilter(options.include, options.exclude);

    return {
        name: "originjs:commonjs",
        apply: "serve",
        transform(code: string, id: string): TransformResult {
            if (!filter(id)) {
                return null;
            }

            const requireMatches = code.matchAll(requireRegex);
            let importsString = "";
            let packageName = "";
            for (let item of requireMatches) {
                if (!isString(item[1])) {
                    console.warn(`Not supported dynamic import, file:${id}`);
                    continue;
                }

                packageName = `${IMPORT_STRING_PREFIX}_${randomString(6)}`;
                importsString += `import * as ${packageName} from ${item[1]};\n`;
                code = code.replace(item[0], packageName);
            }

            if (importsString) {
                code = importsString + code;
            }

            if (id.indexOf("/node_modules/.vite/") == -1 && isCommonJS(code)) {
                return transformSync(code, { format: "esm" });
            }

            if (importsString) {
                return {
                    code,
                    map: null,
                    warnings: null,
                };
            }

            return null;
        },
    };
};

function isCommonJS(code: string): Boolean {
    return commonJSRegex.test(code);
}

function randomString(length: number): string {
    const code: string =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    let result: string = "";
    for (let index = 0; index < length; index++) {
        result += code[Math.floor(Math.random() * code.length)];
    }
    return result;
}

function isString(text: string) {
    try {
        return typeof eval(text) === "string";
    } catch (err) {
        return false;
    }
}
