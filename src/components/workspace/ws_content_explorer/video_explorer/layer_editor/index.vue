<template lang="pug">
div(
  :style=`{
    borderRadius: '10px', overflow: 'hidden'
  }`
  ).column.fit.b-50
  //- h1 layer editor
  .row.full-width.q-pa-sm
    q-btn(round flat color="white" icon="clear" @click="$emit('close')")
    .row.full-width
      q-input(
        v-model="name"
        filled dark color="grey-5"
        label="What do you see?"
        ).full-width
  .row.full-width
    div(:style=`{height: '70px'}`).row.full-width
</template>

<script>
export default {
  name: 'layerEditor',
  data () {
    return {
      name: ''
    }
  }
}
</script>
