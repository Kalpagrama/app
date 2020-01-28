<template lang="pug">
q-layout(view="hHh lpR fFf")
  //- body
  q-page-container.row.full-width.window-height
    div(
      :style=`{maxWidth: '500px'}`
      ).row.full-height.bg-black.gt-xs
      ws-menu
    .col
      h1 workspace
  //- footer
  q-footer.row.full-width.bg-black.lt-sm
    slot(name="menuMobile")
</template>

<script>
import wsMenu from './ws_menu'

export default {
  name: 'workspaceIndex',
  components: {wsMenu},
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
