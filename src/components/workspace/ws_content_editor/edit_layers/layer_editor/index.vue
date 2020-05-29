<template lang="pug">
.column.fit.b-50
  .col.full-width
  div().row.full-width.q-pa-sm
    .col
    q-btn(push color="green" no-caps @click="$emit('close')").q-px-md Save
</template>

<script>
export default {
  name: 'layerEditor',
  data () {
    return {
    }
  }
}
</script>
