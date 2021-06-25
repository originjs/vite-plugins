import { transformRequire, isCommonJS } from "../src/lib";

test('transform require', () => {
    //general require
    let code = `require("react");`
    let result = transformRequire(code, 'main.ts');
    expect(result.code).toMatch(/import \* as .+ from "react";/);

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

test('isCommonJS', () => {
    expect(isCommonJS(`module.exports = {}`)).toBeTruthy();
    expect(isCommonJS(`exports = { hello: false }`)).toBeTruthy();
});