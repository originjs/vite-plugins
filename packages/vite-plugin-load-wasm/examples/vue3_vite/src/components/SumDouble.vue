<template>
  <h2>Use rust wasm function sumDouble</h2>
  <h3>input data = {{ arr }}</h3>
  <h3>sum result = {{ sumRes }}</h3>
</template>

<script>
export default {
  async setup() {
    const wasm = await import('../wasm/sumDouble.js')
    console.log('loading sumDouble wasm result:', wasm)

    const arr = new Float64Array(10)
    for (let i = 0; i < arr.length; i++) {
      arr[i] = 1.0 + i
    }
    const sumRes = wasm.sum_double(arr, arr.length)
    return { arr, sumRes }
  },
}
</script>
