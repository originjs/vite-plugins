<template>
  <h2>Use rust wasm function collisionDetection</h2>
  <h2>Please see console</h2>
</template>

<script>
export default {
  async setup() {
    const wasm = await import('../wasm/collisionDetectionRust_bg.js')
    console.log('loading collisionDetection wasm result:', wasm)
  },
}
</script>
