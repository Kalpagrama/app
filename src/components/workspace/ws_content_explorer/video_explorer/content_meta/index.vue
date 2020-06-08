<template lang="pug">
div(
  :style=`{
    maxWidth: maxWidth+'px',
    borderRadius: '10px',
    overflow: 'hidden',
  }`
  ).row.fit.b-50
  div(
    :style=`{width: '50px'}`
    ).row.full-height.items-start.content-start.q-pa-sm
    q-btn(
      v-if="false"
      @click="opened = !opened"
      round flat dense color="white" icon="keyboard_arrow_right"
      )
    q-btn(
      v-for="(p,pi) in stateExplorer.pages" :key="p.id"
      @click="stateExplorer.set('pageId', p.id)"
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
      opened: true,
      maxWidth: 500
    }
  },
  watch: {
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
