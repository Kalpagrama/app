<template lang="pug">
kalpa-finder(
  @contentKalpa="itemFound"
  :pages=`{
    nodes: {views: ['all']},
    //- workspace: {views: ['image', 'video', 'node', 'sphere', 'user']},
    workspace: {views: ['node']},
    //- kalpagrama: {views: ['all', 'users', 'nodes']},
    //- gif: {views: ['all']},
    //- web: {views: ['all', 'image', 'video',]}
  }`
  :style=`{
    //- height: '550px',
    height: $q.screen.height+'px',
  }`).b-30
  template(v-slot:tint=`{item}`)
    div(
      @click="itemFound(item)"
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
    itemFound (item) {
      this.$log('itemFound', item)
      // this.joint.items[1] = item
      this.$emit('item', item)
    }
  }
}
</script>
