<style lang="stylus">
.q-drawer {
  background: none !important
}
.q-footer {
  background: none !important
}
</style>

<template lang="pug">
q-layout(view="hHh lpR fFf" :container="true" :style=`{height: '100vh', width: $q.screen.width+'px', maxWidth: '500px'}`).bg-grey-3
  q-dialog(ref="settingsDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    .row.full-width.justify-center.bg-grey-3
      div(:style=`{maxWidth: '500px'}`).row.full-width
        ws-settings(@close="$refs.settingsDialog.hide()")
  q-dialog(ref="spheresDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    .row.full-width.justify-center.bg-grey-3
      div(:style=`{maxWidth: '500px'}`).row.full-width
        ws-spheres(@close="$refs.spheresDialog.hide()")
  q-btn(
    round push icon="add" size="lg" color="green" @click="itemAdd()"
    :style=`{position: 'absolute', zIndex: 1000, bottom: '80px', right: '8px'}`)
  q-header
    div(:style=`{height: '60px', color: 'black'}`).row.full-width.items-center.bg-grey-3
      .col.full-height
        .row.fit.items-center.q-px-md
          span.text-bold {{$t('Workspace')}}
      div(:style=`{height: '60px'}`).row.items-center.justify-center.q-px-sm
        q-btn(round flat icon="style" color="grey-9" @click="$refs.spheresDialog.show()")
        q-btn(round flat icon="settings" color="grey-9" @click="$refs.settingsDialog.show()")
  q-page-container
    ws-items(@itemClick="itemClick" :height="$q.screen.height-60-60+'px'")
  q-footer
    k-menu-mobile
</template>

<script>
import wsItems from './ws_items'
import wsSpheres from './ws_spheres'
import wsSettings from './ws_settings'

export default {
  name: 'workspace',
  components: {wsItems, wsSpheres, wsSettings},
  props: [],
  data () {
    return {
    }
  },
  computed: {
  },
  methods: {
    itemClick ([type, item]) {
      this.$log('itemClick', type, item)
      this.$store.commit('workspace/stateSet', ['wsItem', {type, item}])
      this.$router.push('/create')
    },
    itemAdd () {
      this.$log('itemAdd')
      // TODO: need to know the kcoll
    },
    cancel () {
      this.$log('cancel')
    }
  }
}
</script>
