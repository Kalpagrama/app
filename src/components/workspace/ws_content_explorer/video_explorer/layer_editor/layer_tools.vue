<template lang="pug">
div(
  :style=`{
    borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden',
  }`
  ).row.full-width.q-px-xs
  //- left
  q-btn(round flat dense color="red" icon="delete_outline" @click="layerDelete()").q-mb-xs
  //- middle
  .col.full-height
    div(v-if="false").row.fit.items-end.content-end
      q-tabs(
        :value="stateLayerEditor.tabId" @input="stateLayerEditor.set('tabId', $event)"
        dense no-caps color="white"
        active-color="green"
        :style=`{}`
        ).full-width
        q-tab(
          v-for="(p,pi) in stateLayerEditor.tabs" :key="p.id"
          :name="p.id" :label="p.name"
          dense no-caps color="white"
          :style=`{color: 'rgb(180,180,180)'}`)
  //- right
  q-btn(round flat dense color="green" icon="check" @click="layerDone()").q-mb-xs
</template>

<script>
export default {
  name: 'layerTools',
  props: ['stateExplorer', 'stateLayerEditor'],
  data () {
    return {
    }
  },
  methods: {
    layerDone () {
      this.$log('layerDone')
      // this.stateExplorer.set('layerEditing', null)
      // this.stateExplorer.set('layerSelected', null)
    },
    layerDelete () {
      this.$log('layerDelete')
    }
  }
}
</script>
