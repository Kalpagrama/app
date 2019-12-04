<style lang="stylus">
.q-drawer {
  background: none !important
}
</style>

<template lang="pug">
  k-page(:noPan="true" :noFooter="false" :style=`{position: 'relative'}`).bg-grey-3
    template(v-slot:header)
      div(:style=`{height: '60px'}`).row.full-width.items-center
        //- div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
        //-   q-btn(round flat icon="keyboard_arrow_left" @click="$router.back()")
        .col.full-height
          .row.fit.items-center.q-px-md
            span.text-bold {{$t('Workspace')}}
        div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
          q-btn(round flat icon="settings" color="grey-9" @click="coll = 'settings'")
    template(v-slot:footer)
      k-menu-mobile
    q-dialog(ref="wsCreateDialog" :maximized="true")
    k-colls(@coll="coll = $event" :coll="coll" :colls="colls" :header="false" :tabs="true" :actions="false" :style=`{height: height-60+'px'}`)
      template(v-slot:nodes)
        ws-nodes
      template(v-slot:spheres)
        ws-spheres
      template(v-slot:settings)
        ws-settings
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
        {id: 'spheres', name: 'Spheres'},
        {id: 'nodes', name: 'Nodes'},
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
