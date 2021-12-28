const require_context = require('../src/index');
const path = require('path');
const fs = require('fs');

//file in node_modules
test('file in node_modules', () => {
  const code =
    "const requireComponents = require.context('./test/components', true, /.*/);";
  const id =
    process.cwd().replace(/\\/g, '/') + '/' + 'node_modules' + '/' + 'main.js';
  const resultCode = require_context.default().transform(code, id);

  return resultCode.then(data => {
    expect(data).toBe(null);
  });
});

//file did not contains require.context
test('file did not contains require.context', () => {
  const code =
    "const requireComponents = requre.contxt('./test/components', true, /.*/);";
  const id = process.cwd().replace(/\\/g, '/') + '/' + 'src' + '/' + 'main.js';
  const resultCode = require_context.default().transform(code, id);

  return resultCode.then(data => {
    expect(data).toBe(null);
  });
});

//require context relativepath
test('require context relativepath', () => {
  const code =
    "const requireComponents = require.context('../test/components', true, /.*/);";
  const id = process.cwd().replace(/\\/g, '/') + '/' + 'src' + '/' + 'main.js';
  const resultCode = require_context.default().transform(code, id);
  const expectCode = fs.readFileSync(
    './test/expects/recursiveresult.txt',
    'utf-8',
  );

  return resultCode.then(data => {
    expect(data.code).toBe(expectCode);
  });
});

//require context default params
test('require context default params: recursive=false, regexp=/^.*$/', () => {
  const code =
    "const requireComponents = require.context('../test/components');";
  const id = process.cwd().replace(/\\/g, '/') + '/' + 'src' + '/' + 'main.js';
  const resultCode = require_context.default().transform(code, id);
  const expectCode = fs.readFileSync(
    './test/expects/recursiveresult.txt',
    'utf-8',
  );

  return resultCode.then(data => {
    expect(data.code).toBe(expectCode);
  });
});

//require context base on project path
test('require context base on project path', () => {
  const code =
    "const requireComponents = require.context('/test/components', true, /.*/);";
  const id = process.cwd().replace(/\\/g, '/') + '/' + 'src' + '/' + 'main.js';
  const resultCode = require_context.default().transform(code, id);
  const expectCode = fs.readFileSync(
    './test/expects/recursiveresult.txt',
    'utf-8',
  );

  return resultCode.then(data => {
    expect(data.code).toBe(expectCode);
  });
});

test('require context can work on code with comment', () => {
  const code = `const requireComponents = require.context(
    // comment A
    '/test/components',
    // comment B
    true,
    // comment C
    /.*/);`;
  const id = process.cwd().replace(/\\/g, '/') + '/' + 'src' + '/' + 'main.js';
  const resultCode = require_context.default().transform(code, id);
  const expectCode = fs.readFileSync(
    './test/expects/recursiveresult.txt',
    'utf-8',
  );

  return resultCode.then(data => {
    expect(data.code).toBe(expectCode);
  });
});

//require context base on the /src
test('require context base on the /src', () => {
  const code =
    "const requireComponents = require.context('@/../test/components', true, /.*/);";
  const id = process.cwd().replace(/\\/g, '/') + '/' + 'main.js';
  const resultCode = require_context.default().transform(code, id);
  const expectCode = fs.readFileSync(
    './test/expects/recursiveresult.txt',
    'utf-8',
  );

  return resultCode.then(data => {
    expect(data.code).toBe(expectCode);
  });
});

//require context can not find any matched files
test('require context can not find any matched files', () => {
  const code =
    "const requireComponents = require.context('/test/components', true, /.nomatch$/);\n";
  const id = process.cwd().replace(/\\/g, '/') + '/' + 'src' + '/' + 'main.js';
  const resultCode = require_context.default().transform(code, id);
  const expectCode = fs.readFileSync(
    './test/expects/no_match_result.txt',
    'utf-8',
  );

  return resultCode.then(data => {
    expect(data.code).toBe(expectCode);
  });
});

test('require context surrounded by another function', () => {
  const code =
    "const requireComponents = getFilesByContext(require.context('/test/components', true, /.nomatch$/));\n";
  const id = process.cwd().replace(/\\/g, '/') + '/' + 'src' + '/' + 'main.js';
  const resultCode = require_context.default().transform(code, id);
  const expectCode = fs.readFileSync(
    './test/expects/surroundedByFunction.txt',
    'utf-8',
  );

  return resultCode.then(data => {
    expect(data.code).toBe(expectCode);
  });
});
