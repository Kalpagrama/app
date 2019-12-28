<template lang="pug">
q-layout(view="hHh lpR fFf" @resize="onResize" @scroll="onScroll").bg-grey-3
  q-footer(reveal).row.full-width.justify-center.bg-grey-3
    k-menu-mobile(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px', background: bg}`)
  q-page-conainter
    div(:style=`{paddingBottom: '60px'}`).row.full-width.justify-center.items-start.content-start
      div(:style=`{position: 'relative', maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.items-start.content-start
        div(
          v-if="menuShow"
          @click.self="menuShow = false"
          :style=`{
            position: 'absolute', left: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.5)'
            }`
          ).row.full-width
          ws-fragments(
            @itemClick="fragmentClick"
            :style=`{
              maxWidth: '300px', height: $q.screen.height-60+'px',
              borderRight: '1px solid #eee'
              }`
            ).coliumn.bg-white
        .col
          fragment-editor(ref="fragmentEditor" @bg="bg = $event" @menu="menuToggle()")
</template>

<script>
import wsFragments from 'components/workspace/ws_fragments'
import fragmentEditor from 'components/node/fragment_editor'

export default {
  name: 'pageAppFragment',
  components: {wsFragments, fragmentEditor},
  data () {
    return {
      bg: 'white',
      menuShow: false
    }
  },
  methods: {
    async fragmentClick (i) {
      this.$log('fragmentClick', i)
      this.$refs.fragmentEditor.fragmentUse(i.item)
      await this.$wait(200)
      this.menuShow = false
    },
    menuToggle () {
      this.$log('menuToggle')
      this.menuShow = !this.menuShow
    },
    onResize (e) {
      // this.$log('onResize', e)
      // this.$q.notify('onResize')
    },
    onScroll (e) {
      // this.$log('onScroll')
    }
  },
  mounted () {
    this.$log('mounted')
    this.$q.addressbarColor.set('red')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
