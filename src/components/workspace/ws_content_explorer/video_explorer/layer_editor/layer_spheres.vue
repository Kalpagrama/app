<template lang="pug">
.column.fit.q-py-sm
  .row.full-width.q-px-sm
    q-input(
      v-model="searchString"
      filled dark dense color="grey-5"
      label="Find or add sphere"
      ).full-width
      template(v-slot:append)
        q-btn(
          v-if="searchString.length > 0"
          @click="searchString = ''"
          round flat dense color="grey-5" icon="clear")
</template>

<script>
export default {
  name: 'layerSpheres',
  data () {
    return {
      searchString: ''
    }
  }
}
</script>
