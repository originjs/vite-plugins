import wasm from './collisionDetectionRust_bg.wasm';

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) {
  return heap[idx];
}

let WASM_VECTOR_LEN = 0;

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
  if (
    cachegetUint8Memory0 === null ||
    cachegetUint8Memory0.buffer !== wasm.memory.buffer
  ) {
    cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachegetUint8Memory0;
}

const lTextEncoder =
  typeof TextEncoder === 'undefined'
    ? (0, module.require)('util').TextEncoder
    : TextEncoder;

let cachedTextEncoder = new lTextEncoder('utf-8');

const encodeString =
  typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
        return cachedTextEncoder.encodeInto(arg, view);
      }
    : function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
          read: arg.length,
          written: buf.length,
        };
      };

function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === undefined) {
    const buf = cachedTextEncoder.encode(arg);
    const ptr = malloc(buf.length);
    getUint8Memory0()
      .subarray(ptr, ptr + buf.length)
      .set(buf);
    WASM_VECTOR_LEN = buf.length;
    return ptr;
  }

  let len = arg.length;
  let ptr = malloc(len);

  const mem = getUint8Memory0();

  let offset = 0;

  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 0x7f) break;
    mem[ptr + offset] = code;
  }

  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = realloc(ptr, len, (len = offset + arg.length * 3));
    const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
    const ret = encodeString(arg, view);

    offset += ret.written;
  }

  WASM_VECTOR_LEN = offset;
  return ptr;
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
  if (
    cachegetInt32Memory0 === null ||
    cachegetInt32Memory0.buffer !== wasm.memory.buffer
  ) {
    cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
  }
  return cachegetInt32Memory0;
}

let stack_pointer = 32;

function addBorrowedObject(obj) {
  if (stack_pointer == 1) throw new Error('out of js stack');
  heap[--stack_pointer] = obj;
  return stack_pointer;
}

let cachegetFloat64Memory0 = null;
function getFloat64Memory0() {
  if (
    cachegetFloat64Memory0 === null ||
    cachegetFloat64Memory0.buffer !== wasm.memory.buffer
  ) {
    cachegetFloat64Memory0 = new Float64Array(wasm.memory.buffer);
  }
  return cachegetFloat64Memory0;
}

function passArrayF64ToWasm0(arg, malloc) {
  const ptr = malloc(arg.length * 8);
  getFloat64Memory0().set(arg, ptr / 8);
  WASM_VECTOR_LEN = arg.length;
  return ptr;
}

function passArray8ToWasm0(arg, malloc) {
  const ptr = malloc(arg.length * 1);
  getUint8Memory0().set(arg, ptr / 1);
  WASM_VECTOR_LEN = arg.length;
  return ptr;
}
/**
 * @param {any} js_positions
 * @param {Float64Array} radiuses
 * @param {Uint8Array} res
 * @param {number} n
 * @returns {number}
 */
export function collision_detection(js_positions, radiuses, res, n) {
  try {
    var ptr0 = passArrayF64ToWasm0(radiuses, wasm.__wbindgen_malloc);
    var len0 = WASM_VECTOR_LEN;
    var ptr1 = passArray8ToWasm0(res, wasm.__wbindgen_malloc);
    var len1 = WASM_VECTOR_LEN;
    var ret = wasm.collision_detection(
      addBorrowedObject(js_positions),
      ptr0,
      len0,
      ptr1,
      len1,
      n,
    );
    return ret;
  } finally {
    heap[stack_pointer++] = undefined;
    res.set(getUint8Memory0().subarray(ptr1 / 1, ptr1 / 1 + len1));
    wasm.__wbindgen_free(ptr1, len1 * 1);
  }
}

export function __wbindgen_json_serialize(arg0, arg1) {
  const obj = getObject(arg1);
  var ret = JSON.stringify(obj === undefined ? null : obj);
  var ptr0 = passStringToWasm0(
    ret,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc,
  );
  var len0 = WASM_VECTOR_LEN;
  getInt32Memory0()[arg0 / 4 + 1] = len0;
  getInt32Memory0()[arg0 / 4 + 0] = ptr0;
}
