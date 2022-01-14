import { WASM_IMPORT_STATEMENT_REX } from "../src";

test('regular matching', () => {
  const rex = WASM_IMPORT_STATEMENT_REX
  const strings = [
    `import wasm from "xx.wasm"`,
    `import wasm from 'xx.wasm'`,
    `import  wasm from 'xx.wasm'`,
    `import wasm  from 'xx.wasm'`,
    `import  wasm  from 'xx.wasm'`,
    ` import wasm from 'xx.wasm'\n`,
    `import wasm from 'xx.wasm'\nimport`,
  ]
  strings.forEach(str => {
    const res = rex.exec(str)
    expect(res).not.toBeNull();
    expect(res[1]).toEqual('wasm')
    expect(res[2]).toEqual('xx.wasm')
  })
})
