import { decode } from '@webassemblyjs/wasm-parser';
import { traverse } from '@webassemblyjs/ast';

export function getImportObjInfo(binary: any) {
  const decoderOpts = {};
  const ast = decode(binary, decoderOpts);

  let map: Map<string, Array<string>> = new Map<string, Array<string>>();
  traverse(ast, {
    ModuleImport(path) {
      const node = path.node;
      map.set(node.module, (map.get(node.module) || []).concat([node.name]));
    },
  });

  return map;
}
