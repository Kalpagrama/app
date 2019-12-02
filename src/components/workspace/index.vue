<style lang="stylus">
.q-drawer {
  background: none !important
}
</style>

<template lang="pug">
.column.fit.bg-grey-3
  q-dialog(ref="wsCreateDialog" :maximized="true")
  //- header
  div(v-if="false" :style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
    span.text-bold {{ $t('Workspace') }}
  //- body
  .col.full-width
    k-colls(@coll="coll = $event" :coll="coll" :colls="colls" :header="false" :tabs="true" :actions="false" :style=`{height: height+'px'}`)
      template(v-slot:nodes)
        ws-nodes
      template(v-slot:spheres)
        ws-spheres
      template(v-slot:settings)
        ws-settings
  //- footer
  div(:style=`{height: '60px'}`).row.full-width.items-center
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
      q-btn(round flat icon="keyboard_arrow_left" @click="$router.back()")
    .col.full-height
      .row.fit.items-center.q-px-md
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
      q-btn(round color="accent" size="md" icon="add" @click="$refs.wsAddDialog.show()")
</template>

<script>
import wsNodes from './ws_nodes'
import wsSpheres from './ws_spheres'
import wsSettings from './ws_settings'

export default {
  name: 'workspace',
  components: {wsNodes, wsSpheres, wsSettings},
  props: {
    width: {type: Number},
    height: {type: Number}
  },
  data () {
    return {
      coll: 'nodes',
      colls: [
        {id: 'nodes', name: 'Nodes'},
        {id: 'spheres', name: 'Spheres'},
        {id: 'settings', name: 'Settings'}
      ]
    }
  },
  computed: {
    wsAddDialogOptions () {
      return {
        confirm: true,
        confirmName: 'Create node',
        actions: {
          addBookmark: {name: 'Add bookmark'},
          addFragment: {name: 'Add fragment'},
          addContent: {name: 'Add sphere'}
        }
      }
    }
  },
  methods: {
  }
}
</script>
