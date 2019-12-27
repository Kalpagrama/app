<template lang="pug">
q-layout(view="hHh lpR fFf" @resize="onResize" @scroll="onScroll").bg-grey-3
  q-footer(reveal).row.full-width.justify-center.bg-grey-3
    k-menu-mobile(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).bg-white
  q-page-conainter
    div(:style=`{paddingBottom: '60px'}`).row.full-width.justify-center.items-start.content-start
      div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.items-start.content-start
        //- div(
        //-   v-if="$q.screen.width > 750"
        //-   :style=`{
        //-     width: '250px', height: $q.screen.height-60+'px',
        //-     borderRight: '1px solid #eee'
        //-   }`).column.bg-white
        //-   //- div(:style=`{height: '74px', borderBottom: '1px solid #eee'}`).row.full-width
        //-   //- .col.full-width
        //-   ws-items(:types="['fragments']")
        .col
          fragment-editor
</template>

<script>
import wsItems from 'components/workspace/ws_items'
import fragmentEditor from 'components/node/fragment_editor'

export default {
  name: 'pageAppFragment',
  components: {wsItems, fragmentEditor},
  data () {
    return {
    }
  },
  methods: {
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
