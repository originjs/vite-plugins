import { transformRequire, isCommonJS } from "../src/lib";

test('transform require', () => {
    //general require
    let code = `require("react");`
    let result = transformRequire(code, 'main.ts');
    expect(result.code).toMatch(/import \* as .+ from "react";/);

    code = `require(\`react\`);`;
    result = transformRequire(code, 'main.ts');
    expect(result.code).toMatch(/import \* as .+ from 'react';/);

    //nested require
    code = `_interopRequire(require('./DatePicker'));`
    result = transformRequire(code, 'main.ts');
    expect(result.code).toMatch(/import \* as .+ from '\.\/DatePicker';/);

    code = `var obj = require('./module.js' );`
    result = transformRequire(code, 'main.ts');
    expect(result.code).toMatch(/import \* as .+ from '\.\/module.js';\nvar obj = /);

    code = `_interopRequire(require('./DatePicker'));`
    result = transformRequire(code, 'main.ts');
    expect(result.code).toMatch(/import \* as .+ from '\.\/DatePicker';/);

    code = `require('./module.js').message = "hello";`
    result = transformRequire(code, 'main.ts');
    expect(result.code).toMatch(/import \* as .+ from '\.\/module.js';\n.+\.message = "hello"/);

    code = `const login = r => require.ensure([], () => r(require('@/page/login')), 'login');`
    result = transformRequire(code, 'main.ts');
    expect(result.code).toMatch(/import \* as .+ from \'@\/page\/login';/);
});

test('require function on object', () => {
  let code = `myObj.require("react");`
  let result = transformRequire(code, 'main.ts');
  expect(result.code).toMatch(`myObj.require("react");`);
});

test('require as part of function name', () => {
  let code = `myrequire("react");`
  let result = transformRequire(code, 'main.ts');
  expect(result.code).toMatch(`myrequire("react");`);
});

test('require in object spread', () => {
  let code = `const messagesDE = {...require('./i18n/de')}`
  let result = transformRequire(code, 'main.ts');
  expect(result.code).not.toMatch(code);
});

test('require in comments', () => {
    //singleline comments
    let code = ` const a=0; // the hook will be setup by require("react").`
    let result = transformRequire(code, 'main.ts');
    expect(result.code).toMatch(/const a=0;/);

    code = `//hello
     const a=0; 
     // the hook will be setup by require("react").`
    result = transformRequire(code, 'main.ts');
    expect(result.code).toMatch(/const a=0;/);

    //multiline comments
    code = ` /* the hook will be setup by \n require("react").\n */`
    result = transformRequire(code, 'main.ts');
    expect(result.code).toMatch(`/* */`);
});

test('isCommonJS', () => {
    expect(isCommonJS(`module.exports = {}`)).toBeTruthy();
    expect(isCommonJS(`exports = { hello: false }`)).toBeTruthy();
    expect(isCommonJS(`exports.foo = 1`)).toBeTruthy();
    expect(isCommonJS(`exports[key] = 1`)).toBeTruthy();
    expect(isCommonJS(`exports[1] = 1`)).toBeTruthy();
    expect(isCommonJS(`exports['some key'] = 1`)).toBeTruthy();
});

test('Both url and comments are present', () => {
  //singleline comments
  let code = `dosomething () {
        console.log('https://www.baidu.com');//this is comments
    }`;

  let result = transformRequire(code, 'main.ts');
  expect(result.code).toMatch(code);

  //multiline comments
  code = `dosomething () {
        /*
        * this is comments
        * this is comments
        * this is comments
        */
        console.log('https://www.baidu.com'); 
    }`;

  result = transformRequire(code, 'main.ts');
  expect(result.code).toMatch(code);

  code = `dosomething () {
    console.log('https://www.baidu.com');//this is comments,require('./test')
    }`;

  let matcheCode = `dosomething () {
    console.log('https://www.baidu.com');
    }`;

  result = transformRequire(code, 'main.ts');
  expect(result.code).toMatch(matcheCode);

  //multiline comments
  code = `dosomething () {
        /*
        * this is comments
        * this is comments,require('./test')
        * this is comments
        */
        console.log('https://www.baidu.com'); 
    }`;

  matcheCode = `dosomething () {
        /* */
        console.log('https://www.baidu.com'); 
    }`;

  result = transformRequire(code, 'main.ts');
  expect(result.code).toMatch(matcheCode);
});

