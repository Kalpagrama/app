<template lang="pug">
div(
  @mouseenter="mouseIsOver = true"
  @mouseleave="mouseIsOver = false"
  :style=`{
    width: maxWidth+'px',
    maxWidth: $store.state.ui.panelMaxWidth+'px',
    background: 'rgba(50,50,50,0.9)',
    borderRadius: '10px',
    overflow: 'hidden',
  }`
  ).row.full-height
  div(
    :style=`{width: '50px'}`
    ).row.full-height.items-start.content-start.q-pa-sm
    q-btn(
      v-if="true"
      @click="opened = !opened"
      round flat dense color="white"
      :icon="opened ? 'keyboard_arrow_right' : 'keyboard_arrow_left'"
      )
    q-btn(
      v-for="(p,pi) in stateExplorer.pages" :key="p.id"
      @click="stateExplorer.set('pageId', p.id), opened = true"
      round flat dense
      :color="p.id === stateExplorer.pageId ? 'green' : 'white'"
      :icon="p.icon"
      :style=`{}`).full-width
  div(:style=`{overflow: 'hidden'}`).col.full-height
    component(
      :is="'meta-'+stateExplorer.pageId"
      :stateExplorer="stateExplorer")
</template>

<script>
import metaLayers from './meta_layers'
import metaNodes from './meta_nodes'

export default {
  name: 'contentMeta',
  components: {metaLayers, metaNodes},
  props: ['stateExplorer'],
  data () {
    return {
      mouseIsOver: false,
      opened: false,
      maxWidth: 50
    }
  },
  watch: {
    mouseIsOver: {
      handler (to, from) {
        this.$log('mouseIsOver TO', to)
        // if (to) {
        //   if (!this.opened) {
        //     this.opened = true
        //   }
        // }
      }
    },
    opened: {
      handler (to, from) {
        this.$log('opened TO', to)
        this.$tween.to(this, 0.3, {maxWidth: to ? 500 : 50})
      }
    }
  },
  methods: {}
}
</script>
