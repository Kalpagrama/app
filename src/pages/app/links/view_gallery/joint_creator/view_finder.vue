<template lang="pug">
div(
  :style=`{
    height: '500px',
    //- background: 'rgb(35,35,35)',
    //- borderRadius: '10px',
  }`
  ).row.full-width.br
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
      height: '500px',
    }`)
    template(v-slot:tint=`{item}`)
      div(
        @click="$emit('item', item)"
        :style=`{position: 'absolute', zIndex: 1000,}`).row.fit.cursor-pointer
</template>

<script>
export default {
  name: 'viewFinder',
}
</script>

<script>
export default {
  name: 'viewFinder',
  data () {
    return {
      tabId: 'nodes',
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
