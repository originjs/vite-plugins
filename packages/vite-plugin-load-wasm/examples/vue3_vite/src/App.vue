<template>
  <suspense :timeout="0">
    <template #default>
      <SumDouble></SumDouble>
    </template>
    <template #fallback>
      <h2>Loading WASM</h2>
    </template>
  </suspense>
  <p>==============================================</p>
  <suspense :timeout="0">
    <template #default>
      <CollisionDetection></CollisionDetection>
    </template>
    <template #fallback>
      <h2>Loading WASM</h2>
    </template>
  </suspense>
</template>

<script>
import SumDouble from './components/SumDouble.vue'
import CollisionDetection from './components/collisionDetection.vue'
import { Suspense } from "vue";

export default {
  name: 'App',
  components: {
    Suspense,
    SumDouble,
    CollisionDetection,
  }
}
</script>
