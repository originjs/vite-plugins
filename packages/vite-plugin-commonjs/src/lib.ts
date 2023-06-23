import MagicString from 'magic-string';

const commonJSRegex: RegExp = /\b(module\.exports|exports\.\w+|exports\s*=\s*|exports\s*\[.*\]\s*=\s*)/;
const requireRegex: RegExp = /(?<!\.)\b_{0,2}require\s*\(\s*(["'`].*?["'`])\s*\)/g;
const IMPORT_STRING_PREFIX: String = "__require_for_vite";
const multilineCommentsRegex = /\/\*(.|[\r\n])*?\*\//gm
const singleCommentsRegex = /([^\:])\/\/.*/g

export function transformRequire(ms: MagicString, id: string): boolean {
  let replaced = false;
  // skip if has no require
  if (!/require/.test(ms.toString())) {
    return replaced
  }
  // empty multiline comments
  removeComments(ms, multilineCommentsRegex, '/* */');
  // remove singleline comments
  removeComments(ms, singleCommentsRegex);

  const requireMatches = ms.toString().matchAll(requireRegex);
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
    ms.replace(item[0], `(${packageName}.default || ${packageName})`);
  }

  if (replaced) {
    ms.prepend(importsString);
  }
  return replaced;
}

export function isCommonJS(code: string): boolean {
  return commonJSRegex.test(code);
}

function removeComments(
  ms: MagicString,
  exp: RegExp,
  replaceValue?: string
): void {
  const matches = ms.toString().matchAll(exp);
  let matcheStr: string;
  for (let item of matches) {
    matcheStr = item[0];
    if (matcheStr.search(requireRegex) == -1) {
      continue;
    }
    if (!replaceValue) {
      replaceValue = item[1] || '';
    }
    ms.replace(matcheStr, replaceValue);
  }
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
