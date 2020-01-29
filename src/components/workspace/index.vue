<template lang="pug">
q-layout(view="hHh lpR fFf")
  //- body
  q-page-container.row.full-width.window-height
    div(
      :style=`{maxWidth: '300px'}`
      ).row.full-height.bg-black.gt-xs
      slot(name="menuDesktop")
    div(
      :style=`{maxWidth: '130px'}`
      ).row.fit.bg-black.gt-xs
      ws-menu
    .col.full-height
      ws-contents(v-if="$route.params.section === 'contents'")
      span(v-if="$route.params.section === 'compositions'").text-green Compositions
      span(v-if="$route.params.section === 'nodes'").text-green Nodes
      span(v-if="$route.params.section === 'settigs'").text-green Settings
    div(
      :style=`{maxWidth: '600px', borderLeft: '1px solid #4caf50'}`
      ).row.fit.items-start.content-start.bg-black
      node-editor
  //- footer
  q-footer.row.full-width.bg-black.lt-sm
    slot(name="menuMobile")
</template>

<script>
import wsContents from './ws_contents'
import wsContent from './ws_content'
import wsMenu from './ws_menu'
import nodeEditor from 'components/node/node_editor'

export default {
  name: 'workspaceIndex',
  components: {wsMenu, wsContent, wsContents, nodeEditor},
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
