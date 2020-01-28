<template lang="pug">
q-layout(view="hHh lpR fFf")
  //- body
  q-page-container.row.full-width.window-height
    div(
      :style=`{maxWidth: '300px'}`
      ).row.full-height.bg-black.gt-xs
      slot(name="menuDesktop")
    div(
      :style=`{maxWidth: '300px'}`
      ).row.fit.bg-black.gt-xs
      ws-menu
    div(
      :style=`{maxWidth: '500px'}`
      ).row.fit.bg-black
      ws-contents
    .col.full-height
      ws-content
  //- footer
  q-footer.row.full-width.bg-black.lt-sm
    slot(name="menuMobile")
</template>

<script>
import wsContents from './ws_contents'
import wsContent from './ws_content'
import wsMenu from './ws_menu'

export default {
  name: 'workspaceIndex',
  components: {wsMenu, wsContent, wsContents},
  props: [],
  data () {
    return {
    }
  },
  computed: {
  },
  methods: {
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
