<template lang="pug">
.row.full-width
  q-input(
    v-model="node.name"
    color="white"
    label="What's the essence?"
    filled dark autogrow autofocus
    :style=`{
      borderRadius: '10px', overflow: 'hidden'
    }`).full-width
</template>

<script>
export default {
  name: 'editEssence',
  props: ['node'],
  data () {
    return {
    }
  }
}
</script>
