<template lang="pug">
.row.full-width.justify-center
  q-input(
    v-model="node.name"
    color="white"
    label="В чем суть?"
    filled dark
    autogrow
    :readonly="!options.essenceEditable"
    :input-style=`{
      minHeight: '60px',
    }`
    :style=`{
      maxWidth: '600px',
      borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden', transform: 'translate3d(0,0,0)',
    }`).full-width
</template>

<script>
export default {
  name: 'editEssence',
  props: ['node', 'options'],
  data () {
    return {
    }
  }
}
</script>
