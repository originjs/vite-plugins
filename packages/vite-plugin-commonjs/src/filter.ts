import { win32, posix } from 'path';

function ensureArray(thing: string) {
  if (Array.isArray(thing)) return thing;
  if (thing == null) return [];
  return [thing];
}

function normalizePath(filename: string) {
  return filename.split(win32.sep).join(posix.sep);
}

export default (include, exclude) => {
  const getMatcher = id => {
    return {
      test: what => what.indexOf(normalizePath(id)) >= 0,
    };
  };

  const includeMatchers = ensureArray(include).map(getMatcher);
  const excludeMatchers = ensureArray(exclude).map(getMatcher);

  return function result(id) {
    if (typeof id !== 'string') return false;

    const pathId = normalizePath(id);
    for (let i = 0; i < excludeMatchers.length; ++i) {
      const matcher = excludeMatchers[i];
      if (matcher.test(pathId)) return false;
    }
    for (let i = 0; i < includeMatchers.length; ++i) {
      const matcher = includeMatchers[i];
      if (matcher.test(pathId)) return true;
    }
    return !includeMatchers.length;
  };
};
