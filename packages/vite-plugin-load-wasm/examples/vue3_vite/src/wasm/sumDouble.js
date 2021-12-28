import wasm from './sumDouble.wasm'

let cachegetFloat64Memory0 = null
function getFloat64Memory0() {
  if (
    cachegetFloat64Memory0 === null ||
    cachegetFloat64Memory0.buffer !== wasm.memory.buffer
  ) {
    cachegetFloat64Memory0 = new Float64Array(wasm.memory.buffer)
  }
  return cachegetFloat64Memory0
}

let WASM_VECTOR_LEN = 0

function passArrayF64ToWasm0(arg, malloc) {
  const ptr = malloc(arg.length * 8)
  getFloat64Memory0().set(arg, ptr / 8)
  WASM_VECTOR_LEN = arg.length
  return ptr
}
/**
 * @param {Float64Array} array
 * @param {number} n
 * @returns {number}
 */
export function sum_double(array, n) {
  var ptr0 = passArrayF64ToWasm0(array, wasm.__wbindgen_malloc)
  var len0 = WASM_VECTOR_LEN
  var ret = wasm.sum_double(ptr0, len0, n)
  return ret
}
