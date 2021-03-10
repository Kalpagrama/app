<template lang="pug">
kalpa-finder(
  @contentKalpa="$emit('item', $event)"
  @close="$emit('close')"
  :pages=`{
    nodes: {views: ['all']},
    workspace: {views: ['node']},
  }`
  :style=`{
    height: $q.screen.height+'px',
  }`).b-30.bg
  template(v-slot:tint=`{item}`)
    div(
      @click="$emit('item', item)"
      :style=`{position: 'absolute', zIndex: 1000,}`).row.fit.cursor-pointer
</template>

<script>
export default {
  name: 'itemFinder',
  props: ['joint'],
  data () {
    return {
      searchString: ''
    }
  },
  methods: {
  }
}
</script>
