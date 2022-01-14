import { readFileSync } from "fs";
import { join } from "path";
import { getImportObjInfo } from "../src/parser";

test('wasm ast parser', () => {
  const binary = readFileSync(join(__dirname, './assets/collisionDetectionRust_bg.wasm'));
  const info = getImportObjInfo(binary);
  expect(info).toMatchSnapshot();
})
