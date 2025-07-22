const commonJSRegex: RegExp = /\b(module\.exports|exports\.\w+|exports\s*=\s*|exports\s*\[.*\]\s*=\s*)/;
const requireRegex: RegExp = /(?<![^\.]\.)\b_{0,2}require\s*\(\s*(["'`].*?["'`])\s*\)/g;
const IMPORT_STRING_PREFIX: String = "__require_for_vite";
const multilineCommentsRegex = /\/\*[\s\S]*?\*\//gm
const singleCommentsRegex = /([^\:])\/\/.*/g

export interface TransformRequireResult {
  code: string;
  replaced: boolean;
}

export function transformRequire(code: string, id: string): TransformRequireResult {
  let replaced = false;
  // skip if has no require
  if (!/require/.test(code)) {
    return {
      replaced,
      code,
    };
  }
  // empty multiline comments
  code = removeComments(code, multilineCommentsRegex, '/* */');
  // remove singleline comments
  code = removeComments(code, singleCommentsRegex);

  const requireMatches = code.matchAll(requireRegex);
  let importsString = '';
  let packageName = '';
  for (let item of requireMatches) {
    if (!isString(item[1])) {
      console.warn(`Not supported dynamic import, file:${id}`);
      continue;
    }
    replaced = true;
    packageName = `${IMPORT_STRING_PREFIX}_${randomString(6)}`;
    importsString += `import * as ${packageName} from ${item[1].replace(/`/g, `'`)};\n`;
    code = code.replace(item[0], `(${packageName}.default || ${packageName})`);
  }

  if (replaced) {
    code = importsString + code;
  }
  return {
    replaced,
    code,
  };
}

export function isCommonJS(code: string): boolean {
  return commonJSRegex.test(code);
}

function removeComments(
  code: string,
  exp: RegExp,
  replaceValue?: string
): string {
  const matches = code.matchAll(exp);
  let matcheStr: string;
  for (let item of matches) {
    matcheStr = item[0];
    if (matcheStr.search(requireRegex) == -1) {
      continue;
    }
    if (!replaceValue) {
      replaceValue = item[1] || '';
    }
    code = code.replace(matcheStr, replaceValue);
  }
  return code;
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
