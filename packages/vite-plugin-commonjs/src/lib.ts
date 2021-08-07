const commonJSRegex: RegExp = /\b(module\.exports|exports\.\w+|exports\s*=\s*)/;
const requireRegex: RegExp = /_{0,2}require\s*\(\s*(["'].*["'])\s*\)/g;
const IMPORT_STRING_PREFIX: String = "__require_for_vite";

export interface TransformRequireResult {
  code: string;
  replaced: boolean;
}

export function transformRequire(code: string, id: string):TransformRequireResult {
  const requireMatches = code.matchAll(requireRegex);
  let importsString = "";
  let packageName = "";
  let replaced = false;
  for (let item of requireMatches) {
    if (!isString(item[1])) {
      console.warn(`Not supported dynamic import, file:${id}`);
      continue;
    }
    replaced = true;
    packageName = `${IMPORT_STRING_PREFIX}_${randomString(6)}`;
    importsString += `import * as ${packageName} from ${item[1]};\n`;
    code = code.replace(item[0], `${packageName}.default || ${packageName}`);
  }

  if (replaced) {
    code = importsString + code;
  }
  return {
    replaced,
    code
  }
}

export function isCommonJS(code: string): boolean {
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
