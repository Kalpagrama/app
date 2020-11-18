<template lang="pug">
.row.full-width.q-px-sm
  .col
    q-input(
      v-model="name"
      outlined color="green" dense
      ).full-width
  q-btn(round flat color="green" icon="add")
</template>

<script>
export default {
  name: 'node_pageInside_create',
  data () {
    return {
      name: ''
    }
  }
}
</script>
